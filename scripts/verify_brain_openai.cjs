// Real GPT smoke using only synthetic fixtures. Never prints credentials or provider error messages.
const path = require('path');
process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../apps/api/tsconfig.json');
require('ts-node/register/transpile-only');
const fs = require('fs');
const env = require('dotenv').parse(fs.readFileSync(path.resolve(__dirname, '../.env')));
const { ConfigService } = require('@nestjs/config');
const { OpenAiBrainAgent } = require('../apps/api/src/modules/brain/openai-brain-agent');
const { buildBrainPlan } = require('../apps/api/src/modules/brain/brain-planner');
const { BRAIN_AREAS } = require('../apps/api/src/modules/brain/brain.types');
const { exerciseEnvironment } = require('../apps/api/src/modules/brain/environmental-data.service');
(async () => {
  const plan = buildBrainPlan('synthetic-gpt-check', BRAIN_AREAS[0], 'EXERCISE', exerciseEnvironment(BRAIN_AREAS[0]), { provenance: 'SYNTHETIC_EXERCISE', reports: [{ id: 'synthetic-report', people: 5, trapped: true, medical: true, child: true, receivedAt: new Date().toISOString() }], shelters: [], relief: [{ id: 'synthetic-gap', areaName: 'Synthetic village', waterNeed: 1000, waterDelivered: 0, foodNeed: 50, foodDelivered: 0 }] });
  const started = Date.now();
  const agent = await new OpenAiBrainAgent(new ConfigService(env)).review(plan);
  console.log(JSON.stringify({ provider: agent.provider, status: agent.status, elapsedMs: Date.now() - started, summary: agent.summary, focusActionIds: agent.focusActionIds, trace: agent.trace }, null, 2));
  if (agent.provider !== 'OPENAI') {
    // Diagnose connectivity/auth/quota independently, without exposing error.message (may include a key).
    if (env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000), body: JSON.stringify({ model: env.OPENAI_MODEL || 'gpt-4.1-mini', store: false, input: 'Return OK.', max_output_tokens: 16 }) });
      const body = await response.json(); const code = body.error?.code;
      console.log(JSON.stringify({ diagnosticHttpStatus: response.status, diagnosticErrorCode: typeof code === 'string' && /^[a-z_]{1,80}$/i.test(code) ? code : null, responseStatus: body.status ?? null }));
    }
    process.exitCode = 2;
  }
})().catch(() => { console.error('Real GPT verification could not complete; no credential or raw provider error printed.'); process.exitCode = 1; });
