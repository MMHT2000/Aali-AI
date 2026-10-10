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
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Sylhet Catastrophic Megaflood June 2022 Replay',
    nameBn: 'সিলেট ভয়াবহ মেগা-প্লাবন জুন ২০২২ ঐতিহাসিক পুনঃনির্মাণ',
    description: 'Historical reconstruction of June 2022 Surma-Kushiyara deluge where Companiganj & Gowainghat suffered 84% inundation and Kumargaon grid was flooded.',
    period: '2022-06-15 to 2022-06-21',
    isReconstructed: true,
    provenance: 'Published BWDB Surma Sylhet Point gauge logs and IMD Cherrapunji extreme rainfall records (972mm/48h).',
    ticks: [
      {
        tickIndex: 0,
        simulatedTime: '2022-06-15T06:00:00Z',
        descriptionBn: 'স্বাভাবিক বর্ষা প্রবাহ, চেরাপুঞ্জিতে ভারি মেঘের সঞ্চার।',
        signalA: { gaugeLevelM: 10.20, rise3hCm: 6, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 45.0, windowMinutes: 180, minutesSinceObservation: 25 },
        signalC: { levelM: 10.15, isRapidRiseReported: false, minutesSinceObservation: 30 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 1,
        simulatedTime: '2022-06-16T12:00:00Z',
        descriptionBn: 'চেরাপুঞ্জিতে নজিরবিহীন মেঘভাঙা বৃষ্টি (৯৭২ মিমি/৪৮ঘণ্টা), সুরমা দ্রুত বৃদ্ধি।',
        signalA: { gaugeLevelM: 10.75, rise3hCm: 26, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 185.0, windowMinutes: 180, minutesSinceObservation: 15 },
        signalC: { levelM: 10.80, isRapidRiseReported: true, minutesSinceObservation: 20 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 2,
        simulatedTime: '2022-06-17T04:00:00Z',
        descriptionBn: 'সুরমা নদীর পানি সতর্কসীমা (১০.৮০ মি) অতিক্রম করেছে, কোম্পানীগঞ্জ ৮৪% প্লাবিত।',
        signalA: { gaugeLevelM: 11.20, rise3hCm: 38, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 310.0, windowMinutes: 180, minutesSinceObservation: 10 },
        signalC: { levelM: 11.25, isRapidRiseReported: true, minutesSinceObservation: 15 },
        breachReported: true,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 3,
        simulatedTime: '2022-06-17T18:00:00Z',
        descriptionBn: 'বিপদসীমা (১১.২৫ মি) অতিক্রম করে সুরমা ১২.০২ মিটারে পৌঁছেছে (+৭৭ সেমি উর্ধ্বে), কুমারগাঁও গ্রিড প্লাবিত, ৮৪% টাওয়ার ব্ল্যাকআউট।',
        signalA: { gaugeLevelM: 12.02, rise3hCm: 48, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 420.0, windowMinutes: 180, minutesSinceObservation: 10 },
        signalC: { levelM: 12.00, isRapidRiseReported: true, minutesSinceObservation: 10 },
        breachReported: true,
        actualDangerLevelExceeded: true,
      },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Sylhet Flash Surge May 2024 Replay',
    nameBn: 'সিলেট আগাম মেঘভাঙা ঢল মে ২০২৪ পুনঃনির্মাণ',
    description: 'Reconstructed early pre-monsoon deluge in Surma-Kushiyara basin triggered by Meghalaya upstream runoff during Cyclone Remal aftermath.',
    period: '2024-05-28 to 2024-05-31',
    isReconstructed: true,
    provenance: 'BWDB Surma & Sari-Gowain gauge records during Cyclone Remal aftermath and Meghalaya runoff.',
    ticks: [
      {
        tickIndex: 0,
        simulatedTime: '2024-05-28T08:00:00Z',
        descriptionBn: 'ঘূর্ণিঝড় রিমাল পরবর্তী শান্ত অবস্থা, নদীর পানি সাধারণ স্তরে।',
        signalA: { gaugeLevelM: 10.10, rise3hCm: 5, minutesSinceObservation: 15, isBlanked: false },
        signalB: { rainfallMm: 28.0, windowMinutes: 180, minutesSinceObservation: 30 },
        signalC: { levelM: 10.12, isRapidRiseReported: false, minutesSinceObservation: 40 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 1,
        simulatedTime: '2024-05-29T14:00:00Z',
        descriptionBn: 'মেঘালয় পাহাড়ি ঢল শুরু; টেলিমেট্রি সেন্সরে অস্থিরতা ও পানি দ্রুত বৃদ্ধি।',
        signalA: { gaugeLevelM: 10.90, rise3hCm: 32, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 120.0, windowMinutes: 180, minutesSinceObservation: 20 },
        signalC: { levelM: 10.95, isRapidRiseReported: true, minutesSinceObservation: 25 },
        breachReported: false,
        actualDangerLevelExceeded: false,
      },
      {
        tickIndex: 2,
        simulatedTime: '2024-05-30T06:00:00Z',
        descriptionBn: 'বিপদসীমা স্পর্শ করেছে (১১.২৫ মি), গোয়াইনঘাট গ্রামীণ সড়ক প্লাবিত ও বিচ্ছিন্ন।',
        signalA: { gaugeLevelM: 11.35, rise3hCm: 36, minutesSinceObservation: 10, isBlanked: false },
        signalB: { rainfallMm: 145.0, windowMinutes: 180, minutesSinceObservation: 15 },
        signalC: { levelM: 11.30, isRapidRiseReported: true, minutesSinceObservation: 20 },
        breachReported: true,
        actualDangerLevelExceeded: true,
      },
    ],
  },
];

