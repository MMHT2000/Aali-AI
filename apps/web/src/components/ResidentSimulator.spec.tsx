import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResidentSimulator } from './ResidentSimulator';

describe('ResidentSimulator Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/v1/auth/resident-register')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            residentId: 'res-sim-101',
            nidHash: 'mock-hash-1234',
            nidLast4: '1829',
            phoneNumberRedacted: '017****344',
            registeredAt: '2026-10-09T18:00:00Z',
            disclaimer: 'Demo NID format check — not identity verification.',
          }),
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/sos')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 'sos-sim-001', status: 'RECEIVED' }),
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/gateway/simulated/ingest')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'PROCESSED', packetId: 'SIM1' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));
  });

  it('renders simulator disclosure banner and resident onboarding form', () => {
    render(<ResidentSimulator />);

    expect(screen.getByText(/ড্যাশবোর্ড রেসিডেন্ট ক্লায়েন্ট সিমুলেটর/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo NID format check — not identity verification/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('1984261829')).toBeInTheDocument();
  });

  it('submits mock NID registration and displays masked confirmation', async () => {
    render(<ResidentSimulator />);

    const submitBtn = screen.getByText(/অনবোর্ড করুন \(Register & Validate NID\)/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/এনআইডি ফরম্যাট ও ইউনিকনেস সফলভাবে যাচাইকৃত!/i)).toBeInTheDocument();
      expect(screen.getByText(/res-sim-101/i)).toBeInTheDocument();
      expect(screen.getByText(/\*\*\*\*1829/i)).toBeInTheDocument();
    });
  });

  it('handles offline connectivity toggle and queues packet locally', async () => {
    render(<ResidentSimulator />);

    const offlineToggleBtn = screen.getByText(/ইন্টারনেট বিচ্ছিন্ন করুন \(Simulate Offline\)/i);
    fireEvent.click(offlineToggleBtn);

    expect(screen.getByText(/🔴 অফলাইন \(Offline\)/i)).toBeInTheDocument();

    const sendSosBtn = screen.getByText(/🚨 এসওএস পাঠান \/ SUBMIT SOS/i);
    fireEvent.click(sendSosBtn);

    await waitFor(() => {
      expect(screen.getByText(/ইন্টারনেট সংযোগ বিচ্ছিন্ন! এসওএস লোকাল আউটবক্সে জমা রাখা হয়েছে/i)).toBeInTheDocument();
      expect(screen.getByText(/অ্যান্ড্রয়েড এসএমএস কম্পোজার ওপেন করুন/i)).toBeInTheDocument();
      expect(screen.getByText(/গেটওয়ে ট্রানজিট ডেমো চালান/i)).toBeInTheDocument();
    });
  });
});

