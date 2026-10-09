export type AlertLevel = 'NORMAL' | 'WATCH' | 'WARNING' | 'ACT';

export interface SignalAInput {
  gaugeLevelM: number;
  rise3hCm: number;
  warningLevelM?: number; // default 12.05m (Parshuram)
  minutesSinceObservation: number;
  isBlanked?: boolean;
}

export interface SignalBInput {
  rainfallMm: number;
  windowMinutes: number; // e.g. 180 min
  thresholdMm?: number; // default 75mm (prototype starting value)
  minutesSinceObservation: number;
}

export interface SignalCInput {
  levelM: number;
  isRapidRiseReported: boolean;
  thresholdM?: number; // default 12.20m
  minutesSinceObservation: number;
}

export interface ThreeSignalAlertInput {
  areaId: string;
  areaName: string;
  reportedBreach?: boolean;
  signalA?: SignalAInput;
  signalB?: SignalBInput;
  signalC?: SignalCInput;
  dangerLevelM?: number; // default 13.0m
}

export interface ThreeSignalAlertOutput {
  computedLevel: AlertLevel;
  baseLevel: AlertLevel;
  isEscalatedBySilentGauge: boolean;
  signalsFired: {
    signalA_Gauge: boolean;
    signalB_Rainfall: boolean;
    signalC_Volunteer: boolean;
    breachReported: boolean;
  };
  reasonCodes: string[];
  reasonsBn: string[];
  sourceAgesMinutes: {
    gaugeMinutes: number | null;
    rainfallMinutes: number | null;
    volunteerMinutes: number | null;
  };
  computedLeadTimeHours: number | null;
  prototypeNotice: string;
}

const LEVEL_ORDER: AlertLevel[] = ['NORMAL', 'WATCH', 'WARNING', 'ACT'];

export function escalateAlertLevel(level: AlertLevel): AlertLevel {
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx < LEVEL_ORDER.length - 1) {
    return LEVEL_ORDER[idx + 1];
  }
  return 'ACT'; // Clamped at ACT
}

/**
 * Pure deterministic three-signal alert rule for Feni/Muhuri basin.
 * AI never decides these values. Thresholds are labeled prototype starting values.
 */
