import { describe, it, expect } from '@jest/globals';
import { DeterministicAiProvider } from './deterministic-ai-provider';

describe('AI Language Layer & Fallback Provider', () => {
  const provider = new DeterministicAiProvider();

  it('extracts structured fields from Bangla text', () => {
    const text = 'আমরা উত্তর চিথলিয়া প্রাইমারি স্কুলের ছাদে ৫ জন আটকে আছি। সাথে ১ জন বয়স্ক ও শিশু আছে। পানি খুব দ্রুত বাড়ছে।';
    const result = provider.understandSos(text);

    expect(result.extracted.peopleCount).toBe(5);
    expect(result.extracted.urgencyFlags.trapped).toBe(true);
    expect(result.extracted.urgencyFlags.elderly).toBe(true);
    expect(result.extracted.urgencyFlags.child).toBe(true);
    expect(result.extracted.urgencyFlags.medical).toBe(false);
    expect(result.extracted.waterTrend).toBe('RISING_RAPID');
    expect(result.extracted.locationWords).toContain('উত্তর চিথলিয়া');
    expect(result.isFallback).toBe(false);
  });

  it('extracts structured fields from Banglish text', () => {
    const text = 'Amra parshuram mirzanagar e 4 jon chade atka. Pani druto barchhe, ekjon pregnant patient ache.';
    const result = provider.understandSos(text);

    expect(result.extracted.peopleCount).toBe(4);
    expect(result.extracted.urgencyFlags.trapped).toBe(true);
    expect(result.extracted.urgencyFlags.medical).toBe(true);
    expect(result.extracted.waterTrend).toBe('RISING_RAPID');
    expect(result.extracted.locationWords).toContain('parshuram');
  });

  it('handles simulated AI outage with graceful deterministic keyword fallback', () => {
    const text = 'ঘরে পানি ঢুকে গেছে, আমরা ২ জন বৃদ্ধ মানুষ টিনের চালে বসা।';
    const result = provider.understandSos(text, true); // force fallback

    expect(result.isFallback).toBe(true);
    expect(result.providerMode).toBe('deterministic_keyword_fallback');
    expect(result.extracted.peopleCount).toBe(2);
    expect(result.extracted.urgencyFlags.trapped).toBe(true);
    expect(result.extracted.urgencyFlags.elderly).toBe(true);
  });

  it('provides transparent duplicate explanation without overriding human choice', () => {
    const text1 = 'চিথলিয়া স্কুলের ছাদে ৫ জন পানিবন্দী, খাবার নেই।';
    const text2 = 'চিথলিয়া প্রাইমারি স্কুলের চালে ৫ জন মানুষ আটকা পড়েছে।';

    const explanation = provider.explainDuplicate(text1, text2, true);

    expect(explanation.similarityScore).toBeGreaterThanOrEqual(0.75);
    expect(explanation.suggestedAction).toBe('MERGE_CANDIDATE');
    expect(explanation.matchReasons.length).toBeGreaterThan(0);
    expect(explanation.explanationBn).toContain('রিপোর্ট দুটির মিল');
  });

  it('drafts editable Bangla communication citing only given facts', () => {
    const draft = provider.draftCommunication(
      'WARNING',
      'পরশুরাম',
      'পরশুরাম মডেল স্কুল',
      ['rec-101', 'rec-102'],
    );

    expect(draft.isEditable).toBe(true);
    expect(draft.draftTextBn).toContain('পরশুরাম');
    expect(draft.draftTextBn).toContain('পরশুরাম মডেল স্কুল');
    expect(draft.sourceRecordIds).toEqual(['rec-101', 'rec-102']);
  });

  it('runs benchmark across 30 synthetic flood messages with >85% accuracy', () => {
    const report = provider.evaluateBenchmark();

    expect(report.totalMessages).toBe(30);
    expect(report.peopleCountAccuracy).toBeGreaterThanOrEqual(85.0);
    expect(report.vulnerabilityAccuracy).toBeGreaterThanOrEqual(85.0);
    expect(report.waterTrendAccuracy).toBeGreaterThanOrEqual(80.0);
    expect(report.overallAccuracy).toBeGreaterThanOrEqual(85.0);
    expect(report.fallbackSuccessRate).toBe(100.0);
  });
});

