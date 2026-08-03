import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=path=>fs.readFileSync(path,'utf8');
const index=read('index.html'),sw=read('sw.js'),config=read('config.js'),services=read('services.js'),offline=read('offline-production.js'),beta=read('beta-polish.js'),world=read('world-layout.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const scripts=[...index.matchAll(/<script src="([^"]+)"/g)].map(match=>match[1]);
const styles=[...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match=>match[1]);

assert.ok(index.includes('NOVIQ 4.1'),'index must identify NOVIQ 4.1');
assert.deepEqual(scripts.slice(0,2),['runtime-config.js','config.js'],'runtime and config load order is invalid');
assert.equal(scripts.at(-1),'beta-polish.js','beta experience must load last');
assert.ok(scripts.includes('offline-production.js')&&scripts.includes('world-layout.js'),'production experience layers must be loaded');
assert.ok(manifest.name.includes('4.1')&&manifest.short_name,'manifest must identify NOVIQ 4.1');
for(const asset of[...scripts,...styles,'manifest.webmanifest','icon.svg'])assert.ok(fs.existsSync(asset),`missing runtime asset: ${asset}`);
for(const script of scripts){new vm.Script(read(script),{filename:script});assert.ok(sw.includes(`'./${script}'`),`${script} missing from service-worker cache`);}
assert.ok(sw.includes("request.mode==='navigate'"),'service worker must handle navigation fallback');
assert.ok(config.includes("version: '4.1.0'"),'client version must be 4.1.0');
assert.ok(config.includes("'noviq-v4-state'"),'4.0 migration path must remain present');
assert.ok(config.includes('onboardingSeen'),'onboarding state must be persisted');
assert.ok(services.includes('backupKey')&&services.includes('INVALID_NOVIQ_BACKUP'),'backup and import validation must exist');
assert.ok(offline.includes('N.importData')&&offline.includes('N.exportData'),'user data controls must exist');
assert.ok(beta.includes('INTELLIGENCE LOOP')&&beta.includes('onboardingSeen'),'beta onboarding and journey must exist');
assert.ok(!world.includes("replaceChildren(document.createTextNode('3.0'))"),'version badge must not be hardcoded');
assert.ok(styles.includes('styles-beta.css'),'beta visual layer must be loaded');
assert.ok(!index.includes('real sports data'),'offline build must not claim live provider data');
console.log(`NOVIQ 4.1 beta checks passed: ${scripts.length} scripts, ${styles.length} styles.`);