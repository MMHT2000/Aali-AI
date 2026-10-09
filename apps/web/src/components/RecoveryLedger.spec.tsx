import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecoveryLedger } from './RecoveryLedger';

const mockSummary = {
  villagesRanking: [
    {
      villageId: '22222222-2222-2222-2222-222222222205',
      villageName: 'চিথলিয়া (Chitholia)',
      priorityScore: 78,
      urgencyLevel: 'CRITICAL',
      factorBreakdown: {
        damageFactor: 35,
        tubeWellFactor: 25,
        roadCutOffFactor: 20,
        healthFactor: 20,
      },
      reasonsBn: [
        'বসতবাড়ি মারাত্মক ক্ষতিগ্রস্ত (DESTROYED)',
        'নলকূপ দূষিত হওয়ায় সুপেয় পানির তীব্র সংকট',
      ],
      waterCoverageRatio: 0.0,
      foodCoverageRatio: 0.0,
      overallCoveragePercentage: 0,
      disclaimer: 'Rankings support logistical coordination and relief transparency, not beneficiary eligibility.',
    },
    {
      villageId: '22222222-2222-2222-2222-222222222204',
      villageName: 'মির্জানগর (Mirzanagar)',
      priorityScore: 28,
      urgencyLevel: 'MEDIUM',
      factorBreakdown: {
        damageFactor: 25,
        tubeWellFactor: 0,
        roadCutOffFactor: 8,
        healthFactor: 10,
      },
      reasonsBn: ['বসতবাড়ি ক্ষতিগ্রস্ত (SEVERE)'],
      waterCoverageRatio: 0.6,
      foodCoverageRatio: 0.8,
      overallCoveragePercentage: 70,
      disclaimer: 'Rankings support logistical coordination and relief transparency, not beneficiary eligibility.',
    },
  ],
  totalReports: 2,
  totalDeliveries: 1,
  disclaimer: 'Rankings support logistical coordination and relief transparency, not beneficiary eligibility.',
};

const mockDeliveries = [
  {
    id: 'aid-del-01',
    area_id: '22222222-2222-2222-2222-222222222204',
    organization_label: 'Bangladesh Red Crescent Society (BDRCS)',
    item_code: 'CLEAN_WATER',
    quantity: 1500,
    unit: 'LITRES',
    delivered_at: '2026-10-09T13:00:00Z',
    idempotency_key: 'bdrcs-mirzanagar-water-batch-01',
  },
];

describe('RecoveryLedger Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/api/v1/recovery/summary')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSummary,
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/recovery/deliveries') && (!options || options.method === 'GET' || !options.method)) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDeliveries,
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/recovery/deliveries') && options?.method === 'POST') {
        const body = options.body ? JSON.parse(options.body as string) : {};
        const isDuplicate = body.idempotencyKey === 'existing-duplicate-key';
        return Promise.resolve({
          ok: true,
          json: async () => ({
            delivery: { ...mockDeliveries[0], idempotency_key: body.idempotencyKey },
            isDuplicateIgnored: isDuplicate,
          }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));
  });

  it('renders recovery header and eligibility disclaimer', () => {
    render(<RecoveryLedger />);

    expect(screen.getByText(/পুনর্বাসন সমন্বয় ও ত্রাণ খতিয়ান \/ Recovery Coordination & Aid Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Aali AI never algorithmically decides who deserves aid/i)).toBeInTheDocument();
  });

  it('renders village unmet-needs ranking with coverage and reasons', async () => {
    render(<RecoveryLedger />);

    await waitFor(() => {
      expect(screen.getByText(/নলকূপ দূষিত হওয়ায় সুপেয় পানির তীব্র সংকট/)).toBeInTheDocument();
      expect(screen.getAllByText(/চিথলিয়া \(Chitholia\)/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/মির্জানগর \(Mirzanagar\)/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/জরুরি \(Critical\)/)).toBeInTheDocument();
    });
  });

  it('submits a new aid delivery receipt and records ledger entry', async () => {
    render(<RecoveryLedger />);

    const submitBtn = screen.getByText(/ত্রাণ জমা দিন \(Submit Receipt\)/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ত্রাণ বিতরণ সফলভাবে নথিভুক্ত হয়েছে/i)).toBeInTheDocument();
    });
  });

  it('guards against duplicate aid deliveries using idempotency key', async () => {
    render(<RecoveryLedger />);

    const keyInput = screen.getByDisplayValue(/del-/);
    fireEvent.change(keyInput, { target: { value: 'existing-duplicate-key' } });

    const submitBtn = screen.getByText(/ত্রাণ জমা দিন \(Submit Receipt\)/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ডুপ্লিকেট রসিদ সনাক্ত: এই ট্র্যাকিং কোডটি \(existing-duplicate-key\) ইতিমধ্যে নিবন্ধিত/i)).toBeInTheDocument();
    });
  });
});
