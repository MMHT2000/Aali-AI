// Read-only verification: never invokes brain/run or opens a browser.
const assert = require('node:assert/strict');
const base = process.env.AALI_API_URL || 'http://127.0.0.1:3001/api/v1';
(async () => {
 const login = await fetch(base+'/auth/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'authority_dc',password:'Admin123!'})});
 assert.equal(login.status,201); const {accessToken} = await login.json();
 async function get(path) {const response=await fetch(base+'/'+path,{headers:{Authorization:'Bearer '+accessToken}});assert.equal(response.status,200);return response.json();}
 const status=await get('brain/autonomy/status'); assert.equal(status.enabled,true);
 if(status.running) { console.log('Background sweep still running; retry this read-only check after completion.'); process.exitCode=2; return; }
 assert.ok(status.lastCompletedAt); const areas=await get('brain/areas');
 for(const area of areas) {
  const record=status.areas[area.id+':LIVE']; assert.ok(record?.runId, area.id+' background save missing');
  const plan=await get('brain/latest?areaId='+area.id+'&mode=LIVE'); assert.equal(plan.id,record.runId);
  assert.equal(plan.operations.provenance,'NO_VERIFIED_OPERATIONAL_DATA');
 }
 console.log('PASS: all six live areas were saved by the server worker without a browser or manual run request.');
 console.log(JSON.stringify({lastCompletedAt:status.lastCompletedAt,areas:status.areas},null,2));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
