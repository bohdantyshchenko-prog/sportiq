import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const sw = read('sw.js');
const config = read('config.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

const scripts = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
const styles = [...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match => match[1]);

assert.ok(index.includes('NOVIQ 3.0'), 'index must identify NOVIQ 3.0');
assert.deepEqual(scripts.slice(0, 3), ['runtime-config.js', 'config.js', 'api-client.js'], 'runtime config and API client load order is invalid');
assert.ok(scripts.includes('services.js'), 'services.js must be loaded');
assert.ok(scripts.includes('experience-v3.js'), 'NOVIQ 3 experience layer must be loaded');
assert.ok(manifest.name && manifest.short_name, 'manifest must contain app names');

for (const asset of [...scripts, ...styles, 'manifest.webmanifest', 'icon.svg']) assert.ok(fs.existsSync(asset), `missing runtime asset: ${asset}`);
for (const script of scripts) {
  new vm.Script(read(script), { filename: script });
  assert.ok(sw.includes(`'./${script}'`), `${script} missing from service-worker cache`);
}

assert.ok(sw.includes("request.mode==='navigate'"), 'service worker must restrict HTML fallback to navigation');
assert.ok(sw.includes("url.pathname.includes('/v1/')"), 'service worker must bypass API requests');
assert.ok(config.includes("version: '2.0.0'"), 'platform config version must remain 2.0.0 during NOVIQ 3 visual rollout');
assert.ok(read('services.js').includes('legacyKeys'), 'state migration support must remain present');
assert.ok(read('api-client.js').includes('AbortController'), 'API timeout protection must remain present');
assert.ok(styles.includes('styles-editorial.css'), 'editorial base layer must be loaded');
assert.ok(styles.includes('styles-v3.css'), 'NOVIQ 3 visual layer must be loaded');

console.log(`NOVIQ 3 smoke checks passed: ${scripts.length} scripts, ${styles.length} styles.`);
