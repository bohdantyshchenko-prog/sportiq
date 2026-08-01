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

  const save = session => {
    N.session = session ? { accessToken: session.access_token, refreshToken: session.refresh_token, expiresAt: Date.now() + Number(session.expires_in || 0) * 1000, user: session.user || null } : null;
    if (N.session) localStorage.setItem(storageKey, JSON.stringify(N.session)); else localStorage.removeItem(storageKey);
    window.dispatchEvent(new CustomEvent('noviq:auth', { detail: { session: N.session } }));
    return N.session;
  };

  const request = async (path, options = {}) => {
    if (!supabaseUrl || !anonKey) throw new Error('SUPABASE_NOT_CONFIGURED');
    const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
      method: options.method || 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
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
        N.session = stored && stored.accessToken ? stored : null;
      } catch { N.session = null; }
      return N.session;
    },
    async signIn(email, password) { return save(await request('/token?grant_type=password', { body: { email, password } })); },
    async signUp(email, password) { return save(await request('/signup', { body: { email, password } })); },
    async refresh(force = false) {
      const session = N.session || this.restore();
      if (!session?.refreshToken) return null;
      if (!force && session.expiresAt - Date.now() > 60_000) return session;
      return save(await request('/token?grant_type=refresh_token', { body: { refresh_token: session.refreshToken } }));
    },
    async signOut() {
      const token = N.session?.accessToken;
      if (token && this.configured()) {
        await fetch(`${supabaseUrl}/auth/v1/logout`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }).catch(() => undefined);
      }
      save(null);
    },
    user() { return N.session?.user || decodePayload(N.session?.accessToken || '') || null; }
  };

  N.auth.restore();
  setInterval(() => { if (document.visibilityState === 'visible') N.auth.refresh().catch(() => undefined); }, 45_000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') N.auth.refresh().catch(() => undefined); });
})();
