import { calculateConfidenceScore } from './confidence';
import { SosSourceType } from '../../modules/sos/entities/sos-report.entity';

describe('Confidence Score Formula', () => {
  it('should compute base score for responder (0.90)', () => {
    const res = calculateConfidenceScore({
      sourceType: SosSourceType.RESPONDER,
      independentCorroboratingReportsCount: 0,
      nearbyGaugeAboveWarningOrHeavyRain: false,
    });
    expect(res.score).toBe(0.90);
    expect(res.baseScore).toBe(0.90);
    expect(res.isStale).toBe(false);
  });

  it('should compute base score for known volunteer (0.75)', () => {
    const res = calculateConfidenceScore({
      sourceType: SosSourceType.KNOWN_VOLUNTEER,
      independentCorroboratingReportsCount: 0,
      nearbyGaugeAboveWarningOrHeavyRain: false,
    });
    expect(res.score).toBe(0.75);
  });

  it('should compute base score for new user (0.40)', () => {
    const res = calculateConfidenceScore({
      sourceType: SosSourceType.NEW_USER,
      independentCorroboratingReportsCount: 0,
      nearbyGaugeAboveWarningOrHeavyRain: false,
    });
    expect(res.score).toBe(0.40);
  });

  it('should add +0.15 for 1 corroboration and cap at +0.30 for 3+ reports', () => {
    const res1 = calculateConfidenceScore({
      sourceType: SosSourceType.NEW_USER,
      independentCorroboratingReportsCount: 1,
      nearbyGaugeAboveWarningOrHeavyRain: false,
    });
    expect(res1.score).toBe(0.55); // 0.40 + 0.15
    expect(res1.corroborationCapApplied).toBe(false);

    const res3 = calculateConfidenceScore({
      sourceType: SosSourceType.NEW_USER,
      independentCorroboratingReportsCount: 3,
      nearbyGaugeAboveWarningOrHeavyRain: false,
    });
    expect(res3.score).toBe(0.70); // 0.40 + 0.30 (capped)
    expect(res3.corroborationCapApplied).toBe(true);
  });

  it('should add +0.10 environmental bonus and clamp score to 1.0', () => {
    const res = calculateConfidenceScore({
      sourceType: SosSourceType.RESPONDER, // 0.90
      independentCorroboratingReportsCount: 2, // +0.30 -> raw 1.20
      nearbyGaugeAboveWarningOrHeavyRain: true, // +0.10 -> raw 1.30
    });
    expect(res.score).toBe(1.0); // clamped to 1.0
  });

  it('should flag reports as stale when exceeding the freshness window (default 90 min)', () => {
    const res = calculateConfidenceScore({
      sourceType: SosSourceType.NEW_USER,
      independentCorroboratingReportsCount: 0,
      nearbyGaugeAboveWarningOrHeavyRain: false,
      minutesSinceReported: 95,
      freshnessWindowMinutes: 90,
    });
    expect(res.isStale).toBe(true);
    expect(res.breakdown.reasons.some((r) => r.includes('exceeds freshness window'))).toBe(true);
  });
});

