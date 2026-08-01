(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};
  const runtime = window.NOVIQ_RUNTIME_CONFIG || {};
  const storageKey = 'noviq-auth-session';
  const supabaseUrl = String(runtime.supabaseUrl || '').replace(/\/$/, '');
  const anonKey = String(runtime.supabaseAnonKey || '');

  const decodePayload = token => {
    try {
      const body = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(body).split('').map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')));
    } catch { return null; }
  };

  const save = payload => {
    if (!payload?.access_token) {
      N.session = null;
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new CustomEvent('noviq:auth', { detail: { session: null, pendingConfirmation: Boolean(payload?.user) } }));
      return null;
    }
    N.session = { accessToken: payload.access_token, refreshToken: payload.refresh_token, expiresAt: Date.now() + Number(payload.expires_in || 0) * 1000, user: payload.user || null };
    localStorage.setItem(storageKey, JSON.stringify(N.session));
    window.dispatchEvent(new CustomEvent('noviq:auth', { detail: { session: N.session, pendingConfirmation: false } }));
    return N.session;
  };

  const request = async (path, options = {}) => {
    if (!supabaseUrl || !anonKey) throw new Error('SUPABASE_NOT_CONFIGURED');
    const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
      method: options.method || 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${options.token || anonKey}`, 'Content-Type': 'application/json' },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(10_000)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(payload.msg || payload.error_description || payload.message || 'AUTH_FAILED'), { status: response.status, payload });
    return payload;
  };

  N.auth = {
    configured: () => Boolean(supabaseUrl && anonKey),
    restore() {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
        N.session = stored && stored.accessToken && stored.refreshToken ? stored : null;
      } catch { N.session = null; }
      return N.session;
    },
    async signIn(email, password) { return save(await request('/token?grant_type=password', { body: { email: String(email).trim().toLowerCase(), password } })); },
    async signUp(email, password) {
      const payload = await request('/signup', { body: { email: String(email).trim().toLowerCase(), password } });
      return { session: save(payload), user: payload.user || null, pendingConfirmation: !payload.access_token };
    },
    async refresh(force = false) {
      const session = N.session || this.restore();
      if (!session?.refreshToken) return null;
      if (!force && session.expiresAt - Date.now() > 60_000) return session;
      try { return save(await request('/token?grant_type=refresh_token', { body: { refresh_token: session.refreshToken } })); }
      catch (error) { if (error?.status === 400 || error?.status === 401) save(null); throw error; }
    },
    async signOut() {
      const token = N.session?.accessToken;
      if (token && this.configured()) await request('/logout', { token }).catch(() => undefined);
      save(null);
    },
    user() { return N.session?.user || decodePayload(N.session?.accessToken || '') || null; }
  };

  N.auth.restore();
  setInterval(() => { if (document.visibilityState === 'visible') N.auth.refresh().catch(() => undefined); }, 45_000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') N.auth.refresh().catch(() => undefined); });
})();
