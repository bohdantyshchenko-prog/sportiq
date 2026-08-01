import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient, Prisma } from '@prisma/client';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import OpenAI from 'openai';
import webpush from 'web-push';
import { z } from 'zod';

const VERSION = '3.3.0';
const env = z.object({
  NODE_ENV:z.enum(['development','test','production']).default('development'), PORT:z.coerce.number().int().positive().default(8080),
  APP_ORIGIN:z.string().url(), DATABASE_URL:z.string().min(1), SUPABASE_URL:z.string().url(), SUPABASE_JWT_ISSUER:z.string().url(),
  SUPABASE_JWT_AUDIENCE:z.string().default('authenticated'), FOOTBALL_DATA_BASE_URL:z.string().url().default('https://api.football-data.org/v4'),
  FOOTBALL_DATA_TOKEN:z.string().min(1), OPENAI_API_KEY:z.string().min(1), OPENAI_MODEL:z.string().default('gpt-5-mini'),
  VAPID_PUBLIC_KEY:z.string().min(1), VAPID_PRIVATE_KEY:z.string().min(1), VAPID_SUBJECT:z.string().min(1)
}).parse(process.env);

const prisma=new PrismaClient();
const openai=new OpenAI({apiKey:env.OPENAI_API_KEY,timeout:15_000,maxRetries:2});
const jwks=createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
webpush.setVapidDetails(env.VAPID_SUBJECT,env.VAPID_PUBLIC_KEY,env.VAPID_PRIVATE_KEY);
const app=Fastify({logger:true,requestTimeout:15_000,bodyLimit:256_000,trustProxy:true,genReqId:request=>String(request.headers['x-request-id']||crypto.randomUUID()),disableRequestLogging:env.NODE_ENV==='production'});

await app.register(cors,{origin:env.APP_ORIGIN,credentials:true,methods:['GET','POST','PATCH','DELETE','OPTIONS']});
await app.register(helmet,{contentSecurityPolicy:false,crossOriginResourcePolicy:{policy:'same-site'}});
await app.register(rateLimit,{max:120,timeWindow:'1 minute',keyGenerator:request=>request.user?.id||request.ip});
app.addHook('onSend',async(request,reply,payload)=>{reply.header('x-request-id',request.id).header('cache-control','no-store');return payload;});
app.addHook('onRequest',async(request,reply)=>{
  if(request.url==='/health'||request.url==='/ready')return;
  const token=request.headers.authorization?.replace(/^Bearer\s+/i,'');
  if(!token)return reply.code(401).send({error:'AUTH_REQUIRED'});
  try{const verified=await jwtVerify(token,jwks,{issuer:env.SUPABASE_JWT_ISSUER,audience:env.SUPABASE_JWT_AUDIENCE});if(!verified.payload.sub)throw new Error('MISSING_SUB');request.user={id:verified.payload.sub,email:typeof verified.payload.email==='string'?verified.payload.email:null};}
  catch{return reply.code(401).send({error:'INVALID_TOKEN'});}
});
declare module 'fastify'{interface FastifyRequest{user:{id:string;email:string|null};}}

