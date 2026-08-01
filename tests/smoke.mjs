import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const sw = read('sw.js');
const config = read('config.js');
const api = read('api-client.js');
const backend = read('backend/src/main.ts');
const manifest = JSON.parse(read('manifest.webmanifest'));

const scripts = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
const styles = [...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match => match[1]);

assert.ok(index.includes('NOVIQ 3.2'), 'index must identify NOVIQ 3.2');
assert.deepEqual(scripts.slice(0, 3), ['runtime-config.js', 'config.js', 'api-client.js'], 'runtime config and API client load order is invalid');
assert.ok(scripts.includes('services.js'), 'services.js must be loaded');
assert.ok(scripts.includes('experience-v3.js'), 'NOVIQ experience layer must be loaded');
assert.ok(scripts.includes('world-layout.js'), 'world layout layer must be loaded');
assert.ok(manifest.name && manifest.short_name, 'manifest must contain app names');

for (const asset of [...scripts, ...styles, 'manifest.webmanifest', 'icon.svg']) assert.ok(fs.existsSync(asset), `missing runtime asset: ${asset}`);
for (const script of scripts) {
  new vm.Script(read(script), { filename: script });
  assert.ok(sw.includes(`'./${script}'`), `${script} missing from service-worker cache`);
}

assert.ok(sw.includes("request.mode==='navigate'"), 'service worker must restrict HTML fallback to navigation');
assert.ok(sw.includes("url.pathname==='/health'"), 'service worker must bypass health requests');
assert.ok(config.includes("version: '3.2.0'"), 'client config version must be 3.2.0');
assert.ok(config.includes("'noviq-v2-state'"), 'v2 state migration path must remain present');
assert.ok(read('services.js').includes('legacyKeys'), 'state migration support must remain present');
assert.ok(api.includes('AbortController'), 'API timeout protection must remain present');
assert.ok(styles.includes('styles-editorial.css'), 'editorial base layer must be loaded');
assert.ok(styles.includes('styles-v3.css'), 'NOVIQ visual layer must be loaded');
assert.ok(styles.includes('styles-world.css'), 'world-class layout layer must be loaded');

const contract = [
  ['/health', "app.get('/health'"],
  ['/ready', "app.get('/ready'"],
  ['/v1/me', "app.get('/v1/me'"],
  ['/v1/matches', "app.get('/v1/matches'"],
  ['/v1/ai/briefing', "app.post('/v1/ai/briefing'"],
  ['/v1/ai/review-thesis', "app.post('/v1/ai/review-thesis'"],
  ['/v1/ai/ask', "app.post('/v1/ai/ask'"],
  ['/v1/push/subscribe', "app.post('/v1/push/subscribe'"]
];
for (const [clientPath, serverRoute] of contract) {
  assert.ok(api.includes(clientPath), `client route missing: ${clientPath}`);
  assert.ok(backend.includes(serverRoute), `backend route missing: ${serverRoute}`);
}

console.log(`NOVIQ 3.2 smoke checks passed: ${scripts.length} scripts, ${styles.length} styles, ${contract.length} API contracts.`);