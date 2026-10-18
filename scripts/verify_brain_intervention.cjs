const assert = require('node:assert/strict');
const base = process.env.AALI_API_URL || 'http://127.0.0.1:3001/api/v1';
(async()=>{
 const auth=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'authority_dc',password:'Admin123!'})});
 assert.equal(auth.status,201);const {accessToken}=await auth.json();
 async function request(path,body){const response=await fetch(base+'/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+accessToken},body:body?JSON.stringify(body):undefined});assert.equal(response.status,body?201:200);return response.json();}
 const command=process.argv[2] || 'check';
 if(command==='pause'||command==='resume') {
  const state=await request('brain/autonomy/control',{scope:'kurigram',paused:command==='pause',reason:'Synthetic verification of persisted human intervention'});
  assert.equal(state.controls.find(control=>control.scope==='kurigram')?.paused,command==='pause');
  const audit=await request('audit-logs?entityType=BRAIN_CONTROL');assert.ok(audit.some(row=>row.action===(command==='pause'?'PAUSE_AUTONOMY':'RESUME_AUTONOMY')&&row.after_summary?.scope==='kurigram'));
  console.log('PASS: '+command+' persisted with audit.');
 } else {
  const state=await request('brain/autonomy/status');assert.ok(state.controls.some(control=>control.scope==='kurigram'&&control.paused));
  assert.equal(state.areas['kurigram:LIVE']?.status,'PAUSED_BY_HUMAN');
  assert.ok(state.areas['feni:LIVE']?.runId);
  console.log('PASS: pause survived restart; Kurigram skipped and Feni monitored.');
 }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
