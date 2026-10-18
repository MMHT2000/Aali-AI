import { ConfigService } from '@nestjs/config';
import { OpenAiBrainAgent } from './openai-brain-agent';
import { buildBrainPlan } from './brain-planner';
import { BRAIN_AREAS } from './brain.types';
import { exerciseEnvironment } from './environmental-data.service';

describe('bounded GPT brain agent', () => {
  const original = global.fetch;
  const makePlan = () => buildBrainPlan('run', BRAIN_AREAS[0], 'EXERCISE', exerciseEnvironment(BRAIN_AREAS[0]), { provenance: 'NO_VERIFIED_OPERATIONAL_DATA', reports: [], shelters: [], relief: [] });
  afterEach(() => { global.fetch = original; });
  const agent = (key = 'test-key') => new OpenAiBrainAgent(new ConfigService({ OPENAI_API_KEY: key, OPENAI_MODEL: 'test-model' }));
  function response(output: unknown[]) { return new Response(JSON.stringify({ status: 'completed', output })); }
  const call = (name: string) => ({ type: 'function_call', name, arguments: '{}', call_id: `call-${name}` });
  it('does not call external services without a key', async () => {
    global.fetch = jest.fn(); const result = await agent('').review(makePlan()); expect(result.status).toBe('NO_OPENAI_KEY_LOCAL_PLANNER'); expect(fetch).not.toHaveBeenCalled();
  });
  it('executes read-only tools, validates references and disables response storage', async () => {
    const plan = makePlan();
    global.fetch = jest.fn().mockResolvedValueOnce(response([call('read_forecast')])).mockResolvedValueOnce(response([call('read_proposed_actions')])).mockResolvedValueOnce(response([{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ summary: 'Synthetic exercise. Review preparation tasks.', focusActionIds: [plan.actions[0].id] }) }] }]));
    const result = await agent().review(plan); expect(result.provider).toBe('OPENAI'); expect(result.trace).toHaveLength(2);
    const request = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body); expect(request.store).toBe(false); expect(request.tools.every((t: { name: string }) => t.name.startsWith('read_'))).toBe(true);
  });
  it.each(['dispatch_boat', 'fetch_url', 'delete_report'])('rejects unauthorised tool %s', async name => {
    global.fetch = jest.fn().mockResolvedValue(response([call(name)])); expect((await agent().review(makePlan())).status).toBe('OPENAI_FAILED_LOCAL_PLANNER');
  });
  it('rejects model conclusions without reading required evidence', async () => {
    global.fetch = jest.fn().mockResolvedValue(response([{ type: 'message', content: [{ type: 'output_text', text: '{"summary":"Everything is safe","focusActionIds":[]}' }] }]));
    expect((await agent().review(makePlan())).provider).toBe('LOCAL_PLANNER');
  });
  it('rejects fabricated action IDs', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(response([call('read_forecast'), call('read_proposed_actions')])).mockResolvedValueOnce(response([{ type: 'message', content: [{ type: 'output_text', text: '{"summary":"Draft","focusActionIds":["fake-id"]}' }] }]));
    expect((await agent().review(makePlan())).provider).toBe('LOCAL_PLANNER');
  });
  it('bounds repetitive tool loops', async () => {
    global.fetch = jest.fn().mockImplementation(async () => response([call('read_forecast')])); expect((await agent().review(makePlan())).provider).toBe('LOCAL_PLANNER'); expect(fetch).toHaveBeenCalledTimes(7);
  });
  it.each([401, 429, 500])('preserves local plan on provider HTTP %d', async status => {
    global.fetch = jest.fn().mockResolvedValue(new Response('{}', { status })); expect((await agent().review(makePlan())).provider).toBe('LOCAL_PLANNER');
  });
  it('preserves local plan on invalid JSON and network error', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('not json')); expect((await agent().review(makePlan())).provider).toBe('LOCAL_PLANNER');
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')); expect((await agent().review(makePlan())).provider).toBe('LOCAL_PLANNER');
  });
});
