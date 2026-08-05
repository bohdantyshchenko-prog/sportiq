import fs from 'node:fs';
import assert from 'node:assert/strict';

const files=['index.html','styles-v52.css','polyfills-v52.js','data.js','core-v52.js','platform-v6.js','app-v52.js','a11y-v52.js','sw-v52.js','manifest.webmanifest'];
const sizes=Object.fromEntries(files.map(file=>[file,fs.statSync(file).size]));
const total=Object.values(sizes).reduce((sum,size)=>sum+size,0);
const budgets={
  total:420_000,
  javascript:260_000,
  css:130_000,
  html:20_000
};
const js=Object.entries(sizes).filter(([file])=>file.endsWith('.js')).reduce((sum,[,size])=>sum+size,0);
assert.ok(total<=budgets.total,`runtime ${total} exceeds ${budgets.total}`);
assert.ok(js<=budgets.javascript,`javascript ${js} exceeds ${budgets.javascript}`);
assert.ok(sizes['styles-v52.css']<=budgets.css,`css ${sizes['styles-v52.css']} exceeds ${budgets.css}`);
assert.ok(sizes['index.html']<=budgets.html,`html ${sizes['index.html']} exceeds ${budgets.html}`);
const platform=fs.readFileSync('platform-v6.js','utf8');
for(const requirement of ['Object.freeze','MAX_EVENTS','MAX_ERRORS','capture(error','track(name','redact','performance.mark']) assert.ok(platform.includes(requirement),`platform missing ${requirement}`);
assert.ok(!platform.includes('fetch('),'offline telemetry must not send data');
assert.ok(fs.existsSync('docs/ARCHITECTURE_V6.md'));
assert.ok(fs.existsSync('docs/RELEASE_V6.md'));
assert.ok(fs.existsSync('SECURITY.md'));
console.log(JSON.stringify({ok:true,total,js,css:sizes['styles-v52.css'],budgets},null,2));
