// Resume the Kurigram pause created by verify_brain_intervention.cjs pause/check.
const { chromium } = require(process.env.AALI_PLAYWRIGHT_PATH || 'playwright-core');
const assert = require('node:assert/strict');
const origin = 'http://127.0.0.1:5173';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const response=await page.request.post(origin+'/api/v1/auth/login',{data:{username:'authority_dc',password:'Admin123!'}});assert.equal(response.status(),201);const login=await response.json();
  await page.addInitScript(session=>localStorage.setItem('aali_session',JSON.stringify(session)),{...login.user,accessToken:login.accessToken});
  await page.goto(origin+'/control-room/brain?mode=LIVE');await page.getByLabel('Analysis area').selectOption('kurigram');
  await page.locator('.brain-intervention > summary').click();
  const resume=page.getByRole('button',{name:'Resume selected area'});await resume.waitFor();assert.equal(await resume.isDisabled(),true);
  await page.getByPlaceholder('Why are you taking control?').fill('Synthetic browser verification complete; restore autonomy');
  const saved=page.waitForResponse(response=>response.url().endsWith('/brain/autonomy/control')&&response.request().method()==='POST');await resume.click();assert.equal((await saved).status(),201);
  await page.getByRole('button',{name:'Pause selected area'}).waitFor();await page.reload();await page.getByLabel('Analysis area').selectOption('kurigram');await page.locator('.brain-intervention > summary').click();
  await page.getByRole('button',{name:'Pause selected area'}).waitFor();assert.deepEqual(errors,[]);
  // Verify the repaired inspector's built-in packet actually decodes.
  await page.getByRole('button',{name:'Disaster Packet & AI',exact:true}).click();
  await page.getByRole('button',{name:'Decode Packet',exact:true}).click();
  await page.getByText('Packet validated successfully',{exact:true}).waitFor();
  console.log('PASS: reason required, persisted resume through the real UI, reload state, and built-in packet validation; no browser crashes.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
