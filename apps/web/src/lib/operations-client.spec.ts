import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './authenticated-fetch';
import { getOperationsSnapshot } from './operations-client';

vi.mock('./authenticated-fetch', () => ({ apiFetch: vi.fn() }));

describe('operations snapshot client context', () => {
  beforeEach(() => vi.mocked(apiFetch).mockResolvedValue({
    ok: true,
    json: async () => ({
      context: { mode: 'EXERCISE', event: null, sources: [] },
      mapLayers: { areas: [], gauges: [], shelters: [], assets: [], incidents: [], sos: [] },
      visibility: { sos: false, incidents: false, assets: false, simulationControls: false, aggregateOnly: true },
    }),
  } as Response));

  it('passes the selected mode and historical event as validated query context', async () => {
    await getOperationsSnapshot({ mode: 'HISTORICAL', eventId: '11111111-1111-1111-1111-111111111102' });
    expect(apiFetch).toHaveBeenCalledWith('/api/v1/operations/snapshot?mode=HISTORICAL&eventId=11111111-1111-1111-1111-111111111102');
  });

  it('omits mode parameters when using the backward-compatible exercise default', async () => {
    await getOperationsSnapshot();
    expect(apiFetch).toHaveBeenCalledWith('/api/v1/operations/snapshot');
  });

  it('reports an outdated API contract instead of passing a malformed snapshot to React', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => ({ generatedAt: '2026-01-01T00:00:00Z' }) } as Response);

    await expect(getOperationsSnapshot({ mode: 'EXERCISE' })).rejects.toThrow(/API is outdated/);
  });
});
