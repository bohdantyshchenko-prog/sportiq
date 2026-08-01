import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const sw = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

const scripts = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
const styles = [...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match => match[1]);

assert.ok(index.includes('NOVIQ 1.4'), 'index must identify NOVIQ 1.4');
assert.deepEqual(scripts.slice(0, 3), ['runtime-config.js', 'config.js', 'api-client.js'], 'runtime config and API client load order is invalid');
assert.ok(scripts.includes('services.js'), 'services.js must be loaded');
assert.ok(manifest.name && manifest.short_name, 'manifest must contain app names');

for (const asset of [...scripts, ...styles, 'manifest.webmanifest', 'icon.svg']) {
  assert.ok(fs.existsSync(asset), `missing runtime asset: ${asset}`);
}

for (const script of scripts) {
  const source = read(script);
  new vm.Script(source, { filename: script });
  assert.ok(sw.includes(`'./${script}'`), `${script} missing from service-worker cache`);
}

assert.ok(sw.includes("request.mode==='navigate'"), 'service worker must restrict HTML fallback to navigation');
assert.ok(sw.includes("url.pathname.includes('/v1/')"), 'service worker must bypass API requests');
assert.ok(read('config.js').includes("version: '1.4.0'"), 'config version must be 1.4.0');
assert.ok(read('services.js').includes('legacyKeys'), 'state migration support must remain present');
assert.ok(read('api-client.js').includes('AbortController'), 'API timeout protection must remain present');

console.log(`NOVIQ smoke checks passed: ${scripts.length} scripts, ${styles.length} styles.`);
