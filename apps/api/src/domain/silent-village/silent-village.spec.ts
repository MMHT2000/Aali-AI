import { evaluateSilentVillage } from './silent-village';

describe('Silent Village Detection Rule', () => {
  it('should flag HIGH_RISK_SILENT_VILLAGE with VERIFY_BY_SAFE_MEANS when conditions match', () => {
    const res = evaluateSilentVillage({
      areaId: '22222222-2222-2222-2222-222222222205',
      areaName: 'Chitholia',
      exposureLevel: 'VERY_HIGH',
      alertLevel: 'WARNING',
      minutesSinceLastReport: 25,
      neighboringAreasReportingCount: 3,
      configuredThresholdMinutes: 20,
    });

    expect(res.isSilentVillage).toBe(true);
    expect(res.actionRequired).toBe('VERIFY_BY_SAFE_MEANS');
    expect(res.statusLabel).toBe('HIGH_RISK_SILENT_VILLAGE');
    expect(res.reason).toContain('Do not assume safety');
  });

  it('should not flag silent-village if alert level is only NORMAL or WATCH', () => {
    const res = evaluateSilentVillage({
      areaId: '22222222-2222-2222-2222-222222222205',
      areaName: 'Chitholia',
      exposureLevel: 'VERY_HIGH',
      alertLevel: 'WATCH',
      minutesSinceLastReport: 25,
      neighboringAreasReportingCount: 3,
    });

    expect(res.isSilentVillage).toBe(false);
    expect(res.actionRequired).toBe('NORMAL_MONITORING');
  });

  it('should not flag if neighbors are also not reporting (e.g. baseline or regional outage)', () => {
    const res = evaluateSilentVillage({
      areaId: '22222222-2222-2222-2222-222222222205',
      areaName: 'Chitholia',
      exposureLevel: 'VERY_HIGH',
      alertLevel: 'WARNING',
      minutesSinceLastReport: 25,
      neighboringAreasReportingCount: 0,
    });

    expect(res.isSilentVillage).toBe(false);
  });
});

