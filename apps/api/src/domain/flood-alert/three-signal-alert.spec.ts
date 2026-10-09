import { describe, it, expect } from '@jest/globals';
import { evaluateThreeSignalAlert, escalateAlertLevel } from './three-signal-alert';

describe('Three-Signal Alert Domain Rule', () => {
  it('returns NORMAL when no signals fire', () => {
    const result = evaluateThreeSignalAlert({
      areaId: 'area-parshuram',
      areaName: 'Parshuram',
      signalA: {
        gaugeLevelM: 11.5,
        rise3hCm: 10,
        minutesSinceObservation: 15,
      },
      signalB: {
        rainfallMm: 20,
        windowMinutes: 180,
        minutesSinceObservation: 30,
      },
      signalC: {
        levelM: 11.6,
        isRapidRiseReported: false,
        minutesSinceObservation: 25,
      },
    });

    expect(result.computedLevel).toBe('NORMAL');
    expect(result.baseLevel).toBe('NORMAL');
    expect(result.signalsFired.signalA_Gauge).toBe(false);
    expect(result.signalsFired.signalB_Rainfall).toBe(false);
    expect(result.signalsFired.signalC_Volunteer).toBe(false);
    expect(result.isEscalatedBySilentGauge).toBe(false);
  });

  it('fires WATCH when only one signal fires (Signal A gauge rate of rise)', () => {
    const result = evaluateThreeSignalAlert({
      areaId: 'area-parshuram',
      areaName: 'Parshuram',
      signalA: {
        gaugeLevelM: 11.8,
        rise3hCm: 30, // >= 25 cm rise
        minutesSinceObservation: 10,
      },
      signalB: {
        rainfallMm: 30,
        windowMinutes: 180,
        minutesSinceObservation: 20,
      },
    });

    expect(result.computedLevel).toBe('WATCH');
    expect(result.signalsFired.signalA_Gauge).toBe(true);
    expect(result.reasonCodes).toContain('SIGNAL_A_GAUGE_CRITICAL');
  });

  it('fires WARNING when two signals fire (Signal A + Signal B)', () => {
    const result = evaluateThreeSignalAlert({
      areaId: 'area-parshuram',
      areaName: 'Parshuram',
      signalA: {
        gaugeLevelM: 12.10, // >= 12.05m
        rise3hCm: 20,
        minutesSinceObservation: 10,
      },
      signalB: {
        rainfallMm: 90, // >= 75mm
        windowMinutes: 180,
        minutesSinceObservation: 30,
      },
    });

    expect(result.computedLevel).toBe('WARNING');
    expect(result.signalsFired.signalA_Gauge).toBe(true);
    expect(result.signalsFired.signalB_Rainfall).toBe(true);
    expect(result.signalsFired.signalC_Volunteer).toBe(false);
  });

  it('fires ACT when all three signals fire', () => {
    const result = evaluateThreeSignalAlert({
      areaId: 'area-parshuram',
      areaName: 'Parshuram',
      signalA: {
        gaugeLevelM: 12.45,
        rise3hCm: 40,
        minutesSinceObservation: 5,
      },
      signalB: {
        rainfallMm: 95,
        windowMinutes: 180,
        minutesSinceObservation: 15,
      },
      signalC: {
        levelM: 12.50,
        isRapidRiseReported: true,
        minutesSinceObservation: 10,
      },
    });

    expect(result.computedLevel).toBe('ACT');
    expect(result.signalsFired.signalA_Gauge).toBe(true);
    expect(result.signalsFired.signalB_Rainfall).toBe(true);
    expect(result.signalsFired.signalC_Volunteer).toBe(true);
  });

  it('fires ACT immediately if embankment breach is reported, even with zero signals', () => {
    const result = evaluateThreeSignalAlert({
      areaId: 'area-parshuram',
      areaName: 'Parshuram',
      reportedBreach: true,
    });

    expect(result.computedLevel).toBe('ACT');
    expect(result.signalsFired.breachReported).toBe(true);
    expect(result.reasonCodes).toContain('BREACH_REPORTED_ACT_NOW');
  });

  it('escalates alert level by 1 step with GAUGE_SILENT when gauge is blanked/silent and rainfall is high', () => {
    // 1 signal active (Signal B), base would be WATCH.
    // Gauge is blanked/missing -> escalates to WARNING with GAUGE_SILENT.
    const result = evaluateThreeSignalAlert({
      areaId: 'area-parshuram',
      areaName: 'Parshuram',
      signalA: {
        gaugeLevelM: 11.0,
        rise3hCm: 0,
        minutesSinceObservation: 75, // > 60 min
        isBlanked: true,
      },
      signalB: {
        rainfallMm: 85, // active
        windowMinutes: 180,
        minutesSinceObservation: 20,
      },
    });

    expect(result.baseLevel).toBe('WATCH');
    expect(result.computedLevel).toBe('WARNING');
    expect(result.isEscalatedBySilentGauge).toBe(true);
    expect(result.reasonCodes).toContain('GAUGE_SILENT');
  });

  it('clamps escalation at ACT without level overflow', () => {
    expect(escalateAlertLevel('NORMAL')).toBe('WATCH');
    expect(escalateAlertLevel('WATCH')).toBe('WARNING');
    expect(escalateAlertLevel('WARNING')).toBe('ACT');
    expect(escalateAlertLevel('ACT')).toBe('ACT');
  });

  it('calculates deterministic lead time correctly against danger level', () => {
    // level: 12.40m, rise: 30cm over 3 hours = 10cm/hr = 0.10 m/hr
    // remaining to 13.0m danger: 0.60m. 0.60 / 0.10 = 6.0 hours lead time.
    const result = evaluateThreeSignalAlert({
      areaId: 'area-parshuram',
      areaName: 'Parshuram',
      signalA: {
        gaugeLevelM: 12.40,
        rise3hCm: 30,
        minutesSinceObservation: 10,
      },
      dangerLevelM: 13.0,
    });

    expect(result.computedLeadTimeHours).toBe(6.0);
  });
});