export function evaluateThreeSignalAlert(input: ThreeSignalAlertInput): ThreeSignalAlertOutput {
  const reasonCodes: string[] = [];
  const reasonsBn: string[] = [];

  const warningMark = input.signalA?.warningLevelM ?? 12.05;
  const rainThreshold = input.signalB?.thresholdMm ?? 75.0;
  const volThreshold = input.signalC?.thresholdM ?? 12.20;

  // 1. Signal A: River gauge
  let signalAFired = false;
  let gaugeSilent60Min = false;
  const gaugeMins = input.signalA ? input.signalA.minutesSinceObservation : null;

  if (input.signalA && !input.signalA.isBlanked) {
    if (input.signalA.minutesSinceObservation > 60) {
      gaugeSilent60Min = true;
    } else {
      if (input.signalA.gaugeLevelM >= warningMark || input.signalA.rise3hCm >= 25.0) {
        signalAFired = true;
        reasonCodes.push('SIGNAL_A_GAUGE_CRITICAL');
        reasonsBn.push(`মুহুরী নদীর পানির স্তর ${input.signalA.gaugeLevelM.toFixed(2)} মি (সতর্কসীমা ${warningMark} মি) বা ৩ ঘণ্টায় বৃদ্ধি ${input.signalA.rise3hCm} সেমি`);
      }
    }
  } else if (!input.signalA || input.signalA.isBlanked) {
    gaugeSilent60Min = true;
  }

  // 2. Signal B: Satellite rainfall (Tripura basin)
  let signalBFired = false;
  const rainMins = input.signalB ? input.signalB.minutesSinceObservation : null;
  if (input.signalB && input.signalB.minutesSinceObservation <= 180) {
    if (input.signalB.rainfallMm >= rainThreshold) {
      signalBFired = true;
      reasonCodes.push('SIGNAL_B_SATELLITE_RAIN_HEAVY');
      reasonsBn.push(`উজানে স্যাটেলাইট বৃষ্টিপাত ${input.signalB.rainfallMm.toFixed(1)} মিমি (সীমা ${rainThreshold} মিমি)`);
    }
  }

  // 3. Signal C: Volunteer staff-gauge report
  let signalCFired = false;
  const volMins = input.signalC ? input.signalC.minutesSinceObservation : null;
  if (input.signalC && input.signalC.minutesSinceObservation <= 120) {
    if (input.signalC.levelM >= volThreshold || input.signalC.isRapidRiseReported) {
      signalCFired = true;
      reasonCodes.push('SIGNAL_C_VOLUNTEER_VERIFIED');
      reasonsBn.push(`স্বেচ্ছাসেবক রিডিং ${input.signalC.levelM.toFixed(2)} মি বা দ্রুত পানি বৃদ্ধির রিপোর্ট`);
    }
  }

  // Breach override
  const breachFired = !!input.reportedBreach;
  if (breachFired) {
    reasonCodes.push('BREACH_REPORTED_ACT_NOW');
    reasonsBn.push('বাঁধ ভাঙনের নিশ্চিত রিপোর্ট প্রাপ্ত হয়েছে - দ্রুত সরিয়ে নেওয়ার নির্দেশ');
  }

  // Base alert level calculation:
  // Watch: 1 signal; Warning: 2 signals; Act: 3 signals or breach
  const signalsCount = (signalAFired ? 1 : 0) + (signalBFired ? 1 : 0) + (signalCFired ? 1 : 0);
  let baseLevel: AlertLevel = 'NORMAL';

  if (breachFired || signalsCount >= 3) {
    baseLevel = 'ACT';
  } else if (signalsCount === 2) {
    baseLevel = 'WARNING';
  } else if (signalsCount === 1) {
    baseLevel = 'WATCH';
  }

  // Silent Gauge Escalation Rule:
  // If gauge silent >= 60 min while rain (Signal B) or volunteer (Signal C) is high:
  // raise level by one step, append reason GAUGE_SILENT
  let computedLevel = baseLevel;
  let isEscalatedBySilentGauge = false;

  if (gaugeSilent60Min && (signalBFired || signalCFired)) {
    isEscalatedBySilentGauge = true;
    computedLevel = escalateAlertLevel(baseLevel);
    reasonCodes.push('GAUGE_SILENT');
    reasonsBn.push('নদীর গেজ ৬০ মিনিট ধরে তথ্যহীন কিন্তু বৃষ্টিপাত বা স্বেচ্ছাসেবক রিপোর্ট সক্রিয় - স্তর ১ ধাপ বৃদ্ধি');
  }

  // Computed lead-time estimation (deterministic against 13.0m danger level)
  // If gauge level exists and rising: (13.0 - level) / (rise_rate_per_hour)
  let computedLeadTimeHours: number | null = null;
  const dangerLevel = input.dangerLevelM ?? 13.0;

  if (input.signalA && !input.signalA.isBlanked && input.signalA.rise3hCm > 0) {
    const riseRateMPerHour = (input.signalA.rise3hCm / 100) / 3;
    const remainingM = dangerLevel - input.signalA.gaugeLevelM;
    if (remainingM > 0 && riseRateMPerHour > 0) {
      computedLeadTimeHours = parseFloat((remainingM / riseRateMPerHour).toFixed(1));
    } else if (remainingM <= 0) {
      computedLeadTimeHours = 0.0; // Already exceeded danger level
    }
  }

  return {
    computedLevel,
    baseLevel,
    isEscalatedBySilentGauge,
    signalsFired: {
      signalA_Gauge: signalAFired,
      signalB_Rainfall: signalBFired,
      signalC_Volunteer: signalCFired,
      breachReported: breachFired,
    },
    reasonCodes,
    reasonsBn,
    sourceAgesMinutes: {
      gaugeMinutes: gaugeMins,
      rainfallMinutes: rainMins,
      volunteerMinutes: volMins,
    },
    computedLeadTimeHours,
    prototypeNotice: 'Prototype starting values for decision-support demo only. Not an operational meteorological forecast.',
  };
}
