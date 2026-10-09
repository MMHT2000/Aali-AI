import { SignalAInput, SignalBInput, SignalCInput } from './three-signal-alert';

export interface ReplayTick {
  tickIndex: number;
  simulatedTime: string; // ISO
  descriptionBn: string;
  signalA: SignalAInput;
  signalB: SignalBInput;
  signalC: SignalCInput;
  breachReported: boolean;
  actualDangerLevelExceeded: boolean;
}

export interface ReplayScenario {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  period: string;
  isReconstructed: boolean;
  provenance: string;
  ticks: ReplayTick[];
}

export const REPLAY_SCENARIOS: ReplayScenario[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Feni Flash Flood August 2024 Replay',
    nameBn: 'ফেনী আকস্মিক বন্যা আগস্ট ২০২৪ ঐতিহাসিক পুনঃনির্মাণ',
    description: 'Historical reconstruction of August 2024 Feni flood from published BWDB and BMD reports.',
    period: '2024-08-19 to 2024-08-24',
    isReconstructed: true,
    provenance: 'Published BWDB Muhuri Parshuram gauge logs and GSMaP satellite precipitation records.',
    ticks: [
      {
        tickIndex: 0,
        simulatedTime: '2024-08-19T06:00:00Z',
        descriptionBn: 'পানি বাড়ছে স্বাভাবিক গতিতে।',
        signalA: { gaugeLevelM: 11.20, rise3hCm: 8, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 22.0, windowMinutes: 180, minutesSinceObservation: 30 },
        signalC: { levelM: 11.25, isRapidRiseReported: false, minutesSinceObservation: 40 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 1,
        simulatedTime: '2024-08-19T15:00:00Z',
        descriptionBn: 'উজানে তীব্র বর্ষণ শুরু, গেজের পানি বৃদ্ধি শুরু।',
        signalA: { gaugeLevelM: 11.85, rise3hCm: 28, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 78.5, windowMinutes: 180, minutesSinceObservation: 20 },
        signalC: { levelM: 11.80, isRapidRiseReported: false, minutesSinceObservation: 30 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 2,
        simulatedTime: '2024-08-20T03:00:00Z',
        descriptionBn: 'মুহুরী সতর্কসীমা (১২.০৫ মি) অতিক্রম করেছে, উজানে ব্যাপক বৃষ্টিপাত।',
        signalA: { gaugeLevelM: 12.30, rise3hCm: 35, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 110.0, windowMinutes: 180, minutesSinceObservation: 15 },
        signalC: { levelM: 12.35, isRapidRiseReported: true, minutesSinceObservation: 20 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 3,
        simulatedTime: '2024-08-20T12:00:00Z',
        descriptionBn: 'নদীর পানি বিপদসীমা (১৩.০০ মি) অতিক্রম করেছে, বাঁধ উপচে পানি প্রবেশ।',
        signalA: { gaugeLevelM: 13.40, rise3hCm: 45, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 135.0, windowMinutes: 180, minutesSinceObservation: 10 },
        signalC: { levelM: 13.35, isRapidRiseReported: true, minutesSinceObservation: 15 },
        breachReported: true,
        actualDangerLevelExceeded: true,
      },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Feni Surge July 2025 Replay (Sensor Blackout Demo)',
    nameBn: 'ফেনী জুলাই ২০২৫ টেস্ট রিকনস্ট্রাকশন (সেন্সর ব্ল্যাকআউট ডেমো)',
    description: 'Demonstrates escalation when automated river gauge telemetry blacks out while satellite rain continues.',
    period: '2025-07-20 to 2025-07-22',
    isReconstructed: true,
    provenance: 'Simulated monsoon surge scenario for testing telemetry blanking and silent gauge logic.',
    ticks: [
      {
        tickIndex: 0,
        simulatedTime: '2025-07-20T08:00:00Z',
        descriptionBn: 'স্বাভাবিক বর্ষা প্রবাহ।',
        signalA: { gaugeLevelM: 11.40, rise3hCm: 12, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 35.0, windowMinutes: 180, minutesSinceObservation: 25 },
        signalC: { levelM: 11.45, isRapidRiseReported: false, minutesSinceObservation: 35 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 1,
        simulatedTime: '2025-07-20T18:00:00Z',
        descriptionBn: 'উজানে তীব্র মেঘভাঙা বৃষ্টি; নদী সেন্সর ব্ল্যাকআউট (Gauge Silent)।',
        signalA: { gaugeLevelM: 11.40, rise3hCm: 0, minutesSinceObservation: 90, isBlanked: true },
        signalB: { rainfallMm: 88.0, windowMinutes: 180, minutesSinceObservation: 15 },
        signalC: { levelM: 12.10, isRapidRiseReported: true, minutesSinceObservation: 20 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 2,
        simulatedTime: '2025-07-21T06:00:00Z',
        descriptionBn: 'বাঁধ ক্ষতের ঝুঁকি বৃদ্ধি, স্বেচ্ছাসেবক রিপোর্ট ও স্যাটেলাইটে তীব্র প্লাবন।',
        signalA: { gaugeLevelM: 11.40, rise3hCm: 0, minutesSinceObservation: 180, isBlanked: true },
        signalB: { rainfallMm: 95.0, windowMinutes: 180, minutesSinceObservation: 20 },
        signalC: { levelM: 12.80, isRapidRiseReported: true, minutesSinceObservation: 10 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
    ],
  },
];

