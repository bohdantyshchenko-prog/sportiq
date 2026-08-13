(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const runtime = window.NOVIQ_RUNTIME_CONFIG || {};
  const STORAGE_KEY='noviq-auth-session-v2', LEGACY_KEY='noviq-auth-session';
  const supabaseUrl=String(runtime.supabaseUrl||'').replace(/\/$/,'');
  const anonKey=String(runtime.supabaseAnonKey||'');
  const appUrl=String(runtime.appUrl||location.origin+location.pathname).replace(/\/$/,'');
  const normalizeEmail=value=>String(value||'').trim().toLowerCase();
  const configured=()=>Boolean(supabaseUrl&&anonKey);
  const emit=detail=>window.dispatchEvent(new CustomEvent('noviq:auth',{detail}));
  const decodePayload=token=>{try{const body=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');const pad=body+'='.repeat((4-body.length%4)%4);return JSON.parse(decodeURIComponent(atob(pad).split('').map(char=>`%${char.charCodeAt(0).toString(16).padStart(2,'0')}`).join('')));}catch{return null;}};
  const usableSession=session=>Boolean(session?.accessToken&&session?.refreshToken);
  const persist=session=>{N.session=session||null;if(session)localStorage.setItem(STORAGE_KEY,JSON.stringify(session));else{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY);}emit({session:N.session,pendingConfirmation:false});return N.session;};
  const savePayload=payload=>{if(!payload?.access_token){emit({session:null,pendingConfirmation:Boolean(payload?.user)});return null;}const decoded=decodePayload(payload.access_token)||{};const expiresAt=decoded.exp?Number(decoded.exp)*1000:Date.now()+Number(payload.expires_in||3600)*1000;return persist({version:2,accessToken:payload.access_token,refreshToken:payload.refresh_token,expiresAt,user:payload.user||{id:decoded.sub,email:decoded.email||null}});};
  const request=async(path,options={})=>{if(!configured())throw Object.assign(new Error('SUPABASE_NOT_CONFIGURED'),{code:'SUPABASE_NOT_CONFIGURED'});const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),Number(runtime.requestTimeoutMs||8000));try{const response=await fetch(`${supabaseUrl}/auth/v1${path}`,{method:options.method||'POST',headers:{apikey:anonKey,Authorization:`Bearer ${options.token||anonKey}`,Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{})},body:options.body?JSON.stringify(options.body):undefined,credentials:'omit',cache:'no-store',signal:controller.signal});const payload=await response.json().catch(()=>({}));if(!response.ok){const code=payload.code||payload.error_code||'AUTH_FAILED';throw Object.assign(new Error(payload.msg||payload.error_description||payload.message||code),{status:response.status,code});}return payload;}catch(error){if(error?.name==='AbortError')throw Object.assign(new Error('AUTH_TIMEOUT'),{code:'AUTH_TIMEOUT'});throw error;}finally{clearTimeout(timeout);}};
  const consumeRedirect=()=>{const hash=new URLSearchParams(location.hash.replace(/^#/,''));const accessToken=hash.get('access_token'),refreshToken=hash.get('refresh_token');if(!accessToken||!refreshToken)return null;const type=hash.get('type')||'';const session=savePayload({access_token:accessToken,refresh_token:refreshToken,expires_in:Number(hash.get('expires_in')||3600)});N.authRedirect={type};history.replaceState({},document.title,location.pathname+location.search.replace(/([?&])auth=[^&]+(&|$)/,'$1').replace(/[?&]$/,''));window.dispatchEvent(new CustomEvent('noviq:auth-redirect',{detail:{type}}));return{session,type};};

  N.auth={
    configured,
    restore(){let stored=null;try{stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||localStorage.getItem(LEGACY_KEY)||'null');}catch{}if(stored?.access_token)stored={version:2,accessToken:stored.access_token,refreshToken:stored.refresh_token,expiresAt:stored.expiresAt,user:stored.user||null};N.session=usableSession(stored)?stored:null;if(!N.session){localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY);}return N.session;},
    async signIn(email,password){const normalized=normalizeEmail(email);if(!normalized||String(password||'').length<8)throw Object.assign(new Error('INVALID_CREDENTIAL_INPUT'),{code:'INVALID_CREDENTIAL_INPUT'});return savePayload(await request('/token?grant_type=password',{body:{email:normalized,password}}));},
    async signUp(email,password,displayName=''){const normalized=normalizeEmail(email);if(!normalized||String(password||'').length<8)throw Object.assign(new Error('PASSWORD_TOO_SHORT'),{code:'PASSWORD_TOO_SHORT'});const payload=await request('/signup',{body:{email:normalized,password,data:{display_name:String(displayName||'').trim().slice(0,80)},email_redirect_to:appUrl}});return{session:savePayload(payload),user:payload.user||null,pendingConfirmation:!payload.access_token};},
    async recover(email){const normalized=normalizeEmail(email);if(!normalized)throw Object.assign(new Error('EMAIL_REQUIRED'),{code:'EMAIL_REQUIRED'});await request('/recover',{body:{email:normalized,redirect_to:appUrl}});return true;},
    async updatePassword(password){if(String(password||'').length<8)throw Object.assign(new Error('PASSWORD_TOO_SHORT'),{code:'PASSWORD_TOO_SHORT'});const token=(await this.refresh())?.accessToken;if(!token)throw Object.assign(new Error('AUTH_REQUIRED'),{code:'AUTH_REQUIRED'});await request('/user',{method:'PUT',token,body:{password}});return true;},
    async refresh(force=false){const session=N.session||this.restore();if(!session?.refreshToken||!configured())return session||null;if(!force&&Number(session.expiresAt||0)-Date.now()>120_000)return session;try{return savePayload(await request('/token?grant_type=refresh_token',{body:{refresh_token:session.refreshToken}}));}catch(error){if([400,401,403].includes(Number(error?.status)))persist(null);throw error;}},
    async signOut(){const token=N.session?.accessToken;if(token&&configured())await request('/logout',{token}).catch(()=>undefined);persist(null);},
    user(){return N.session?.user||decodePayload(N.session?.accessToken||'')||null;},
    async accessToken(){return(await this.refresh())?.accessToken||null;},
    consumeRedirect
  };

  N.auth.restore();
  const redirect=consumeRedirect();
  if(N.session&&!redirect)N.auth.refresh().catch(()=>undefined);
  const refreshVisible=()=>{if(document.visibilityState==='visible')N.auth.refresh().catch(()=>undefined);};
  setInterval(refreshVisible,60_000);document.addEventListener('visibilitychange',refreshVisible);
})();
