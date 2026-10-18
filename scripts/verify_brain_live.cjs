// Reads public providers only. No database, GPT key or operational action required.
process.env.TS_NODE_PROJECT = require('path').resolve(__dirname, '../apps/api/tsconfig.json');
require('ts-node/register/transpile-only');
const { EnvironmentalDataService } = require('../apps/api/src/modules/brain/environmental-data.service');
const { BRAIN_AREAS } = require('../apps/api/src/modules/brain/brain.types');
const { buildBrainPlan } = require('../apps/api/src/modules/brain/brain-planner');
(async () => {
  const selected = process.argv[2] === 'all' ? BRAIN_AREAS : [BRAIN_AREAS.find(a => a.id === (process.argv[2] || 'feni'))];
  if (selected.some(area => !area)) throw new Error('Unknown area');
  const summaries = [];
  const service = new EnvironmentalDataService();
  for (const area of selected) {
  const data = await service.get(area);
  const plan = buildBrainPlan('live-source-check', area, 'LIVE', data, { provenance: 'NO_VERIFIED_OPERATIONAL_DATA', reports: [], shelters: [], relief: [] });
  const summary = { area: area.id, checkedAt: plan.createdAt, evidence: data.evidence, days: data.days, grid: data.grid, satelliteScenes: data.imagery.map(i => ({ id: i.id, acquiredAt: i.acquiredAt, cloudPercent: i.cloudPercent })), screening: plan.risk };
  summaries.push(summary);
  if (process.argv[2] === 'all') console.log(`${area.id}: ${data.evidence.map(e => `${e.provider}=${e.status}`).join(', ')}; scenes=${data.imagery.length}`);
  else console.log(JSON.stringify(summary, null, 2));
  if (!data.evidence.some(e => e.status === 'AVAILABLE')) process.exitCode = 2;
  }
  if (process.argv[2] === 'all') require('fs').writeFileSync(require('path').resolve(__dirname, '../docs/media/brain-live-verification.json'), JSON.stringify(summaries, null, 2));
})().catch(() => { console.error('Live provider verification failed. No result substituted.'); process.exitCode = 1; });
