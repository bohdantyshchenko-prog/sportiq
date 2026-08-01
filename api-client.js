(() => {
  'use strict';
  const N = window.NOVIQ = window.NOVIQ || {};

  class ApiError extends Error {
    constructor(message, details = {}) {
      super(message);
      this.name = 'ApiError';
      this.status = details.status || 0;
      this.code = details.code || 'API_ERROR';
      this.retryable = Boolean(details.retryable);
      this.requestId = details.requestId || '';
    }
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const withTimeout = (factory, timeoutMs) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return factory(controller.signal).finally(() => clearTimeout(timeout));
  };

  N.api = {
    ApiError,
    async request(path, options = {}) {
      const baseUrl = String(N.config.apiBaseUrl || '').replace(/\/$/, '');
      if (!baseUrl) throw new ApiError('API endpoint is not configured', { code: 'API_NOT_CONFIGURED' });

      const method = options.method || 'GET';
      const retries = Number.isInteger(options.retries) ? options.retries : 1;
      const timeoutMs = options.timeoutMs || N.config.requestTimeoutMs || 8000;
      const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
      const token = N.session?.accessToken;
      if (token) headers.Authorization = `Bearer ${token}`;

      let lastError;
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const response = await withTimeout(signal => fetch(`${baseUrl}${path}`, {
            method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            credentials: 'omit',
            signal
          }), timeoutMs);
          const contentType = response.headers.get('content-type') || '';
          const payload = contentType.includes('application/json') ? await response.json() : await response.text();
          if (!response.ok) {
            throw new ApiError(payload?.message || payload?.error || `Request failed with ${response.status}`, {
              status: response.status,
              code: payload?.code || payload?.error || 'HTTP_ERROR',
              retryable: response.status >= 500 || response.status === 429,
              requestId: response.headers.get('x-request-id') || ''
            });
          }
          return payload;
        } catch (error) {
          lastError = error?.name === 'AbortError'
            ? new ApiError('Request timed out', { code: 'TIMEOUT', retryable: true })
            : error;
          if (attempt >= retries || !lastError?.retryable) break;
          await sleep(300 * (2 ** attempt));
        }
      }
      throw lastError;
    },
    health() { return this.request('/health', { retries: 0, timeoutMs: 3000 }); },
    readiness() { return this.request('/ready', { retries: 0, timeoutMs: 3000 }); },
    me() { return this.request('/v1/me'); },
    matches(params = {}) {
      const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value != null && value !== '')).toString();
      return this.request(`/v1/matches${query ? `?${query}` : ''}`);
    },
    match(id) { return this.request(`/v1/matches/${encodeURIComponent(id)}`); },
    briefing(matchId, locale = 'ru') { return this.request('/v1/ai/briefing', { method: 'POST', body: { matchId, locale } }); },
    createThesis(thesis) { return this.request('/v1/theses', { method: 'POST', body: thesis }); },
    reviewThesis(thesis) { return this.request('/v1/ai/review-thesis', { method: 'POST', body: thesis }); },
    ask(question, context = {}) { return this.request('/v1/ai/ask', { method: 'POST', body: { question, context } }); },
    subscribePush(subscription) { return this.request('/v1/push/subscribe', { method: 'POST', body: subscription }); }
  };
})();