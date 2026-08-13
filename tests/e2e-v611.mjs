import { chromium, webkit } from 'playwright';

const type = process.env.BROWSER === 'webkit' ? webkit : chromium;
const browser = await type.launch({ headless: true });

async function runLocalPreview() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.locator('#identityGate').waitFor();
  if (!(await page.locator('[data-auth-local]').count())) throw new Error('Local preview fallback missing when cloud auth is not configured');
  await page.locator('[data-auth-local]').click();
  await page.getByTestId('start-onboarding').click();
  await page.locator('[data-action="diagnostic"][data-value="70"]').click();
  await page.reload({ waitUntil: 'networkidle' });
  if (await page.locator('#identityGate').count()) throw new Error('Local preview choice did not persist');
  if (await page.getByTestId('start-onboarding').count()) throw new Error('Onboarding did not persist');

  await page.getByTestId('continue-loop').click();
  await page.getByTestId('briefing').waitFor();
  await page.locator('[data-action="thesis"]').last().click();
  await page.locator('[name="scenario"]').fill('City controls possession and creates overloads in the right half-space.');
  await page.locator('[name="reason"]').fill('The midfield structure gives City an extra passing lane during progression.');
  await page.locator('[name="risk"]').fill('Madrid can break the press and attack the space behind the fullbacks.');
  await page.getByTestId('save-thesis').click();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('continue-loop').click();
  await page.getByTestId('replay').waitFor();
  const before = Number((await page.locator('#sportsIq').textContent()).replace(/\D/g, ''));
  await page.locator('[data-action="complete-replay"]').click();
  const after = Number((await page.locator('#sportsIq').textContent()).replace(/\D/g, ''));
  if (!(after > before)) throw new Error('Sports IQ did not increase after scored Replay');

  await page.reload({ waitUntil: 'networkidle' });
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('noviq-v5.2-state')));
  if (state.theses.length !== 1 || state.replays.length !== 1 || state.completedReplayIds.length !== 1) throw new Error('Durable history did not persist');
  const beta = await page.evaluate(() => ({ metrics: window.NOVIQ.beta.metrics(), report: window.NOVIQ.beta.report() }));
  if (!beta.metrics.briefingDays.length || !beta.metrics.thesisDays.length || !beta.metrics.replayDays.length) throw new Error('Beta decision-loop metrics are incomplete');
  if (beta.report.product.theses !== 1 || beta.report.product.replays !== 1) throw new Error('Beta report does not reflect product history');

  await page.locator('[data-nav="ai"]').click();
  await page.locator('#aiQuestion').fill('Why might my confidence be too high?');
  await page.locator('[data-action="ask"]').click();
  await page.locator('#aiResult .ai-answer').waitFor();
  await page.locator('[data-nav="profile"]').click();
  await page.locator('.prelaunch-profile').waitFor();
  await page.locator('.prelaunch-memory article').first().waitFor();
  const profileText = await page.locator('.prelaunch-profile').textContent();
  if (!profileText.includes('Local preview') && !profileText.includes('Local')) throw new Error('Identity status missing from profile');

  await page.locator('[data-prelaunch-edit]').click();
  await page.locator('#prelaunchProfileDialog [name="displayName"]').fill('Beta Analyst');
  await page.locator('#prelaunchProfileDialog [name="favoriteTeam"]').fill('Polissya');
  await page.locator('#prelaunchProfileDialog button[type="submit"]').click();
  await page.locator('#prelaunchProfileDialog').waitFor({ state: 'hidden' });
  if (!(await page.locator('.prelaunch-profile').textContent()).includes('Beta Analyst')) throw new Error('Profile edit did not render');
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-nav="profile"]').click();
  await page.locator('.prelaunch-profile').waitFor();
  if (!(await page.locator('.prelaunch-profile').textContent()).includes('Beta Analyst')) throw new Error('Profile edit did not persist after reload');

  await page.locator('[data-mvp-action="feedback"]').waitFor();
  await page.locator('[data-mvp-action="feedback"]').click();
  await page.locator('#mvpFeedbackDialog textarea[name="problem"]').fill('The value is clear; I want more match variety.');
  await page.locator('#mvpFeedbackForm button[type="submit"]').click();
  await page.waitForFunction(() => window.NOVIQ.beta.feedback().length === 1);
  const finalReport = await page.evaluate(() => window.NOVIQ.beta.report());
  if (finalReport.beta.feedback.length !== 1) throw new Error('Feedback did not reach beta report');
  if (finalReport.beta.metrics.activeDays.length < 1 || finalReport.beta.metrics.sessions < 1) throw new Error('Retention metrics missing from beta report');
  await context.close();
}

