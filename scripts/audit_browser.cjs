const { chromium } = require(process.env.AALI_PLAYWRIGHT_PATH || 'playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const origin = process.env.AALI_WEB_URL || 'http://127.0.0.1:5173';
const policy = fs.readFileSync(path.resolve(__dirname,'../apps/web/src/lib/control-room-access.ts'),'utf8');
const routes = [...policy.matchAll(/\{ path: '([^']+)', roles: \[([^\]]+)\] \}/g)].map(match=>({path:match[1],roles:[...match[2].matchAll(/'([^']+)'/g)].map(value=>value[1])}));
const accounts = { AUTHORITY:'authority_dc', ADMIN:'admin', RESPONDER:'responder_feni', RECOVERY_COORDINATOR:'recovery_coord', VOLUNTEER:'volunteer_parshuram', VIEWER:'viewer_guest' };
const checks = [];
(async()=>{
 const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const output = path.resolve(__dirname,'../docs/media');fs.mkdirSync(output,{recursive:true});
 try {
  for(const [role,username] of Object.entries(accounts)) {
   const context=await browser.newContext({viewport:{width:1440,height:1050}});
   const loginResponse=await context.request.post(origin+'/api/v1/auth/login',{data:{username,password:'Admin123!'}});
   assert.equal(loginResponse.status(),201);const login=await loginResponse.json();
   await context.addInitScript(session=>localStorage.setItem('aali_session',JSON.stringify(session)),{...login.user,accessToken:login.accessToken});
   const page=await context.newPage();let errors=[],apiErrors=[];const pending=new Set();
   page.on('pageerror',error=>errors.push(error.message));
   page.on('request',request=>{if(request.url().includes('/api/v1/')&&!request.url().includes('live-stream'))pending.add(request);});
   page.on('requestfailed',request=>pending.delete(request));
   page.on('response',response=>{pending.delete(response.request());if(response.url().includes('/api/v1/')&&response.status()>=400)apiErrors.push({url:new URL(response.url()).pathname,status:response.status()});});
   for(const route of routes.filter(route=>route.roles.includes(role))) {
    errors=[];apiErrors=[];
    await page.goto(origin+route.path+'?mode=EXERCISE&districtCode=FENI_DIST');
    await page.locator('#main-content').waitFor();await page.waitForTimeout(500);
    const deadline=Date.now()+15000;while(pending.size && Date.now()<deadline)await page.waitForTimeout(150);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
    const item={role,path:route.path,errors:[...errors],apiErrors:[...apiErrors],overflow,passed:!errors.length&&!apiErrors.length&&!overflow};checks.push(item);
    console.log(`${item.passed?'PASS':'FAIL'} ${role} ${route.path} ${JSON.stringify({errors:item.errors,apiErrors:item.apiErrors,overflow})}`);
   }
   if(role==='AUTHORITY') {
    await page.goto(origin+'/control-room/brain?mode=LIVE&districtCode=FENI_DIST');
    const map=page.getByRole('region',{name:'Area intelligence map'});await map.waitFor();
    await page.locator('.brain-leaflet-map .leaflet-tile-loaded').first().waitFor({timeout:15000}).catch(()=>undefined);
    await page.screenshot({path:path.join(output,'brain-map-desktop.png'),fullPage:true});
    await page.getByRole('button',{name:/Sylhet.*Companiganj/}).click();
    await page.getByLabel('Analysis area').selectOption('sylhet');
    assert.equal(await page.getByLabel('Analysis area').inputValue(),'sylhet');
    await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);checks.push({role,path:'brain/mobile',overflow,passed:!overflow});
    await page.screenshot({path:path.join(output,'brain-map-mobile.png'),fullPage:true});
    await page.route('https://*.tile.openstreetmap.org/**',route=>route.abort());await page.reload();
    await page.getByText('Basemap tiles could not load.',{exact:false}).waitFor({timeout:15000});
    assert.equal(await page.getByRole('region',{name:'Area intelligence map'}).getByRole('button',{name:/Feni/}).count(),1);
    checks.push({role,path:'brain/tile-failure-list',passed:true});
   }
   await context.close();
  }
 } finally {await browser.close();}
 const report={generatedAt:new Date().toISOString(),checks,failed:checks.filter(check=>!check.passed).length};
 fs.writeFileSync(path.join(output,'browser-audit.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({screens:checks.length,failed:report.failed}));if(report.failed)process.exitCode=1;
})().catch(error=>{console.error(error.message);process.exitCode=1;});
