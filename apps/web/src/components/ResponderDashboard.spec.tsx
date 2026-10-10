import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponderDashboard, IncidentViewItem, SilentVillageItem } from './ResponderDashboard';
import { getOperationsSnapshot, OperationsSnapshotBase } from '../lib/operations-client';

vi.mock('../lib/operations-client', () => ({ getOperationsSnapshot: vi.fn() }));

const mockIncidents: IncidentViewItem[] = [
  {
    id: 'inc-feni-001',
    summary: 'Mirzanagar Ward 3 Embankment Overflow - 8 People Stranded on Roof',
    areaName: 'Mirzanagar / মির্জানগর',
    peopleCount: 8,
    urgencyFlags: { child: true, elderly: true, medical: true, trapped: true },
    confidence: 0.85,
    confidenceReasons: ['Known volunteer sender (+0.20)', 'Multiple corroborating reports (+0.15)'],
    priorityScore: 0.92,
    priorityReasons: ['People count: 8 (80% normalized)', 'Elderly flag active (25%)'],
    status: 'OPEN',
    reportsCount: 2,
    linkedReportIds: ['sos-demo-1', 'sos-demo-2'],
    duplicateCandidate: {
      candidateId: 'dup-cand-001',
      similarityScore: 0.88,
      reasons: ['Within 50m radius', 'Similar vulnerable demographics'],
      status: 'PENDING',
    },
    suggestedBoat: {
      assetId: '77777777-7777-7777-7777-777777777701',
      name: 'Engine Boat Red Crescent Unit 1',
      capacity: 12,
      suitability: 'SHALLOW_DRAFT',
    },
  },
];

const mockSilentAreas: SilentVillageItem[] = [
  {
    isSilentVillage: true,
    actionRequired: 'VERIFY_BY_SAFE_MEANS',
    statusLabel: 'SILENT_VILLAGE_FLAGGED',
    reason: 'Village Chitholia Union has WARNING alert, high exposure, 0 reports for >20 mins, but neighboring Parshuram reports flood.',
  },
];

describe('ResponderDashboard Component', () => {
  beforeEach(() => {
    vi.mocked(getOperationsSnapshot).mockReset();
    vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/api/v1/incidents/silent-areas')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSilentAreas,
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/incidents') && (!options || options.method === 'GET' || !options.method)) {
        return Promise.resolve({
          ok: true,
          json: async () => mockIncidents,
        });
      }
      if (typeof url === 'string' && (url.includes('/review') || url.includes('/split'))) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }
      return Promise.reject(new Error('Unknown url ' + url));
    }));
  });

  it('uses the selected Live context and displays API SOS records without exercise incidents', async () => {
    const liveSnapshot: OperationsSnapshotBase = {
      generatedAt: '2026-10-10T00:00:00Z',
      role: 'RESPONDER',
      context: { mode: 'LIVE', event: null, sources: [] },
      mapLayers: {
        areas: [], gauges: [], shelters: [], assets: [], incidents: [],
        sos: [{ id: 'api-sos-1', name: 'Chitholia', status: 'NEEDS_REVIEW', peopleCount: 2, provenance: 'API_SUBMITTED_REPORT', receivedAt: '2026-10-10T00:00:00Z' }],
      },
      queue: {},
      visibility: { sos: true, incidents: true, assets: true, simulationControls: false, aggregateOnly: false },
    };
    vi.mocked(getOperationsSnapshot).mockResolvedValue(liveSnapshot);
    render(<ResponderDashboard mode="LIVE" />);

    await waitFor(() => expect(screen.getByText('Chitholia')).toBeInTheDocument());
    expect(screen.getByText(/API_SUBMITTED_REPORT/)).toBeInTheDocument();
    expect(screen.queryByText('Mirzanagar Ward 3 Embankment Overflow - 8 People Stranded on Roof')).not.toBeInTheDocument();
  });

  it('renders dashboard title and KPIs correctly', async () => {
    render(<ResponderDashboard />);

    expect(screen.getByRole('heading', { name: 'Responder desk' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mirzanagar Ward 3 Embankment Overflow - 8 People Stranded on Roof')).toBeInTheDocument();
    });

    expect(screen.getByText('Priority 92%')).toBeInTheDocument();
    expect(screen.getByText('Confidence 85%')).toBeInTheDocument();
  });

  it('displays silent-village verification flag with VERIFY BY SAFE MEANS instruction', async () => {
    render(<ResponderDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Verification flags · verify by safe means/i)).toBeInTheDocument();
      expect(screen.getByText(/Village Chitholia Union has WARNING alert/i)).toBeInTheDocument();
    });
  });

  it('handles human review actions for duplicates with audit feedback', async () => {
    render(<ResponderDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Accept merge' })).toBeInTheDocument();
    });

    const mergeBtn = screen.getByRole('button', { name: 'Accept merge' });
    fireEvent.click(mergeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Duplicate candidate accepted and recorded/i)).toBeInTheDocument();
    });
  });

  it('handles unmerge/split reports action with audit feedback', async () => {
    render(<ResponderDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Separate report sos-demo-1' })).toBeInTheDocument();
    });

    const splitBtn = screen.getByRole('button', { name: 'Separate report sos-demo-1' });
    fireEvent.click(splitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Report sos-demo-1 separated into an independent incident/i)).toBeInTheDocument();
    });
  });

  it('allows responder human acceptance of boat recommendation without auto-dispatch', async () => {
    render(<ResponderDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Accept suggestion' })).toBeInTheDocument();
      expect(screen.getByText(/does not contact or dispatch an asset/i)).toBeInTheDocument();
    });

    const acceptBtn = screen.getByRole('button', { name: 'Accept suggestion' });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(screen.getByText(/Boat recommendation accepted for review/i)).toBeInTheDocument();
    });
  });
});
