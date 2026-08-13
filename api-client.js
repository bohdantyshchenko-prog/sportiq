(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const runtime = window.NOVIQ_RUNTIME_CONFIG || {};
  class ApiError extends Error {
    constructor(message, details = {}) { super(message); this.name='ApiError'; this.status=details.status||0; this.code=details.code||'API_ERROR'; this.retryable=Boolean(details.retryable); this.requestId=details.requestId||''; }
  }
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const baseUrl = () => String(runtime.apiBaseUrl || N.config?.apiBaseUrl || '').replace(/\/$/, '');
  N.api = {
    ApiError,
    configured: () => Boolean(baseUrl()),
    async request(path, options = {}) {
      if (!baseUrl()) throw new ApiError('API endpoint is not configured', { code:'API_NOT_CONFIGURED' });
      const method=options.method||'GET'; const retries=Number.isInteger(options.retries)?options.retries:1; const timeoutMs=options.timeoutMs||Number(runtime.requestTimeoutMs||8000); let refreshed=false; let lastError;
      for(let attempt=0;attempt<=retries;attempt+=1){
        const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeoutMs);
        try{
          const token=await N.auth?.accessToken?.();
          const headers={Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})};
          const response=await fetch(`${baseUrl()}${path}`,{method,headers,body:options.body?JSON.stringify(options.body):undefined,credentials:'omit',cache:'no-store',signal:controller.signal});
          const contentType=response.headers.get('content-type')||''; const payload=contentType.includes('application/json')?await response.json():await response.text();
          if(response.status===401&&!refreshed&&N.auth?.configured?.()){refreshed=true;await N.auth.refresh(true);attempt-=1;continue;}
          if(!response.ok) throw new ApiError(payload?.message||payload?.error||`Request failed with ${response.status}`,{status:response.status,code:payload?.code||payload?.error||'HTTP_ERROR',retryable:response.status>=500||response.status===429,requestId:response.headers.get('x-request-id')||''});
          return payload;
        }catch(error){lastError=error?.name==='AbortError'?new ApiError('Request timed out',{code:'TIMEOUT',retryable:true}):error;if(attempt>=retries||!lastError?.retryable)break;await sleep(250*(2**attempt));}
        finally{clearTimeout(timer);}
      }
      throw lastError;
    },
    health(){return this.request('/health',{retries:0,timeoutMs:3000});}, readiness(){return this.request('/ready',{retries:0,timeoutMs:3000});},
    me(){return this.request('/v1/me');}, updateProfile(profile){return this.request('/v1/me',{method:'PATCH',body:profile});}, deleteMyData(){return this.request('/v1/me/data',{method:'DELETE'});},
    bootstrap(){return this.request('/v1/bootstrap');}, sync(payload){return this.request('/v1/sync',{method:'POST',body:payload,retries:0});}, memory(){return this.request('/v1/memory');},
    matches(params={}){const query=new URLSearchParams(Object.entries(params).filter(([,v])=>v!=null&&v!=='')).toString();return this.request(`/v1/matches${query?`?${query}`:''}`);},
    match(id){return this.request(`/v1/matches/${encodeURIComponent(id)}`);}, briefing(matchId,locale='ru'){return this.request('/v1/ai/briefing',{method:'POST',body:{matchId,locale}});},
    createThesis(thesis){return this.request('/v1/theses',{method:'POST',body:thesis});}, createReplay(replay){return this.request('/v1/replays',{method:'POST',body:replay});},
    reviewThesis(thesis){return this.request('/v1/ai/review-thesis',{method:'POST',body:thesis});}, ask(question,context={}){return this.request('/v1/ai/ask',{method:'POST',body:{question,context}});}
  };
})();
