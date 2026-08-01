import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const sw = read('sw.js');
const config = read('config.js');
const api = read('api-client.js');
const auth = read('auth-client.js');
const push = read('push-client.js');
const backend = read('backend/src/main.ts');
const manifest = JSON.parse(read('manifest.webmanifest'));

const scripts = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
const styles = [...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match => match[1]);

assert.ok(index.includes('NOVIQ 3.3'), 'index must identify NOVIQ 3.3');
assert.deepEqual(scripts.slice(0, 4), ['runtime-config.js', 'config.js', 'auth-client.js', 'api-client.js'], 'runtime, auth and API client load order is invalid');
assert.ok(scripts.includes('services.js') && scripts.includes('world-layout.js'), 'core experience layers must be loaded');
assert.ok(manifest.name && manifest.short_name, 'manifest must contain app names');

for (const asset of [...scripts, ...styles, 'manifest.webmanifest', 'icon.svg']) assert.ok(fs.existsSync(asset), `missing runtime asset: ${asset}`);
for (const script of scripts) {
  new vm.Script(read(script), { filename: script });
  assert.ok(sw.includes(`'./${script}'`), `${script} missing from service-worker cache`);
}

assert.ok(sw.includes("request.mode==='navigate'"), 'service worker must restrict HTML fallback to navigation');
assert.ok(sw.includes("url.pathname.includes('/auth/v1/')"), 'service worker must bypass authentication requests');
assert.ok(config.includes("version: '3.3.0'"), 'client config version must be 3.3.0');
assert.ok(config.includes("'noviq-v3.2-state'"), '3.2 state migration path must remain present');
assert.ok(auth.includes("grant_type=password") && auth.includes("grant_type=refresh_token"), 'Supabase password and refresh flows must exist');
assert.ok(auth.includes("noviq-auth-session"), 'auth session persistence must exist');
assert.ok(api.includes('AbortController'), 'API timeout protection must remain present');
assert.ok(push.includes("'/v1/push/subscribe'") && push.includes("'/v1/push/test'"), 'push client routes must match backend');
assert.ok(!push.includes('JSON.stringify({endpoint'), 'push client must not double-stringify request body');
assert.ok(styles.includes('styles-editorial.css') && styles.includes('styles-v3.css') && styles.includes('styles-world.css'), 'visual layers must be loaded');

const contract = [
  ['/health', "app.get('/health'"], ['/ready', "app.get('/ready'"], ['/v1/me', "app.get('/v1/me'"],
  ['/v1/matches', "app.get('/v1/matches'"], ['/v1/ai/briefing', "app.post('/v1/ai/briefing'"],
  ['/v1/ai/review-thesis', "app.post('/v1/ai/review-thesis'"], ['/v1/ai/ask', "app.post('/v1/ai/ask'"],
  ['/v1/push/subscribe', "app.post('/v1/push/subscribe'"], ['/v1/push/test', "app.post('/v1/push/test'"]
];
for (const [clientPath, serverRoute] of contract) {
  assert.ok(api.includes(clientPath) || push.includes(clientPath), `client route missing: ${clientPath}`);
  assert.ok(backend.includes(serverRoute), `backend route missing: ${serverRoute}`);
}

console.log(`NOVIQ 3.3 smoke checks passed: ${scripts.length} scripts, ${styles.length} styles, ${contract.length} API contracts.`);