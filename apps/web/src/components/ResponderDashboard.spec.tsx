import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponderDashboard, IncidentViewItem, SilentVillageItem } from './ResponderDashboard';

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

  it('renders dashboard title and KPIs correctly', async () => {
    render(<ResponderDashboard />);

    expect(screen.getByText(/রেসপন্ডার ড্যাশবোর্ড \/ Responder Operations Dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mirzanagar Ward 3 Embankment Overflow - 8 People Stranded on Roof')).toBeInTheDocument();
    });

    expect(screen.getByText('Priority: 92%')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
  });

  it('displays silent-village verification flag with VERIFY BY SAFE MEANS instruction', async () => {
    render(<ResponderDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/SILENT VILLAGE FLAG \(Action: VERIFY BY SAFE MEANS\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Village Chitholia Union has WARNING alert/i)).toBeInTheDocument();
    });
  });

  it('handles human review actions for duplicates with audit feedback', async () => {
    render(<ResponderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('✓ মার্জ অনুমোদন (Accept Merge)')).toBeInTheDocument();
    });

    const mergeBtn = screen.getByText('✓ মার্জ অনুমোদন (Accept Merge)');
    fireEvent.click(mergeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Duplicate candidate ACCEPTED successfully/i)).toBeInTheDocument();
    });
  });

  it('handles unmerge/split reports action with audit feedback', async () => {
    render(<ResponderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('আলাদা করুন sos-demo-1')).toBeInTheDocument();
    });

    const splitBtn = screen.getByText('আলাদা করুন sos-demo-1');
    fireEvent.click(splitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Report sos-demo-1 separated into independent incident/i)).toBeInTheDocument();
    });
  });

  it('allows responder human acceptance of boat recommendation without auto-dispatch', async () => {
    render(<ResponderDashboard />);

    await waitFor(() => {
      expect(screen.getByText('✓ গ্রহণ (Accept)')).toBeInTheDocument();
      expect(screen.getByText(/No auto-dispatch/i)).toBeInTheDocument();
    });

    const acceptBtn = screen.getByText('✓ গ্রহণ (Accept)');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(screen.getByText(/Boat recommendation ACCEPTED/i)).toBeInTheDocument();
    });
  });
});
