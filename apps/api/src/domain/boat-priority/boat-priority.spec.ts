import { calculateBoatPriority } from './boat-priority';

describe('Boat Priority Formula', () => {
  it('should compute lowest priority for minimal report without urgency', () => {
    const res = calculateBoatPriority({
      peopleCount: 1,
      vulnerabilityFlags: {
        hasChild: false,
        elderly: false,
        medical: false,
        trapped: false,
      },
      confidenceScore: 0.40,
      waterTrend: 'STEADY',
      waitingMinutes: 0,
    });

    // 0.30*(0.1) + 0.25*(0) + 0.20*(0.40) + 0.15*(0.40) + 0.10*(0) = 0.03 + 0 + 0.08 + 0.06 + 0 = 0.17
    expect(res.score).toBe(0.17);
    expect(res.factorBreakdown.weights.peopleAtRisk).toBe(0.30);
  });

  it('should compute highest priority for 10+ people with all flags, high confidence, rising water, and long wait', () => {
    const res = calculateBoatPriority({
      peopleCount: 12,
      vulnerabilityFlags: {
        hasChild: true,
        elderly: true,
        medical: true,
        trapped: true,
      },
      confidenceScore: 1.0,
      waterTrend: 'RISING_RAPID',
      waitingMinutes: 200,
    });

    // 0.30*(1.0) + 0.25*(1.0) + 0.20*(1.0) + 0.15*(1.0) + 0.10*(1.0) = 1.0
    expect(res.score).toBe(1.0);
  });
});

