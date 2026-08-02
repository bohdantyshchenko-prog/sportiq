import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=path=>fs.readFileSync(path,'utf8');
const index=read('index.html'),sw=read('sw.js'),config=read('config.js'),services=read('services.js'),offline=read('offline-production.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const scripts=[...index.matchAll(/<script src="([^"]+)"/g)].map(match=>match[1]);
const styles=[...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match=>match[1]);

assert.ok(index.includes('NOVIQ 4.0'),'index must identify NOVIQ 4.0');
assert.deepEqual(scripts.slice(0,2),['runtime-config.js','config.js'],'runtime and config load order is invalid');
assert.equal(scripts.at(-1),'offline-production.js','offline production controls must load last');
assert.ok(scripts.includes('services.js')&&scripts.includes('world-layout.js'),'core experience layers must be loaded');
assert.ok(manifest.name&&manifest.short_name,'manifest must contain app names');

for(const asset of[...scripts,...styles,'manifest.webmanifest','icon.svg'])assert.ok(fs.existsSync(asset),`missing runtime asset: ${asset}`);
for(const script of scripts){new vm.Script(read(script),{filename:script});assert.ok(sw.includes(`'./${script}'`),`${script} missing from service-worker cache`);}

assert.ok(sw.includes("request.mode==='navigate'"),'service worker must handle navigation fallback');
assert.ok(sw.includes("caches.match(request)"),'static assets must use offline cache');
assert.ok(config.includes("version: '4.0.0'"),'client version must be 4.0.0');
assert.ok(config.includes("edition: 'offline-production'"),'offline production edition must be explicit');
assert.ok(config.includes("'noviq-v3.3-state'"),'3.3 state migration path must remain present');
assert.ok(services.includes('backupKey')&&services.includes('INVALID_NOVIQ_BACKUP'),'backup and import validation must exist');
assert.ok(services.includes("mode:'offline-production'")&&services.includes('offline-rules-engine'),'runtime and AI must be truthful offline implementations');
assert.ok(services.includes('N.health'),'local health diagnostics must exist');
assert.ok(offline.includes('N.importData')&&offline.includes('N.exportData'),'user data import/export controls must exist');
assert.ok(offline.includes('unhandledrejection'),'runtime failures must be recorded');
assert.ok(styles.includes('styles-editorial.css')&&styles.includes('styles-v3.css')&&styles.includes('styles-world.css'),'visual layers must be loaded');
assert.ok(!index.includes('real sports data'),'offline build must not claim live provider data');

console.log(`NOVIQ 4.0 offline production checks passed: ${scripts.length} scripts, ${styles.length} styles.`);