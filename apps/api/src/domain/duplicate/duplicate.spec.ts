import { evaluateDuplicateCandidate } from './duplicate';

describe('Duplicate Candidate Detector', () => {
  it('should flag candidate when reports share geohash7 within 30 min and have similar count', () => {
    const res = evaluateDuplicateCandidate({
      leftReport: {
        id: 'rep-1',
        geohash7: 'wh0xs6m',
        peopleCount: 4,
        reportedAt: '2026-10-09T14:00:00Z',
      },
      rightReport: {
        id: 'rep-2',
        geohash7: 'wh0xs6m',
        peopleCount: 5,
        reportedAt: '2026-10-09T14:10:00Z',
      },
    });

    expect(res.isCandidate).toBe(true);
    expect(res.spatialMatch).toBe(true);
    expect(res.peopleCountMatch).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(0.60);
  });

  it('should not flag candidate if geohashes differ', () => {
    const res = evaluateDuplicateCandidate({
      leftReport: {
        id: 'rep-1',
        geohash7: 'wh0xs6m',
        peopleCount: 4,
        reportedAt: '2026-10-09T14:00:00Z',
      },
      rightReport: {
        id: 'rep-2',
        geohash7: 'wh0wz8s',
        peopleCount: 4,
        reportedAt: '2026-10-09T14:05:00Z',
      },
    });

    expect(res.isCandidate).toBe(false);
    expect(res.spatialMatch).toBe(false);
  });

  it('should include AI text similarity bonus when available without AI auto-merging', () => {
    const res = evaluateDuplicateCandidate({
      leftReport: {
        id: 'rep-1',
        geohash7: 'wh0xs6m',
        peopleCount: 4,
        reportedAt: '2026-10-09T14:00:00Z',
      },
      rightReport: {
        id: 'rep-2',
        geohash7: 'wh0xs6m',
        peopleCount: 4,
        reportedAt: '2026-10-09T14:00:00Z',
      },
      aiTextSimilarity: 0.85,
    });

    expect(res.reasonCodes.some((r) => r.includes('AI text similarity suggestion'))).toBe(true);
    expect(res.score).toBeGreaterThan(0.80);
  });
});

