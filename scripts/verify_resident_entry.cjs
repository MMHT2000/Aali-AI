// Synthetic local browser regression: anonymous SOS and authenticated Viewer stay separate.
const assert = require('assert/strict');
const { chromium } = require(process.env.AALI_PLAYWRIGHT_PATH || 'playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage(); const snapshots = [];
    page.on('request', request => { if (request.url().includes('/operations/snapshot')) snapshots.push(request.url()); });
    await page.goto('http://127.0.0.1:5173/');
    await page.getByRole('link', { name: /Zero-Install Emergency SOS PWA/ }).click();
    await page.getByRole('heading', { name: /Resident SOS/ }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/sos');
    await page.getByLabel('SOS area').selectOption('SYLHET_DIST');
    await page.getByRole('button', { name: /Next: Urgency Flags/ }).click();
    await page.getByRole('button', { name: /Next: Location/ }).click();
    const submitted = page.waitForResponse(response => response.url().endsWith('/api/v1/sos') && response.request().method() === 'POST');
    await page.getByRole('button', { name: /Submit SOS/ }).click();
    const response = await submitted; assert.equal(response.status(), 201);
    const result = await response.json(); assert.equal(result.report.event_id, '11111111-1111-1111-1111-111111111104');
    assert.equal(snapshots.length, 0); assert.equal(await page.evaluate(() => localStorage.getItem('aali_session')), null);
    console.log('PASS: emergency link opens public SOS; anonymous Sylhet report accepted; no protected snapshot request.');

    const loggedIn = await page.request.post('http://127.0.0.1:5173/api/v1/auth/login', { data: { username: 'viewer_guest', password: 'Admin123!' } });
    assert.equal(loggedIn.status(), 201); const login = await loggedIn.json();
    await page.evaluate(session => localStorage.setItem('aali_session', JSON.stringify(session)), { ...login.user, accessToken: login.accessToken });
    await page.goto('http://127.0.0.1:5173/control-room/viewer');
    await page.getByRole('heading', { name: 'Feni situation summary' }).waitFor();
    console.log('PASS: authenticated Viewer still receives the protected aggregate summary.');

    // Reproduce a stale in-memory session after same-tab storage loss. Native storage events
    // do not fire in the tab that removes the item; the next actual poll must recover.
    await page.evaluate(() => localStorage.removeItem('aali_session'));
    await page.getByRole('heading', { name: /আলি এআই কন্ট্রোল রুম লগইন/ }).waitFor({ timeout: 20000 });
    console.log('PASS: Viewer with a missing stored token exits the screen on its next 401 poll.');

    await page.evaluate(() => localStorage.setItem('aali_session', JSON.stringify({ id: 'old', username: 'old', displayName: 'Old viewer', role: 'VIEWER', accessToken: 'expired.invalid.token' })));
    await page.goto('http://127.0.0.1:5173/control-room/viewer');
    await page.getByRole('heading', { name: /আলি এআই কন্ট্রোল রুম লগইন/ }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('aali_session')), null);
    console.log('PASS: invalid authenticated session returns to sign-in instead of looping on Retry.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
