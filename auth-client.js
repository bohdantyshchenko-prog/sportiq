(() => {
  'use strict';

  const N = window.NOVIQ = window.NOVIQ || {};
  const runtime = window.NOVIQ_RUNTIME_CONFIG || {};
  const STORAGE_KEY = 'noviq-auth-session-v2';
  const LEGACY_KEY = 'noviq-auth-session';
  const supabaseUrl = String(runtime.supabaseUrl || '').replace(/\/$/, '');
  const anonKey = String(runtime.supabaseAnonKey || '');
  const appUrl = String(runtime.appUrl || `${location.origin}${location.pathname}`).replace(/\/$/, '');

  const normalizeEmail = value => String(value || '').trim().toLowerCase();
  const configured = () => Boolean(supabaseUrl && anonKey);
  const emit = detail => window.dispatchEvent(new CustomEvent('noviq:auth', { detail }));

  const decodePayload = token => {
    try {
      const body = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = body + '='.repeat((4 - body.length % 4) % 4);
      return JSON.parse(decodeURIComponent(
        atob(padded)
          .split('')
          .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      ));
    } catch {
      return null;
    }
  };

  const usableSession = session => Boolean(
    session?.accessToken &&
    session?.refreshToken &&
    Number.isFinite(Number(session.expiresAt))
  );

  const persist = (session, reason = 'session') => {
    N.session = session || null;
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_KEY);
    }
    emit({ session: N.session, pendingConfirmation: false, reason });
    return N.session;
  };

  const savePayload = (payload, reason = 'session') => {
    if (!payload?.access_token) {
      emit({ session: null, pendingConfirmation: Boolean(payload?.user), reason });
      return null;
    }
    const decoded = decodePayload(payload.access_token) || {};
    const expiresAt = decoded.exp
      ? Number(decoded.exp) * 1000
      : Date.now() + Number(payload.expires_in || 3600) * 1000;
    return persist({
      version: 2,
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt,
      user: payload.user || {
        id: decoded.sub || null,
        email: decoded.email || null,
        user_metadata: decoded.user_metadata || {}
      }
    }, reason);
  };

  const request = async (path, options = {}) => {
    if (!configured()) {
      throw Object.assign(new Error('SUPABASE_NOT_CONFIGURED'), { code: 'SUPABASE_NOT_CONFIGURED' });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(runtime.requestTimeoutMs || 8000));
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
        method: options.method || 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${options.token || anonKey}`,
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const code = payload.code || payload.error_code || 'AUTH_FAILED';
        throw Object.assign(
          new Error(payload.msg || payload.error_description || payload.message || code),
          { status: response.status, code }
        );
      }
      return payload;
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw Object.assign(new Error('AUTH_TIMEOUT'), { code: 'AUTH_TIMEOUT' });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };

  const clearAuthUrl = () => {
    const clean = `${location.pathname}${location.search}`;
    history.replaceState({}, document.title, clean || '/');
  };

  const consumeRedirect = () => {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const errorCode = hash.get('error_code');
    const errorDescription = hash.get('error_description');
    if (errorCode || errorDescription) {
      N.authRedirect = {
        type: hash.get('type') || 'error',
        error: errorCode || 'AUTH_REDIRECT_ERROR',
        description: errorDescription || ''
      };
      clearAuthUrl();
      window.dispatchEvent(new CustomEvent('noviq:auth-redirect', { detail: N.authRedirect }));
      return N.authRedirect;
    }

    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    if (!accessToken || !refreshToken) return null;

    const type = hash.get('type') || 'confirmed';
    const session = savePayload({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: Number(hash.get('expires_in') || 3600)
    }, 'redirect');
    N.authRedirect = { type, session: Boolean(session) };
    clearAuthUrl();
    window.dispatchEvent(new CustomEvent('noviq:auth-redirect', { detail: N.authRedirect }));
    return N.authRedirect;
  };

  N.auth = {
    configured,

    restore() {
      let stored = null;
      try {
        stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY) || 'null');
      } catch {}
      if (stored?.access_token) {
        stored = {
          version: 2,
          accessToken: stored.access_token,
          refreshToken: stored.refresh_token,
          expiresAt: stored.expiresAt,
          user: stored.user || null
        };
      }
      N.session = usableSession(stored) ? stored : null;
      if (!N.session) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_KEY);
      }
      return N.session;
    },

    async signIn(email, password) {
      const normalized = normalizeEmail(email);
      if (!normalized || String(password || '').length < 8) {
        throw Object.assign(new Error('INVALID_CREDENTIAL_INPUT'), { code: 'INVALID_CREDENTIAL_INPUT' });
      }
      return savePayload(await request('/token?grant_type=password', {
        body: { email: normalized, password }
      }), 'signin');
    },

    async signUp(email, password, displayName = '') {
      const normalized = normalizeEmail(email);
      if (!normalized || String(password || '').length < 8) {
        throw Object.assign(new Error('PASSWORD_TOO_SHORT'), { code: 'PASSWORD_TOO_SHORT' });
      }
      const redirect = encodeURIComponent(appUrl);
      const payload = await request(`/signup?redirect_to=${redirect}`, {
        body: {
          email: normalized,
          password,
          data: { display_name: String(displayName || '').trim().slice(0, 80) }
        }
      });
      return {
        session: savePayload(payload, 'signup'),
        user: payload.user || null,
        pendingConfirmation: !payload.access_token
      };
    },

    async recover(email) {
      const normalized = normalizeEmail(email);
      if (!normalized) throw Object.assign(new Error('EMAIL_REQUIRED'), { code: 'EMAIL_REQUIRED' });
      const redirect = encodeURIComponent(appUrl);
      await request(`/recover?redirect_to=${redirect}`, { body: { email: normalized } });
      return true;
    },

    async updatePassword(password) {
      if (String(password || '').length < 8) {
        throw Object.assign(new Error('PASSWORD_TOO_SHORT'), { code: 'PASSWORD_TOO_SHORT' });
      }
      const token = (await this.refresh())?.accessToken;
      if (!token) throw Object.assign(new Error('AUTH_REQUIRED'), { code: 'AUTH_REQUIRED' });
      await request('/user', { method: 'PUT', token, body: { password: String(password) } });
      return true;
    },

    async refresh(force = false) {
      const session = N.session || this.restore();
      if (!session?.refreshToken || !configured()) return session || null;
      if (!force && Number(session.expiresAt || 0) - Date.now() > 120_000) return session;
      try {
        return savePayload(await request('/token?grant_type=refresh_token', {
          body: { refresh_token: session.refreshToken }
        }), 'refresh');
      } catch (error) {
        if ([400, 401, 403].includes(Number(error?.status))) persist(null, 'expired');
        throw error;
      }
    },

    async signOut() {
      const token = N.session?.accessToken;
      if (token && configured()) await request('/logout', { token }).catch(() => undefined);
      persist(null, 'signout');
    },

    user() {
      return N.session?.user || decodePayload(N.session?.accessToken || '') || null;
    },

    async accessToken() {
      return (await this.refresh())?.accessToken || null;
    },

    consumeRedirect
  };

  N.auth.restore();
  const redirect = consumeRedirect();
  if (N.session && !redirect) N.auth.refresh().catch(() => undefined);

  const refreshVisible = () => {
    if (document.visibilityState === 'visible') N.auth.refresh().catch(() => undefined);
  };
  setInterval(refreshVisible, 60_000);
  document.addEventListener('visibilitychange', refreshVisible);
})();