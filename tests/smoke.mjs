import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const core = read('core-v52.js');
const platform = read('platform-v6.js');
const app = read('app-v52.js');
const a11y = read('a11y-v52.js');
const styles = read('styles-v52.css');
const sw = read('sw-v52.js');
const auth = read('auth-client.js');
const api = read('api-client.js');
const prelaunch = read('prelaunch-v61.js');
const prelaunchCss = read('prelaunch-v61.css');
const headers = read('_headers');
const privacy = read('privacy.html');
const terms = read('terms.html');
const manifest = JSON.parse(read('manifest.webmanifest'));

const scripts = [...index.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]);
const stylesheets = [...index.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(match => match[1]);

assert.deepEqual(scripts, [
  'polyfills-v52.js',
  'runtime-config.js',
  'auth-client.js',
  'api-client.js',
  'data.js',
  'core-v52.js',
  'platform-v6.js',
  'app-v52.js',
  'a11y-v52.js',
  'mvp-beta.js',
  'prelaunch-v61.js'
]);
assert.deepEqual(stylesheets, ['styles-v52.css', 'mvp-beta.css', 'prelaunch-v61.css']);
assert.ok(index.includes('NOVIQ 6.1') && manifest.name.includes('6.1'));

for (const asset of [...scripts, ...stylesheets, 'manifest.webmanifest', 'icon.svg', 'about.html', 'privacy.html', 'terms.html']) {
  assert.ok(fs.existsSync(asset), `missing ${asset}`);
}
for (const script of scripts) new vm.Script(read(script), { filename: script });
for (const script of scripts.filter(script => script !== 'runtime-config.js')) {
  assert.ok(sw.includes(`'./${script}'`), `${script} missing from offline cache`);
}

assert.ok(!sw.includes("'./runtime-config.js'"), 'runtime config must never be precached');
assert.ok(sw.includes("pathname.startsWith('/v1/')") && sw.includes("pathname==='/runtime-config.js'"), 'network-only API/config policy missing');
assert.ok(sw.includes("const VERSION='6.1.0'"), 'service-worker version mismatch');

assert.ok(core.includes('schemaVersion:7') || core.includes('schemaVersion: 7'));
assert.ok(core.includes("throw new Error('REPLAY_EXISTS')") && core.includes('scoreReplay('));
assert.ok(platform.includes("version:'6.1.0'") && platform.includes('cloudIdentity:true') && platform.includes('cloudSync:true'));
assert.ok(app.includes('data-testid="save-thesis"') && app.includes('data-testid="replay"'));
assert.ok(!app.includes('alert(') && !app.includes('confirm('));
assert.ok(a11y.includes("child.setAttribute('inert'"));
assert.ok(styles.includes('prefers-reduced-motion') && styles.includes(':focus-visible'));

for (const token of [
  'async signIn(email, password)',
  'async signUp(email, password',
  'async recover(email)',
  'async updatePassword(password)',
  'async refresh(force = false)',
  'async accessToken()',
  'consumeRedirect'
]) assert.ok(auth.includes(token), `auth missing ${token}`);
assert.ok(auth.includes('/signup?redirect_to=') && auth.includes('/recover?redirect_to='), 'Supabase redirects not explicit');
assert.ok(auth.includes("cache: 'no-store'"), 'auth requests must be no-store');
assert.ok(!auth.includes('password: payload') && !auth.includes('password, expiresAt'), 'password must never be persisted');

for (const token of ['bootstrap()', 'updateProfile(profile)', 'deleteMyData()', 'sync(payload)']) {
  assert.ok(api.includes(token), `api client missing ${token}`);
}

for (const token of [
  'identity-gate',
  'function syncPayload()',
  'function syncCloud(',
  'function renderProfile()',
  'function showRecoveryDialog()',
  'data-prelaunch-edit',
  'data-prelaunch-delete',
  'deleteMyData()',
  'Sports Memory'
]) assert.ok(prelaunch.includes(token), `prelaunch missing ${token}`);
assert.ok(!prelaunch.includes("matches:(N.matches"), 'client must not synchronize shared match records');
assert.ok(prelaunchCss.includes('.identity-gate') && prelaunchCss.includes('.prelaunch-profile'));

assert.ok(headers.includes("connect-src 'self' https://*.supabase.co") && !headers.includes("connect-src 'self' https: wss:"));
assert.ok(headers.includes('Strict-Transport-Security'));
assert.ok(privacy.includes('Cloud Account') && privacy.includes('Supabase Auth') && privacy.includes('PostgreSQL'));
assert.ok(terms.includes('Local Preview') && terms.includes('Cloud Account'));

console.log('NOVIQ 6.1 prelaunch structural checks passed.');