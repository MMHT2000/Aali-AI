import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getOperationsSnapshot, OperationsSnapshotBase, OperationsSnapshotError } from '../lib/operations-client';
import { ViewerSituationSummary } from './ViewerSituationSummary';

vi.mock('../lib/operations-client', async importOriginal => ({ ...await importOriginal<typeof import('../lib/operations-client')>(), getOperationsSnapshot: vi.fn() }));

const aggregateSnapshot: OperationsSnapshotBase = {
  role: 'VIEWER',
  generatedAt: '2026-10-10T00:00:00.000Z',
  context: { mode: 'EXERCISE', event: {
    id: 'event-1', name: 'Synthetic Feni exercise', startAt: '2026-10-10T00:00:00.000Z', endAt: null,
    isReconstructed: false, provenance: 'SYNTHETIC_FIXTURE', provenanceNote: 'Synthetic test event.',
  }, sources: [
    { id: 'exercise', label: 'Exercise scenario', availability: 'SYNTHETIC', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'Synthetic only.', provenance: 'SYNTHETIC_SIMULATION' },
    { id: 'ffwc', label: 'FFWC river data', availability: 'UNAVAILABLE', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'Not configured.', provenance: 'EXTERNAL_OBSERVATION' },
  ] },
  mapLayers: {
    areas: [{ id: 'area-1', provenance: 'SYNTHETIC_FIXTURE' }],
    gauges: [{ id: 'gauge-1', provenance: 'SYNTHETIC_SIMULATION' }],
    shelters: [{ id: 'shelter-1', provenance: 'SYNTHETIC_FIXTURE' }],
    assets: [], incidents: [], sos: [],
  },
  queue: {}, visibility: { sos: false, incidents: false, assets: false, simulationControls: false, aggregateOnly: true },
};

describe('ViewerSituationSummary', () => {
  beforeEach(() => { vi.mocked(getOperationsSnapshot).mockReset(); });

  it('shows aggregate source and reference counts without operational records', async () => {
    vi.mocked(getOperationsSnapshot).mockResolvedValue(aggregateSnapshot);
    render(<ViewerSituationSummary mode="EXERCISE" />);

    expect(await screen.findByRole('heading', { name: 'Feni situation summary' })).toBeInTheDocument();
    expect(screen.getByText('No individual SOS or rescue records')).toBeInTheDocument();
    expect(screen.getByText('Reference areas')).toBeInTheDocument();
    expect(screen.getByText('Not configured.')).toBeInTheDocument();
    expect(screen.queryByText(/simulation controls/i)).not.toBeInTheDocument();
  });

  it('fails closed if API sends a non-aggregate snapshot', async () => {
    vi.mocked(getOperationsSnapshot).mockResolvedValue({
      ...aggregateSnapshot,
      mapLayers: { ...aggregateSnapshot.mapLayers, sos: [{ id: 'private-sos', provenance: 'API_SUBMITTED_REPORT' }] },
    });
    render(<ViewerSituationSummary mode="LIVE" />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('aggregate-only Viewer snapshot'));
    expect(screen.queryByText('Feni situation summary')).not.toBeInTheDocument();
  });
  it('offers sign-in instead of a retry loop after a 401', async () => {
    vi.mocked(getOperationsSnapshot).mockRejectedValue(new OperationsSnapshotError(401));
    render(<ViewerSituationSummary mode="EXERCISE" />);
    expect(await screen.findByRole('heading', { name: 'Sign-in required' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in again' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });
});
