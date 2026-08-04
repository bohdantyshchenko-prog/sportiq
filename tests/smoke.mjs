import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const core = read('core-v52.js');
const app = read('app-v52.js');
const styles = read('styles-v52.css');
const sw = read('sw-v52.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

const scripts = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
const stylesheets = [...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match => match[1]);

assert.deepEqual(scripts, ['data.js', 'core-v52.js', 'app-v52.js']);
assert.deepEqual(stylesheets, ['styles-v52.css']);
assert.ok(index.includes('NOVIQ 5.2'));
assert.ok(manifest.name.includes('5.2'));
for (const asset of [...scripts, ...stylesheets, 'manifest.webmanifest', 'icon.svg']) assert.ok(fs.existsSync(asset), `missing ${asset}`);
for (const script of scripts) new vm.Script(read(script), { filename: script });

assert.ok(core.includes("schemaVersion: 7"));
assert.ok(core.includes("saved.onboarding?.completed"), '5.0 onboarding migration missing');
assert.ok(core.includes('theses:[]') && core.includes('replays:[]') && core.includes('completedReplayIds:[]'));
assert.ok(core.includes("throw new Error('REPLAY_EXISTS')"), 'Replay idempotency missing');
assert.ok(core.includes('scoreReplay(') && core.includes('breakdown'), 'Sports IQ scoring missing');
assert.ok(core.includes('inspect(raw)') && core.includes('summary:'), 'import preview missing');
assert.ok(core.includes("language === 'ua' ? 'uk'"), 'UA to UK migration missing');
assert.ok(core.includes("source:'offline-rules-engine'"), 'structured AI source missing');
assert.ok(app.includes("setAttribute('inert','')"), 'background inert handling missing');
assert.ok(app.includes('data-testid="save-thesis"') && app.includes('data-testid="replay"'));
assert.ok(app.includes('pendingImport') && app.includes('confirm-import'));
assert.ok(app.includes('controllerchange') && app.includes('updateBar'));
assert.ok(!app.includes('alert(') && !app.includes('confirm('));
assert.ok(styles.includes('prefers-reduced-motion') && styles.includes(':focus-visible'));
assert.ok(styles.split('\n').length > 100, 'source CSS must remain formatted');
assert.ok(sw.includes("const VERSION='5.2.0'"));
assert.ok(sw.includes('Optional asset failed'));
assert.ok(sw.includes("request.mode==='navigate'"));
assert.ok(!index.includes('app-v5.js') && !index.includes('styles-v5.css'));

console.log('NOVIQ 5.2 structural checks passed.');