async function runCloudIdentity() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const accessToken = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: '11111111-1111-4111-8111-111111111111', email: 'beta@example.com', exp: Math.floor(Date.now() / 1000) + 3600, user_metadata: { display_name: 'Cloud Analyst' } })}.test`;

  await page.route('**/runtime-config.js', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `window.NOVIQ_RUNTIME_CONFIG=Object.freeze({edition:'closed-beta',demoMode:true,requireAccount:true,allowLocalPreview:false,apiBaseUrl:'https://api.noviq.test',supabaseUrl:'https://project.supabase.co',supabaseAnonKey:'public-test-key',appUrl:'http://127.0.0.1:4173/',provider:'NOVIQ Curated Offline Dataset',requestTimeoutMs:8000});`
  }));

  await page.route('https://project.supabase.co/auth/v1/**', async route => {
    const url = route.request().url();
    if (url.includes('/token?grant_type=password')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: accessToken, refresh_token: 'refresh-test', expires_in: 3600, user: { id: '11111111-1111-4111-8111-111111111111', email: 'beta@example.com', user_metadata: { display_name: 'Cloud Analyst' } } }) });
    }
    if (url.includes('/logout')) return route.fulfill({ status: 204, body: '' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.route('https://api.noviq.test/**', async route => {
    const url = new URL(route.request().url());
    const auth = route.request().headers()['authorization'] || '';
    if (!auth.startsWith('Bearer ')) return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"AUTH_REQUIRED"}' });
    if (url.pathname === '/v1/sync') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"synced":{"theses":0,"replays":0}}' });
    if (url.pathname === '/v1/bootstrap') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profile: { id: '11111111-1111-4111-8111-111111111111', email: 'beta@example.com', displayName: 'Cloud Analyst', favoriteTeam: 'Polissya' }, theses: [], memories: [] }) });
    if (url.pathname === '/v1/me' && route.request().method() === 'PATCH') return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.locator('#identityGate').waitFor();
  if (await page.locator('[data-auth-local]').count()) throw new Error('Local preview must be hidden when cloud account is required');
  await page.locator('[data-auth-tab="signup"]').click();
  if (!(await page.locator('.identity-name').isVisible())) throw new Error('Create account name field did not open');
  await page.locator('[data-auth-tab="signin"]').click();
  if (await page.locator('.identity-name').isVisible()) throw new Error('Sign-in mode did not hide signup name field');
  await page.locator('#identityForm [name="email"]').fill('beta@example.com');
  await page.locator('#identityForm [name="password"]').fill('correct-horse-battery');
  await page.locator('#identityForm button[type="submit"]').click();
  await page.locator('#identityGate').waitFor({ state: 'detached' });
  const storedSession = await page.evaluate(() => JSON.parse(localStorage.getItem('noviq-auth-session-v2')));
  if (!storedSession?.accessToken || storedSession?.password) throw new Error('Cloud session persistence contract is invalid');

  // A first cloud sign-in is still a first product visit. Verify that onboarding
  // appears, then close it so identity/profile behavior can be tested independently.
  if (await page.getByTestId('start-onboarding').count()) {
    await page.locator('#modal [data-action="close"]').click();
    await page.locator('#modal').waitFor({ state: 'hidden' }).catch(() => undefined);
  }

  await page.locator('[data-nav="profile"]').click();
  await page.locator('.prelaunch-profile').waitFor();
  const cloudProfile = await page.locator('.prelaunch-profile').textContent();
  if (!cloudProfile.includes('Cloud account') || !cloudProfile.includes('beta@example.com') || !cloudProfile.includes('Cloud Analyst')) throw new Error('Cloud profile did not hydrate from bootstrap');
  await page.locator('[data-prelaunch-signout]').click();
  await page.locator('#identityGate').waitFor();
  if (await page.evaluate(() => localStorage.getItem('noviq-auth-session-v2'))) throw new Error('Sign out did not clear the cloud session');
  await context.close();
}

try {
  await runLocalPreview();
  await runCloudIdentity();
} finally {
  await browser.close();
}
