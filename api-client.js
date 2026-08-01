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
    }
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const withTimeout = (promise, timeoutMs) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return { controller, promise: promise(controller.signal).finally(() => clearTimeout(timeout)) };
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
          const timed = withTimeout(signal => fetch(`${baseUrl}${path}`, {
            method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            credentials: 'omit',
            signal
          }), timeoutMs);
          const response = await timed.promise;
          const contentType = response.headers.get('content-type') || '';
          const payload = contentType.includes('application/json') ? await response.json() : await response.text();
          if (!response.ok) {
            throw new ApiError(payload?.message || `Request failed with ${response.status}`, {
              status: response.status,
              code: payload?.code || 'HTTP_ERROR',
              retryable: response.status >= 500 || response.status === 429
            });
          }
          return payload;
        } catch (error) {
          lastError = error?.name === 'AbortError'
            ? new ApiError('Request timed out', { code: 'TIMEOUT', retryable: true })
            : error;
          if (attempt >= retries || !lastError.retryable) break;
          await sleep(250 * (attempt + 1));
        }
      }
      throw lastError;
    },
    health() { return this.request('/v1/health', { retries: 0, timeoutMs: 3000 }); },
    matches(params = {}) {
      const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value != null && value !== '')).toString();
      return this.request(`/v1/matches${query ? `?${query}` : ''}`);
    },
    match(id) { return this.request(`/v1/matches/${encodeURIComponent(id)}`); },
    briefing(matchId) { return this.request(`/v1/matches/${encodeURIComponent(matchId)}/briefing`, { method: 'POST' }); },
    reviewThesis(thesis) { return this.request('/v1/ai/thesis-review', { method: 'POST', body: { thesis } }); },
    ask(question, context = {}) { return this.request('/v1/ai/ask', { method: 'POST', body: { question, context } }); }
  };
})();
