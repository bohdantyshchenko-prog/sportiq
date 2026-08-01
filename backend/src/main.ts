import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { PrismaClient } from '@prisma/client';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import OpenAI from 'openai';
import webpush from 'web-push';
import { z } from 'zod';

const env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  APP_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_JWT_ISSUER: z.string().url(),
  SUPABASE_JWT_AUDIENCE: z.string().default('authenticated'),
  FOOTBALL_DATA_BASE_URL: z.string().url().default('https://api.football-data.org/v4'),
  FOOTBALL_DATA_TOKEN: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default('gpt-5-mini'),
  VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().min(1)
}).parse(process.env);

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const jwks = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

const app = Fastify({
  logger: true,
  requestTimeout: 12_000,
  bodyLimit: 256_000,
  trustProxy: true
});

await app.register(cors, { origin: env.APP_ORIGIN, credentials: true });
await app.register(helmet, { contentSecurityPolicy: false });

app.addHook('onRequest', async (request, reply) => {
  if (request.url === '/health' || request.url.startsWith('/public/')) return;
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return reply.code(401).send({ error: 'AUTH_REQUIRED' });
  try {
    const verified = await jwtVerify(token, jwks, {
      issuer: env.SUPABASE_JWT_ISSUER,
      audience: env.SUPABASE_JWT_AUDIENCE
    });
    request.user = { id: String(verified.payload.sub), email: String(verified.payload.email ?? '') };
  } catch {
    return reply.code(401).send({ error: 'INVALID_TOKEN' });
  }
});

declare module 'fastify' {
  interface FastifyRequest {
    user: { id: string; email: string };
  }
}

const sportsRequest = async (path: string) => {
  const response = await fetch(`${env.FOOTBALL_DATA_BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': env.FOOTBALL_DATA_TOKEN, Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000)
  });
  if (!response.ok) throw new Error(`SPORTS_PROVIDER_${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
};

const normalizeMatch = (match: any) => ({
  id: `fd-${match.id}`,
  provider: 'football-data',
  providerMatchId: String(match.id),
  tournament: match.competition?.name ?? 'Unknown',
  homeTeam: match.homeTeam?.name ?? 'Home',
  awayTeam: match.awayTeam?.name ?? 'Away',
  startsAt: match.utcDate,
  status: String(match.status ?? 'SCHEDULED').toLowerCase(),
  score: match.score ?? null,
  payload: match
});

app.get('/health', async () => ({ status: 'ok', version: '2.0.0', time: new Date().toISOString() }));

app.get('/v1/me', async (request) => {
  return prisma.profile.upsert({
    where: { id: request.user.id },
    update: { email: request.user.email },
    create: { id: request.user.id, email: request.user.email }
  });
});

app.get('/v1/matches', async (request) => {
  const query = z.object({ dateFrom: z.string().optional(), dateTo: z.string().optional() }).parse(request.query);
  const data = await sportsRequest(`/matches?dateFrom=${encodeURIComponent(query.dateFrom ?? new Date().toISOString().slice(0, 10))}&dateTo=${encodeURIComponent(query.dateTo ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))}`);
  const matches = Array.isArray((data as any).matches) ? (data as any).matches.map(normalizeMatch) : [];
  await Promise.all(matches.map((match: any) => prisma.match.upsert({
    where: { id: match.id }, update: match, create: match
  })));
  return { data: matches, source: 'football-data', generatedAt: new Date().toISOString() };
});

app.get('/v1/matches/:id', async (request, reply) => {
  const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) return reply.code(404).send({ error: 'MATCH_NOT_FOUND' });
  return match;
});

const thesisSchema = z.object({
  matchId: z.string().min(1), scenario: z.string().min(20).max(1200), reason: z.string().min(20).max(1200),
  risk: z.string().min(10).max(800), alternative: z.string().max(800).optional(), confidence: z.number().int().min(1).max(99)
});

app.post('/v1/theses', async (request) => {
  const input = thesisSchema.parse(request.body);
  return prisma.thesis.create({ data: { ...input, profileId: request.user.id } });
});

app.post('/v1/ai/briefing', async (request) => {
  const input = z.object({ matchId: z.string().min(1), locale: z.enum(['ru', 'ua', 'en']).default('ru') }).parse(request.body);
  const match = await prisma.match.findUniqueOrThrow({ where: { id: input.matchId } });
  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      { role: 'system', content: 'You are NOVIQ, a cautious sports reasoning assistant. Separate facts, signals, unknowns and confidence. Never present uncertain data as confirmed.' },
      { role: 'user', content: JSON.stringify({ locale: input.locale, match }) }
    ],
    text: { format: { type: 'json_schema', name: 'briefing', strict: true, schema: {
      type: 'object', additionalProperties: false,
      properties: {
        facts: { type: 'array', items: { type: 'string' } },
        signals: { type: 'array', items: { type: 'string' } },
        unknowns: { type: 'array', items: { type: 'string' } },
        confidence: { type: 'integer', minimum: 0, maximum: 100 },
        summary: { type: 'string' }
      }, required: ['facts', 'signals', 'unknowns', 'confidence', 'summary']
    } } }
  });
  return JSON.parse(response.output_text);
});

app.post('/v1/ai/review-thesis', async (request) => {
  const thesis = thesisSchema.parse(request.body);
  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    input: `Review this sports thesis for causality, evidence, risk, bias and calibration. Return concise JSON. ${JSON.stringify(thesis)}`,
    text: { format: { type: 'json_schema', name: 'review', strict: true, schema: {
      type: 'object', additionalProperties: false,
      properties: {
        specificity: { type: 'integer', minimum: 0, maximum: 100 }, evidence: { type: 'integer', minimum: 0, maximum: 100 },
        risk: { type: 'integer', minimum: 0, maximum: 100 }, calibration: { type: 'integer', minimum: 0, maximum: 100 },
        bias: { type: 'string' }, question: { type: 'string' }, alternative: { type: 'string' }
      }, required: ['specificity', 'evidence', 'risk', 'calibration', 'bias', 'question', 'alternative']
    } } }
  });
  return JSON.parse(response.output_text);
});

app.post('/v1/push/subscribe', async (request) => {
  const subscription = z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string(), auth: z.string() }), userAgent: z.string().optional() }).parse(request.body);
  return prisma.pushDevice.upsert({
    where: { endpoint: subscription.endpoint },
    update: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, userAgent: subscription.userAgent },
    create: { profileId: request.user.id, endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, userAgent: subscription.userAgent }
  });
});

app.post('/v1/push/test', async (request) => {
  const devices = await prisma.pushDevice.findMany({ where: { profileId: request.user.id } });
  const payload = JSON.stringify({ title: 'NOVIQ', body: 'Твой новый AI Briefing готов.', url: '/' });
  const results = await Promise.allSettled(devices.map(device => webpush.sendNotification({ endpoint: device.endpoint, keys: { p256dh: device.p256dh, auth: device.auth } }, payload)));
  return { delivered: results.filter(result => result.status === 'fulfilled').length, total: results.length };
});

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  if (error instanceof z.ZodError) return reply.code(400).send({ error: 'VALIDATION_ERROR', details: error.flatten() });
  return reply.code(500).send({ error: 'INTERNAL_ERROR' });
});

await app.listen({ port: env.PORT, host: '0.0.0.0' });