const sportsRequest=async(path:string)=>{const response=await fetch(`${env.FOOTBALL_DATA_BASE_URL}${path}`,{headers:{'X-Auth-Token':env.FOOTBALL_DATA_TOKEN,Accept:'application/json'},signal:AbortSignal.timeout(8_000)});if(!response.ok){const error=Object.assign(new Error(`SPORTS_PROVIDER_${response.status}`),{statusCode:response.status===429?503:502});throw error;}return response.json() as Promise<Record<string,unknown>>;};
const normalizeMatch=(match:any):Prisma.MatchUncheckedCreateInput=>({id:`fd-${String(match.id)}`,provider:'football-data',providerMatchId:String(match.id),tournament:String(match.competition?.name??'Unknown'),homeTeam:String(match.homeTeam?.name??'Home'),awayTeam:String(match.awayTeam?.name??'Away'),startsAt:new Date(match.utcDate),status:String(match.status??'SCHEDULED').toLowerCase(),payload:match as Prisma.InputJsonValue});
const thesisSchema=z.object({matchId:z.string().min(1),scenario:z.string().min(20).max(1200),reason:z.string().min(20).max(1200),risk:z.string().min(10).max(800),alternative:z.string().max(800).optional(),confidence:z.number().int().min(1).max(99)});
const briefingSchema={type:'object',additionalProperties:false,properties:{facts:{type:'array',items:{type:'string'}},signals:{type:'array',items:{type:'string'}},unknowns:{type:'array',items:{type:'string'}},confidence:{type:'integer',minimum:0,maximum:100},summary:{type:'string'}},required:['facts','signals','unknowns','confidence','summary']} as const;

app.get('/health',async()=>({status:'ok',version:VERSION,time:new Date().toISOString()}));
app.get('/ready',async(_request,reply)=>{try{await prisma.$queryRaw`SELECT 1`;return{status:'ready',version:VERSION};}catch{return reply.code(503).send({status:'not_ready',version:VERSION});}});
app.get('/v1/me',async request=>prisma.profile.upsert({where:{id:request.user.id},update:{email:request.user.email},create:{id:request.user.id,email:request.user.email}}));

app.get('/v1/matches',async(request,reply)=>{
  const date=/^\d{4}-\d{2}-\d{2}$/;const query=z.object({dateFrom:z.string().regex(date).optional(),dateTo:z.string().regex(date).optional()}).parse(request.query);
  const from=query.dateFrom??new Date().toISOString().slice(0,10);const to=query.dateTo??new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  const fromDate=new Date(`${from}T00:00:00Z`);const toDate=new Date(`${to}T00:00:00Z`);
  if(fromDate>toDate||toDate.getTime()-fromDate.getTime()>31*86400000)return reply.code(400).send({error:'INVALID_DATE_RANGE'});
  const data=await sportsRequest(`/matches?dateFrom=${encodeURIComponent(from)}&dateTo=${encodeURIComponent(to)}`);
  const matches=Array.isArray((data as any).matches)?(data as any).matches.map(normalizeMatch):[];
  for(const match of matches)await prisma.match.upsert({where:{id:match.id},update:match,create:match});
  return{data:matches,source:'football-data',generatedAt:new Date().toISOString()};
});
app.get('/v1/matches/:id',async(request,reply)=>{const{id}=z.object({id:z.string().min(1)}).parse(request.params);const match=await prisma.match.findUnique({where:{id}});return match??reply.code(404).send({error:'MATCH_NOT_FOUND'});});

