// Optional browser smoke. Requires playwright-core via AALI_PLAYWRIGHT_PATH and installed Chrome.
// Public page uses the actual local API. Staff review endpoints are explicit synthetic mocks.
const path = require('path');
process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../apps/api/tsconfig.json');
require('ts-node/register/transpile-only');
const { chromium } = require(process.env.AALI_PLAYWRIGHT_PATH || 'playwright-core');
const { buildBrainPlan } = require('../apps/api/src/modules/brain/brain-planner');
const { BRAIN_AREAS } = require('../apps/api/src/modules/brain/brain.types');
const { exerciseEnvironment } = require('../apps/api/src/modules/brain/environmental-data.service');
const assert = require('assert/strict');
const fs = require('fs');
const root = 'http://127.0.0.1:5173';

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${root}/preparedness`);
    await page.getByRole('button', { name: 'Check my area without GPS' }).click();
    await page.getByRole('heading', { name: /Feni.*(MONITOR|UNKNOWN|ELEVATED|HIGH)/ }).waitFor({ timeout: 20000 });
    assert.equal(await page.getByText('No relief has been booked or dispatched.').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    const output = path.resolve(__dirname, '../docs/media'); fs.mkdirSync(output, { recursive: true });
    await page.screenshot({ path: path.join(output, 'brain-household-mobile.png'), fullPage: true });
    console.log('PASS: real public household guidance, no GPS/account, desktop/mobile layout.');
    await page.close();

    const persisted = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
    const loginResponse = await persisted.request.post(`${root}/api/v1/auth/login`, { data: { username: 'authority_dc', password: 'Admin123!' } });
    assert.equal(loginResponse.status(), 201);
    const login = await loginResponse.json();
    await persisted.addInitScript(session => localStorage.setItem('aali_session', JSON.stringify(session)), { ...login.user, accessToken: login.accessToken });
    await persisted.goto(`${root}/control-room/brain?mode=EXERCISE&districtCode=FENI_DIST`);
    await persisted.getByRole('heading', { name: 'Agent briefing' }).waitFor();
    if (process.env.AALI_REQUIRE_OPENAI === 'true') await persisted.getByText('OPENAI', { exact: true }).waitFor();
    await persisted.getByText(/Reviewer: AUTHORITY · ACKNOWLEDGED/).waitFor();
    await persisted.screenshot({ path: path.join(output, 'brain-staff-live-api.png'), fullPage: true });
    console.log('PASS: real staff login, persisted MySQL analysis and saved review rendered in browser.');
    await persisted.close();

    if (process.env.AALI_CHECK_LEGACY_AI === 'true') {
      const legacy = await browser.newPage(); const errors = [];
      legacy.on('pageerror', error => errors.push(error.message));
      await legacy.addInitScript(session => localStorage.setItem('aali_session', JSON.stringify(session)), { ...login.user, accessToken: login.accessToken });
      await legacy.goto(`${root}/control-room/language?mode=EXERCISE&districtCode=FENI_DIST`);
      await legacy.getByRole('button', { name: /Analyze Text/ }).click();
      await legacy.getByRole('button', { name: /Preview correction/ }).click();
      await legacy.getByText(/Local preview only; no report was saved or verified/).waitFor();
      await legacy.getByRole('button', { name: /Run Benchmark/ }).click();
      await legacy.getByText('Not measured', { exact: true }).waitFor();
      await legacy.getByRole('button', { name: /Generate/ }).click();
      await legacy.getByText(/Counts are supplied examples, not verified rescue outcomes/).waitFor();
      assert.deepEqual(errors, []);
      console.log('PASS: legacy extraction, truthful correction preview, measured benchmark, real shift-summary contract; no browser crashes.');
      await legacy.close();
    }

    const staff = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
    const plan = buildBrainPlan('00000000-0000-4000-8000-000000000001', BRAIN_AREAS[0], 'EXERCISE', exerciseEnvironment(BRAIN_AREAS[0]), { provenance: 'SYNTHETIC_EXERCISE', reports: [{ id: 'synthetic-sos-01', people: 5, trapped: true, child: true, medical: true, receivedAt: new Date().toISOString() }], shelters: [], relief: [{ id: 'synthetic-need-01', areaName: 'Chitholia', waterNeed: 4000, waterDelivered: 0, foodNeed: 200, foodDelivered: 0 }] });
    await staff.addInitScript(() => localStorage.setItem('aali_session', JSON.stringify({ id: 'synthetic', username: 'browser-test', displayName: 'Synthetic browser test', role: 'AUTHORITY', accessToken: 'synthetic-token' })));
    await staff.route('**/api/v1/brain/**', async route => {
      const url = route.request().url(); let body = plan;
      if (url.endsWith('/areas')) body = BRAIN_AREAS;
      else if (url.endsWith('/review')) { const dto = route.request().postDataJSON(); const action = plan.actions.find(a => a.id === dto.actionId); if (action) action.state = dto.decision; }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await staff.goto(`${root}/control-room/brain?mode=EXERCISE&districtCode=FENI_DIST`);
    await staff.getByRole('heading', { name: 'Agent briefing' }).waitFor();
    await staff.getByRole('heading', { name: 'Coverage gap · Chitholia' }).waitFor();
    assert.equal(await staff.getByRole('button', { name: 'Acknowledge review' }).first().isEnabled(), false);
    await staff.getByPlaceholder('What did you verify? Minimum 5 characters.').fill('Reviewed synthetic evidence');
    await staff.getByRole('button', { name: 'Acknowledge review' }).first().click();
    await staff.getByText(/Reviewer: AUTHORITY · ACKNOWLEDGED/).waitFor();
    await staff.evaluate(() => window.scrollTo(0, 0));
    await staff.screenshot({ path: path.join(output, 'brain-staff-desktop.png'), fullPage: true });
    await staff.setViewportSize({ width: 390, height: 844 });
    const overflow = await staff.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth, elements: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > window.innerWidth + 1 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 12).map(e => ({ tag: e.tagName, className: e.className, right: Math.round(e.getBoundingClientRect().right), width: Math.round(e.getBoundingClientRect().width) })) }));
    if (overflow.width > overflow.viewport) console.log('Overflow diagnostics:', JSON.stringify(overflow));
    assert.equal(overflow.width > overflow.viewport, false);
    console.log('PASS: synthetic staff analysis, review reason, acknowledged state, responsive layout.');
    await staff.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
