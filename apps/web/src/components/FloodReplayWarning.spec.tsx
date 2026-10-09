import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FloodReplayWarning, ReplayScenarioView, WarningView } from './FloodReplayWarning';

const mockScenarios: ReplayScenarioView[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Feni Flash Flood August 2024 Replay',
    nameBn: 'ফেনী আকস্মিক বন্যা আগস্ট ২০২৪ ঐতিহাসিক পুনঃনির্মাণ',
    description: 'Historical reconstruction of August 2024 Feni flood.',
    period: '2024-08-19 to 2024-08-24',
    isReconstructed: true,
    provenance: 'BWDB Muhuri Parshuram gauge logs',
    ticks: [
      {
        tickIndex: 0,
        simulatedTime: '2024-08-19T06:00:00Z',
        descriptionBn: 'পানি বাড়ছে স্বাভাবিক গতিতে।',
        signalA: { gaugeLevelM: 11.2, rise3hCm: 8, minutesSinceObservation: 10 },
        signalB: { rainfallMm: 22.0, windowMinutes: 180, minutesSinceObservation: 30 },
        signalC: { levelM: 11.25, isRapidRiseReported: false, minutesSinceObservation: 40 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 1,
        simulatedTime: '2024-08-19T15:00:00Z',
        descriptionBn: 'উজানে তীব্র বর্ষণ শুরু, গেজের পানি বৃদ্ধি শুরু।',
        signalA: { gaugeLevelM: 12.35, rise3hCm: 35, minutesSinceObservation: 10 },
        signalB: { rainfallMm: 95.0, windowMinutes: 180, minutesSinceObservation: 20 },
        signalC: { levelM: 12.4, isRapidRiseReported: true, minutesSinceObservation: 15 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
    ],
  },
];

const mockWarnings: WarningView[] = [
  {
    id: 'warn-101',
    event_id: '11111111-1111-1111-1111-111111111101',

    state: 'PENDING_APPROVAL',
    body_bn: 'জরুরি সতর্কতা: পরশুরাম এলাকায় নদীর পানির উচ্চতা বৃদ্ধি পেয়েছে। পরশুরাম সরকারি মডেল উচ্চ বিদ্যালয় আশ্রয়কেন্দ্রে যান।',
    created_at: '2024-08-19T16:00:00Z',
    approved_by: null,
    approved_at: null,
  },
];

describe('FloodReplayWarning Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/api/v1/replay/scenarios')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockScenarios,
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/warnings') && (!options || options.method === 'GET' || !options.method)) {
        return Promise.resolve({
          ok: true,
          json: async () => mockWarnings,
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/alerts/evaluate')) {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        const isBlanked = body.signalA?.isBlanked;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            computedLevel: isBlanked ? 'WARNING' : 'NORMAL',
            baseLevel: 'NORMAL',
            isEscalatedBySilentGauge: !!isBlanked,
            signalsFired: {
              signalA_Gauge: !isBlanked,
              signalB_Rainfall: true,
              signalC_Volunteer: false,
              breachReported: false,
            },
            reasonCodes: isBlanked ? ['GAUGE_SILENT'] : ['NORMAL_FLOW'],
            reasonsBn: isBlanked ? ['গেজ ৬০ মিনিট ধরে তথ্যহীন'] : ['স্বাভাবিক প্রবাহ'],
            computedLeadTimeHours: 4.5,
            prototypeNotice: 'Prototype starting values for decision-support demo only.',
          }),
        });
      }
      if (typeof url === 'string' && url.includes('/approve')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...mockWarnings[0],
            state: 'APPROVED',
            approved_by: '00000000-0000-0000-0000-000000000002',
            approved_at: new Date().toISOString(),
            approval_note: 'Approved by Authority',
          }),
        });
      }
      if (typeof url === 'string' && url.includes('/send-simulated')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, simulation: true }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));
  });

  it('renders historical reconstructed disclaimer and title', async () => {
    render(<FloodReplayWarning mode="HISTORICAL" eventId="11111111-1111-1111-1111-111111111101" session={{ id: 'u1', username: 'authority', displayName: 'Authority', role: 'AUTHORITY', accessToken: 'token' }} />);

    expect(screen.getByText(/RECONSTRUCTED \/ NOT LIVE — ঐতিহাসিক পুনঃনির্মাণ ডেমো/i)).toBeInTheDocument();
    expect(screen.getByText(/বন্যা সংকেত ও ঐতিহাসিক রিপ্লে \/ Three-Signal Flood Alert & Replay/i)).toBeInTheDocument();
  });

  it('renders three signal elements with calculated lead-time', async () => {
    render(<FloodReplayWarning mode="HISTORICAL" eventId="11111111-1111-1111-1111-111111111101" session={{ id: 'u1', username: 'authority', displayName: 'Authority', role: 'AUTHORITY', accessToken: 'token' }} />);

    await waitFor(() => {
      expect(screen.getByText(/সংকেত ক: নদীর গেজ \(Signal A\)/i)).toBeInTheDocument();
      expect(screen.getByText(/সংকেত খ: স্যাটেলাইট বৃষ্টি \(Signal B\)/i)).toBeInTheDocument();
      expect(screen.getByText(/সংকেত গ: স্বেচ্ছাসেবক রিপোর্ট \(Signal C\)/i)).toBeInTheDocument();
      expect(screen.getByText('4.5 ঘণ্টা (+4.5h)')).toBeInTheDocument();
    });
  });

  it('demonstrates gauge blanking sensor blackout escalation', async () => {
    render(<FloodReplayWarning mode="HISTORICAL" eventId="11111111-1111-1111-1111-111111111101" session={{ id: 'u1', username: 'authority', displayName: 'Authority', role: 'AUTHORITY', accessToken: 'token' }} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/গেজ ব্ল্যাকআউট সিমুলেশন \(Simulate Gauge Blanked\)/i)).toBeInTheDocument();
    });

    const blankToggle = screen.getByLabelText(/গেজ ব্ল্যাকআউট সিমুলেশন \(Simulate Gauge Blanked\)/i);
    fireEvent.click(blankToggle);

    await waitFor(() => {
      expect(screen.getByText(/গেজ তথ্যহীনতায় স্তর বৃদ্ধি \(GAUGE_SILENT Escalation\)/i)).toBeInTheDocument();
    });
  });

  it('requires authority role for warning approval', async () => {
    render(<FloodReplayWarning mode="HISTORICAL" eventId="11111111-1111-1111-1111-111111111101" session={{ id: 'u1', username: 'authority', displayName: 'Authority', role: 'AUTHORITY', accessToken: 'token' }} />);

    await waitFor(() => {
      expect(screen.getByText('✓ অনুমোদন করুন (Approve as Authority)')).toBeInTheDocument();
    });

    const approveBtn = screen.getByText('✓ অনুমোদন করুন (Approve as Authority)');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(screen.getByText(/সতর্কতা warn-101 সফলভাবে অনুমোদিত হয়েছে \(Approved\)/i)).toBeInTheDocument();
    });
  });

  it('does not load reconstructed replay in Live mode', async () => {
    const request = vi.mocked(globalThis.fetch);
    render(<FloodReplayWarning mode="LIVE" session={{ id: 'u1', username: 'authority', displayName: 'Authority', role: 'AUTHORITY', accessToken: 'token' }} />);

    expect(screen.getByText(/Live source mode: replay controls are unavailable/)).toBeInTheDocument();
    await waitFor(() => expect(request).not.toHaveBeenCalledWith('/api/v1/replay/scenarios'));
    expect(screen.queryByText(/RECONSTRUCTED \/ NOT LIVE/)).not.toBeInTheDocument();
  });

  it('keeps responder historical replay read-only', async () => {
    render(<FloodReplayWarning mode="HISTORICAL" eventId="11111111-1111-1111-1111-111111111101" session={{ id: 'r1', username: 'responder', displayName: 'Responder', role: 'RESPONDER', accessToken: 'token' }} />);

    expect(await screen.findByText(/read-only replay access/)).toBeInTheDocument();
    expect(screen.queryByText(/Approve as Authority/)).not.toBeInTheDocument();
    expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalledWith('/api/v1/alerts/evaluate', expect.anything());
  });
});

