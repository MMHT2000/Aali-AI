import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OperationsSnapshot, OperationsSnapshotBase, getOperationsSnapshot } from '../lib/operations-client';
import { OperationsOverview } from './OperationsOverview';

vi.mock('../lib/operations-client', () => ({
  getOperationsSnapshot: vi.fn(),
  sendSimulationControl: vi.fn(),
}));

vi.mock('./OperationsMap', () => ({
  OperationsMap: () => <div data-testid="operations-map" />,
}));

const snapshotWithPendingSos: OperationsSnapshot = {
  generatedAt: '2026-10-09T21:03:57.000Z',
  role: 'AUTHORITY',
  context: {
    mode: 'EXERCISE',
    event: { id: '11111111-1111-1111-1111-111111111103', name: 'Synthetic Feni exercise', startAt: '2026-10-09T00:00:00Z', endAt: null, isReconstructed: false, provenance: 'SYNTHETIC_FIXTURE', provenanceNote: 'Demo fixture' },
    sources: [],
  },
  simulation: {
    scenarioId: 'feniflood-demo',
    scenarioName: 'Synthetic Feni exercise',
    provenance: 'SYNTHETIC_SCENARIO',
    isReconstructed: false,
    mode: 'PAUSED',
    tickIndex: 0,
    totalTicks: 5,
    running: false,
    simulatedAt: '2026-10-09T21:03:57.000Z',
    sourceData: {
      gauge: { valueM: 11.2, available: true, source: 'SYNTHETIC_SCENARIO' },
      rainfall: { valueMm: 22, available: true, source: 'SYNTHETIC_SCENARIO' },
      volunteerReading: { available: false, source: 'API_SUBMITTED_FIELD_READING' },
    },
    alert: { computedLevel: 'NORMAL', reasonCodes: [], reasonsBn: [] },
    incomingSos: 0,
    connectivity: { internetAvailable: true, source: 'SIMULATION' },
  },
  mapLayers: {
    areas: [], gauges: [], shelters: [], assets: [], incidents: [],
    sos: [{
      id: 'sos-mobile-1',
      shortId: 'ISMF',
      name: 'Chitholia',
      label: 'Chitholia - 4 people need help',
      status: 'NEEDS_REVIEW',
      peopleCount: 4,
      provenance: 'MOBILE_DIRECT_SOS',
      receivedAt: '2026-10-09T21:03:57.000Z',
    }],
  },
  queue: {
    activeIncidents: 0,
    strandedPeople: 0,
    incomingSimulatedSos: 0,
    reportsPendingReview: 1,
  },
  visibility: { sos: true, incidents: true, assets: true, simulationControls: true, aggregateOnly: false },
};

const liveSnapshot: OperationsSnapshotBase = {
  ...snapshotWithPendingSos,
  externalAlerts: [{
    id: 'cap-123', headline: 'Heavy rainfall warning', description: 'Heavy rainfall expected.', instruction: null,
    severity: 'Severe', urgency: 'Immediate', certainty: 'Likely', areas: ['Feni'],
    issuedAt: '2026-10-09T18:00:00Z', effectiveAt: '2026-10-09T18:00:00Z', expiresAt: '2026-10-10T18:00:00Z',
    sourceUrl: 'https://cap.bmd.gov.bd/api/cap/123.xml', fetchedAt: '2026-10-09T21:00:00Z', provenance: 'EXTERNAL_OBSERVATION',
  }],
  context: {
    mode: 'LIVE',
    event: null,
    sources: [{ id: 'ffwc', label: 'FFWC river data', availability: 'UNAVAILABLE', lastCheckedAt: null, latestObservedAt: null, ageSeconds: null, message: 'External provider adapter is not configured.', provenance: 'EXTERNAL_OBSERVATION' }],
  },
  simulation: undefined,
  mapLayers: { ...snapshotWithPendingSos.mapLayers, gauges: [], incidents: [], shelters: [], assets: [] },
};

describe('OperationsOverview situation room', () => {
  beforeEach(() => {
    vi.mocked(getOperationsSnapshot).mockResolvedValue(snapshotWithPendingSos);
  });

  it('alerts for an SOS awaiting review on initial load', async () => {
    render(<MemoryRouter><OperationsOverview /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('New SOS report');
      expect(screen.getByRole('alert')).toHaveTextContent('Chitholia');
      expect(screen.getByRole('alert')).toHaveTextContent('4 people reported');
    });
  });

  it('shows live source unavailability and keeps the API SOS alert visible', async () => {
    vi.mocked(getOperationsSnapshot).mockResolvedValue(liveSnapshot);
    render(<MemoryRouter><OperationsOverview mode="LIVE" /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Live sources' })).toBeInTheDocument();
    expect(screen.getByText('FFWC river data')).toBeInTheDocument();
    expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('New API-submitted SOS report');
  });

  it('shows BMD CAP as an external advisory separate from Aali rule output', async () => {
    vi.mocked(getOperationsSnapshot).mockResolvedValue({
      ...liveSnapshot,
      context: { ...liveSnapshot.context, sources: [{ id: 'bmd', label: 'BMD CAP public alerts', availability: 'AVAILABLE', lastCheckedAt: '2026-10-09T21:00:00Z', latestObservedAt: '2026-10-09T20:00:00Z', ageSeconds: 3600, message: '1 current unexpired Actual CAP alert from the public RSS entries.', provenance: 'EXTERNAL_OBSERVATION' }] },
    });
    render(<MemoryRouter><OperationsOverview mode="LIVE" /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Public weather advisories' })).toBeInTheDocument();
    expect(screen.getByText('Heavy rainfall warning')).toBeInTheDocument();
    expect(screen.getByText(/not an Aali warning or human approval/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open original CAP record' })).toHaveAttribute('href', 'https://cap.bmd.gov.bd/api/cap/123.xml');
  });

  it('renders the shared picture, review queue and deterministic evidence', async () => {
    render(<MemoryRouter><OperationsOverview /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Situation room' })).toBeInTheDocument();
    expect(screen.getByTestId('operations-map')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resident SOS' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Alert evidence' })).toBeInTheDocument();
    expect(screen.getByText(/Fixture data/)).toBeInTheDocument();
    expect(screen.getAllByText('MOBILE_DIRECT_SOS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('11.20 m').length).toBeGreaterThan(0);
  });

  it('switches from reports awaiting review to all SOS reports', async () => {
    render(<MemoryRouter><OperationsOverview /></MemoryRouter>);
    await screen.findByRole('heading', { name: 'Resident SOS' });

    fireEvent.click(screen.getByRole('button', { name: /All reports/ }));
    expect(screen.getByRole('button', { name: /Chitholia/ })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'SOS report filter' }).querySelector('button')?.getAttribute('aria-pressed')).toBe('false');
  });
});
