import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiLanguageAssistant } from './AiLanguageAssistant';

const mockExtractedResponse = {
  extracted: {
    peopleCount: 5,
    urgencyFlags: {
      trapped: true,
      elderly: true,
      child: true,
      medical: false,
    },
    locationWords: ['উত্তর চিথলিয়া'],
    waterTrend: 'RISING_RAPID',
    fieldConfidence: {
      peopleCount: 0.95,
      urgencyFlags: 0.9,
      locationWords: 0.95,
      waterTrend: 0.9,
    },
  },
  rawText: 'আমরা উত্তর চিথলিয়া প্রাইমারি স্কুলের ছাদে ৫ জন আটকে আছি। সাথে ১ জন বয়স্ক ও শিশু আছে। পানি খুব দ্রুত বাড়ছে।',
  providerMode: 'mock',
  isFallback: false,
  latencyMs: 14,
};

const mockBenchmarkReport = {
  totalMessages: 30,
  peopleCountAccuracy: 93.3,
  vulnerabilityAccuracy: 90.0,
  waterTrendAccuracy: 86.7,
  overallAccuracy: 90.0,
  fallbackSuccessRate: 100.0,
  evaluatedAt: new Date().toISOString(),
};

describe('AiLanguageAssistant Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/api/v1/ai/benchmark/samples')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 'msg-01', text: 'চিথলিয়া ৫ জন আটকা', category: 'BANGLA_FORMAL', expectedPeopleCount: 5 },
          ],
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/ai/understand-sos')) {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        const isFallback = !!body.forceFallback;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...mockExtractedResponse,
            isFallback,
            providerMode: isFallback ? 'deterministic_keyword_fallback' : 'mock',
          }),
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/ai/shift-summary')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            sourceRecordIds: ['sos-001', 'sos-002'],
            summaryBn: '📋 শিফট বিবরণী: মোট প্রক্রিয়াকৃত এসওএস: ১৪ | উদ্ধার সম্পন্ন: ৬',
            totalSosProcessed: 14,
            criticalEvacuationsCount: 6,
            silentVillagesFlaggedCount: 2,
            reliefDeliveriesLoggedCount: 9,
            isEditable: true,
            generatedBy: 'deterministic_shift_summarizer',
          }),
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/ai/benchmark')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockBenchmarkReport,
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/ai/status/outage')) {
        return Promise.resolve({ ok: true, json: async () => ({ status: 'ok' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }));
  });

  it('renders NLP assistant header and text input area', () => {
    render(<AiLanguageAssistant />);

    expect(screen.getByText(/এআই ভাষা সহকারী ও ফলব্যাক \/ AI NLP Assistant & Deterministic Fallback/i)).toBeInTheDocument();
    expect(screen.getByText(/এসওএস বার্তা টেক্সট \(Bangla \/ Banglish Raw Text\):/i)).toBeInTheDocument();
  });

  it('analyzes text and extracts structured schema fields', async () => {
    render(<AiLanguageAssistant />);

    const analyzeBtn = screen.getByText(/🔍 এসওএস বিশ্লেষণ করুন \(Analyze Text\)/i);
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText('5 জন')).toBeInTheDocument();
      expect(screen.getByText('RISING_RAPID')).toBeInTheDocument();
      expect(screen.getByText('পানিবন্দী')).toBeInTheDocument();
      expect(screen.getByText('বৃদ্ধ')).toBeInTheDocument();
      expect(screen.getByText('শিশু')).toBeInTheDocument();
    });
  });

  it('demonstrates deterministic fallback on simulated AI outage', async () => {
    render(<AiLanguageAssistant />);

    const outageToggle = screen.getByLabelText(/এআই বিভ্রাট ডেমো \(Simulate AI Outage \/ Fallback Mode\)/i);
    fireEvent.click(outageToggle);

    const analyzeBtn = screen.getByText(/🔍 এসওএস বিশ্লেষণ করুন \(Analyze Text\)/i);
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText(/প্রোভাইডার: deterministic_keyword_fallback \(FALLBACK ACTIVE\)/i)).toBeInTheDocument();
    });
  });

  it('runs 30-message synthetic benchmark and displays metrics', async () => {
    render(<AiLanguageAssistant />);

    const runBtn = screen.getByText(/মূল্যায়ন চালান \(Run Benchmark\)/i);
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/মানুষের সংখ্যা নির্ভুলতা:/i)).toBeInTheDocument();
      expect(screen.getByText(/93.3%/)).toBeInTheDocument();
      expect(screen.getByText(/100%/)).toBeInTheDocument(); // fallback rate
      expect(screen.getByText('Not measured')).toBeInTheDocument();
    });
  });

  it('allows operator inspection and manual field edits', async () => {
    render(<AiLanguageAssistant />);

    const analyzeBtn = screen.getByText(/🔍 এসওএস বিশ্লেষণ করুন \(Analyze Text\)/i);
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText('সংশোধন দেখুন (Preview correction)')).toBeInTheDocument();
    });

    const saveBtn = screen.getByText('সংশোধন দেখুন (Preview correction)');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Local preview only; no report was saved or verified/i)).toBeInTheDocument();
    });
  });

  it('renders the actual backend summary contract and labels sample counts as synthetic', async () => {
    render(<AiLanguageAssistant />);

    const genBtn = screen.getByText(/শিফট সারসংক্ষেপ তৈরি করুন \(Generate\)/i);
    fireEvent.click(genBtn);

    await waitFor(() => {
      expect(screen.getByText(/রাত্রিকালীন বন্যা অপারেশন শিফট \(Night Shift Handover\)/i)).toBeInTheDocument();
      expect(screen.getByText(/উৎস আইডি: sos-001, sos-002/i)).toBeInTheDocument();
      expect(screen.getByText(/📋 শিফট বিবরণী: মোট প্রক্রিয়াকৃত এসওএস: ১৪ | উদ্ধার সম্পন্ন: ৬/i)).toBeInTheDocument();
      expect(screen.getByText(/Counts are supplied examples, not verified rescue outcomes/i)).toBeInTheDocument();
    });
  });
});