app.post('/v1/theses',{config:{rateLimit:{max:30,timeWindow:'1 minute'}}},async request=>{const input=thesisSchema.parse(request.body);const match=await prisma.match.findUnique({where:{id:input.matchId},select:{id:true}});if(!match)throw Object.assign(new Error('MATCH_NOT_FOUND'),{statusCode:404});return prisma.thesis.create({data:{...input,profileId:request.user.id}});});
app.get('/v1/theses',async request=>prisma.thesis.findMany({where:{profileId:request.user.id},orderBy:{createdAt:'desc'},take:100}));
app.post('/v1/ai/briefing',{config:{rateLimit:{max:12,timeWindow:'1 minute'}}},async request=>{const input=z.object({matchId:z.string().min(1),locale:z.enum(['ru','ua','en']).default('ru')}).parse(request.body);const match=await prisma.match.findUnique({where:{id:input.matchId}});if(!match)throw Object.assign(new Error('MATCH_NOT_FOUND'),{statusCode:404});const response=await openai.responses.create({model:env.OPENAI_MODEL,input:[{role:'system',content:'You are NOVIQ. Separate confirmed facts, derived signals, unknowns and confidence. Never invent injuries, lineups or statistics.'},{role:'user',content:JSON.stringify({locale:input.locale,match})}],text:{format:{type:'json_schema',name:'briefing',strict:true,schema:briefingSchema}}});return JSON.parse(response.output_text);});
app.post('/v1/ai/review-thesis',{config:{rateLimit:{max:12,timeWindow:'1 minute'}}},async request=>{const thesis=thesisSchema.parse(request.body);const response=await openai.responses.create({model:env.OPENAI_MODEL,input:`Review this sports thesis for causality, evidence, risk, bias and calibration. ${JSON.stringify(thesis)}`,text:{format:{type:'json_schema',name:'review',strict:true,schema:{type:'object',additionalProperties:false,properties:{specificity:{type:'integer',minimum:0,maximum:100},evidence:{type:'integer',minimum:0,maximum:100},risk:{type:'integer',minimum:0,maximum:100},calibration:{type:'integer',minimum:0,maximum:100},bias:{type:'string'},question:{type:'string'},alternative:{type:'string'}},required:['specificity','evidence','risk','calibration','bias','question','alternative']}}}});return JSON.parse(response.output_text);});
app.post('/v1/ai/ask',{config:{rateLimit:{max:12,timeWindow:'1 minute'}}},async request=>{const input=z.object({question:z.string().min(3).max(1000),context:z.record(z.unknown()).default({})}).parse(request.body);const response=await openai.responses.create({model:env.OPENAI_MODEL,input:[{role:'system',content:'Answer as NOVIQ. Be concise, separate verified facts from inference, and explicitly state unknowns.'},{role:'user',content:JSON.stringify(input)}]});return{answer:response.output_text};});
app.post('/v1/push/subscribe',async request=>{const s=z.object({endpoint:z.string().url(),keys:z.object({p256dh:z.string().min(1),auth:z.string().min(1)}),userAgent:z.string().max(500).optional()}).parse(request.body);return prisma.pushDevice.upsert({where:{endpoint:s.endpoint},update:{profileId:request.user.id,p256dh:s.keys.p256dh,auth:s.keys.auth,userAgent:s.userAgent},create:{profileId:request.user.id,endpoint:s.endpoint,p256dh:s.keys.p256dh,auth:s.keys.auth,userAgent:s.userAgent}});});
app.post('/v1/push/test',{config:{rateLimit:{max:3,timeWindow:'1 minute'}}},async request=>{
  const devices=await prisma.pushDevice.findMany({where:{profileId:request.user.id}});const payload=JSON.stringify({title:'NOVIQ',body:'Твой новый AI Briefing готов.',url:'/'});
  const results=await Promise.all(devices.map(async device=>{try{await webpush.sendNotification({endpoint:device.endpoint,keys:{p256dh:device.p256dh,auth:device.auth}},payload);return true;}catch(error){const status=Number((error as{statusCode?:number}).statusCode);if(status===404||status===410)await prisma.pushDevice.delete({where:{id:device.id}}).catch(()=>undefined);return false;}}));
  return{delivered:results.filter(Boolean).length,total:results.length};
});

app.setErrorHandler((error,request,reply)=>{app.log.error({error,requestId:request.id});if(error instanceof z.ZodError)return reply.code(400).send({error:'VALIDATION_ERROR',details:error.flatten()});const status=Number((error as{statusCode?:number}).statusCode)||500;const message=error instanceof Error?error.message:'REQUEST_FAILED';return reply.code(status).send({error:status===500?'INTERNAL_ERROR':message});});
const shutdown=async(signal:string)=>{app.log.info({signal},'Shutting down');await app.close();await prisma.$disconnect();process.exit(0);};
process.once('SIGTERM',()=>void shutdown('SIGTERM'));process.once('SIGINT',()=>void shutdown('SIGINT'));
await prisma.$connect();await app.listen({port:env.PORT,host:'0.0.0.0'});
