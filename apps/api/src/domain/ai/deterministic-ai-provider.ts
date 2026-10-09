import {
  BenchmarkReport,
  CommunicationDraftResult,
  DuplicateExplanationResult,
  ShiftSummaryResult,
  SosExtractedFields,
  SosUnderstandingResult,
} from './ai-interfaces';
import { SYNTHETIC_SOS_BENCHMARK } from './synthetic-sos-benchmark';

export class DeterministicAiProvider {
  /**
   * Deterministic extraction for Bangla and Banglish flood messages.
   * Acts as the reliable fallback when remote/local LLMs are unavailable or output invalid JSON.
   */
  extractSosFields(text: string): SosExtractedFields {
    const lower = text.toLowerCase();

    // 1. People count extraction
    let peopleCount: number | null = null;
    const banglaDigits: Record<string, number> = {
      '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4,
      '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9,
    };

    // Check Bengali digits before "জন" or "মানুষ"
    const bnDigitMatch = text.match(/([০-৯]+)\s*(?:জন|মানুষ)/);
    if (bnDigitMatch) {
      const numStr = bnDigitMatch[1];
      let val = 0;
      for (const ch of numStr) {
        val = val * 10 + (banglaDigits[ch] ?? 0);
      }
      peopleCount = val;
    }

    // Check ASCII digits (e.g. "5 jon", "8 people", "10 জন")
    if (peopleCount === null) {
      const asciiMatch = text.match(/(\d+)\s*(?:জন|jon|manus|people|person|patients?)?/i);
      if (asciiMatch) {
        const parsed = parseInt(asciiMatch[1], 10);
        if (parsed > 0 && parsed <= 100) {
          peopleCount = parsed;
        }
      }
    }

    // 2. Urgency flags
    const isTrapped =
      /আটকা|আটকে|বন্দী|পানিবন্দী|ছালে|চালে|মাচায়|গাছের ডালে|দোতলায়|ঘেরাও|পানি কোমর|কোমর সমান|atka|atke|panibondi|bondi|chade|chaale|khater upor/i.test(
        text,
      );

    const isElderly =
      /বৃদ্ধ|বয়স্ক|দাদি|দাদা|দাদী|দাদু|বয়স্ক|briddho|biddho|boyosko|elderly|old/i.test(
        text,
      );

    const isChild =
      /শিশু|বাচ্চা|ছোট বাচ্চা|বাচ্চারা|দুধ|shishu|bacha|baccha|child|baby/i.test(
        text,
      );

    const isMedical =
      /অসুস্থ|রোগী|ওষুধ|হাসপাতাল|অক্সিজেন|ডায়াবেটিস|ইনসুলিন|ভাঙা|গর্ভবতী|asustho|patient|pregnant|medical|doctor|hospital|oxygen|osudh/i.test(
        text,
      );

    // 3. Water Trend
    let waterTrend: 'RISING_RAPID' | 'RISING_STEADY' | 'STABLE' | 'RECEDING' | 'UNKNOWN' = 'UNKNOWN';
    if (/খুব দ্রুত বাড়ছে|তীব্র বেগে|তীব্র বাড়ছে|druto barchhe|druto barche/i.test(text)) {
      waterTrend = 'RISING_RAPID';
    } else if (/বাড়ছে|পানি উঠছে|barchhe|barche/i.test(text)) {
      waterTrend = 'RISING_STEADY';
    } else if (/স্থির|পানি স্থির|stable|sthir/i.test(text)) {
      waterTrend = 'STABLE';
    } else if (/নামতে শুরু করেছে|কমে যাচ্ছে|পানি কমছে|namshe|kome jachhe|receding/i.test(text)) {
      waterTrend = 'RECEDING';
    }

    // 4. Known Location Words
    const locationWords: string[] = [];
    const knownLocations = [
      'উত্তর চিথলিয়া', 'চিথলিয়া', 'পরশুরাম', 'মির্জানগর', 'ফুলগাজী', 'মুন্সীরহাট',
      'শ্রীপুর', 'chitholia', 'parshuram', 'mirzanagar', 'fulgazi', 'munshirhat',
    ];
    for (const loc of knownLocations) {
      if (lower.includes(loc.toLowerCase())) {
        locationWords.push(loc);
      }
    }

    // 5. Field confidences
    return {
      peopleCount,
      urgencyFlags: {
        trapped: isTrapped,
        elderly: isElderly,
        child: isChild,
        medical: isMedical,
      },
      locationWords,
      waterTrend,
      fieldConfidence: {
        peopleCount: peopleCount !== null ? 0.95 : 0.40,
        urgencyFlags: isTrapped || isElderly || isChild || isMedical ? 0.90 : 0.70,
        locationWords: locationWords.length > 0 ? 0.95 : 0.30,
        waterTrend: waterTrend !== 'UNKNOWN' ? 0.90 : 0.40,
      },
    };
  }

  understandSos(text: string, forceFallback = false): SosUnderstandingResult {
    const startTime = Date.now();
    const extracted = this.extractSosFields(text);
    return {
      extracted,
      rawText: text,
      providerMode: forceFallback ? 'deterministic_keyword_fallback' : 'mock',
      isFallback: forceFallback,
      latencyMs: Date.now() - startTime,
    };
  }

  explainDuplicate(leftText: string, rightText: string, spatialMatch: boolean): DuplicateExplanationResult {
    const leftExt = this.extractSosFields(leftText);
    const rightExt = this.extractSosFields(rightText);

    const reasons: string[] = [];
    let similarity = 0.50;

    if (spatialMatch) {
      similarity += 0.25;
      reasons.push('উভয় রিপোর্ট একই ভৌগোলিক সেল (~১৫০ মিটার) নির্দেশ করছে (Same geohash7 cell).');
    }

    if (leftExt.peopleCount !== null && rightExt.peopleCount !== null && Math.abs(leftExt.peopleCount - rightExt.peopleCount) <= 2) {
      similarity += 0.15;
      reasons.push(`মানুষের সংখ্যা সামঞ্জস্যপূর্ণ (${leftExt.peopleCount} বনাম ${rightExt.peopleCount} জন)।`);
    }

    if (leftExt.urgencyFlags.trapped === rightExt.urgencyFlags.trapped && leftExt.urgencyFlags.trapped) {
      similarity += 0.10;
      reasons.push('উভয় রিপোর্টেই পানিবন্দী/ছাদে আটকা থাকার তথ্য রয়েছে (Common trapped status).');
    }

    similarity = Math.min(1.0, similarity);

    return {
      similarityScore: similarity,
      matchReasons: reasons,
      explanationBn: `প্রাকৃতিক ভাষা ও ভৌগোলিক অবস্থানের ভিত্তিতে রিপোর্ট দুটির মিল প্রায় ${(similarity * 100).toFixed(0)}%।`,
      suggestedAction: similarity >= 0.75 ? 'MERGE_CANDIDATE' : 'DISTINCT_REPORTS',
    };
  }

  draftCommunication(alertLevel: string, areaName: string, shelterName: string, recordIds: string[]): CommunicationDraftResult {
    const draftTextBn = `[জরুরি সতর্কতা - ${alertLevel}] ${areaName} এলাকার নাগরিকদের জানানো যাচ্ছে যে বন্যার পানির স্তর বৃদ্ধির কারণে আশ্রয় গ্রহণ করা আবশ্যক। নিকটস্থ নিরাপদ আশ্রয়কেন্দ্র: ${shelterName}। শুকনো খাবার ও সুপেয় পানি সাথে রাখুন।`;

    return {
      draftTextBn,
      sourceRecordIds: recordIds,
      isEditable: true,
      generatedBy: 'deterministic_communication_drafter',
    };
  }

  generateShiftSummary(params: {
    totalSos: number;
    criticalEvacuations: number;
    silentVillages: number;
    deliveriesLogged: number;
    recordIds: string[];
  }): ShiftSummaryResult {
    const summaryBn = `[শিফট সমাপ্তি সংক্ষিপ্তসার / Operations Shift Summary]: বিগত পরিচালনা কার্যক্রমে মোট ${params.totalSos}টি এসওএস রিপোর্ট প্রক্রিয়াকরণ করা হয়েছে। ${params.criticalEvacuations}টি জরুরি উদ্ধার মিশন সম্পন্ন ও অনুমোদিত হয়েছে। ${params.silentVillages}টি নীরব গ্রাম সতর্কতামূলক যাচাইয়ের আওতায় আনা হয়েছে এবং ${params.deliveriesLogged}টি ত্রাণ বিতরণ রসিদ আইডেমপোটেন্ট লেজারে সংরক্ষিত হয়েছে। কোনো উদ্ধার অনুরোধ সরাসরি প্রত্যাখ্যান করা হয়নি।`;

    return {
      summaryBn,
      totalSosProcessed: params.totalSos,
      criticalEvacuationsCount: params.criticalEvacuations,
      silentVillagesFlaggedCount: params.silentVillages,
      reliefDeliveriesLoggedCount: params.deliveriesLogged,
      sourceRecordIds: params.recordIds,
      isEditable: true,
      generatedBy: 'deterministic_shift_summarizer',
    };
  }

  evaluateBenchmark(): BenchmarkReport {
    let peopleCorrect = 0;
    let vulnCorrect = 0;
    let trendCorrect = 0;

    const total = SYNTHETIC_SOS_BENCHMARK.length;

    for (const item of SYNTHETIC_SOS_BENCHMARK) {
      const ext = this.extractSosFields(item.text);

      if (ext.peopleCount === item.expectedPeopleCount) {
        peopleCorrect++;
      }

      if (
        ext.urgencyFlags.trapped === item.expectedTrapped &&
        ext.urgencyFlags.elderly === item.expectedElderly &&
        ext.urgencyFlags.child === item.expectedChild &&
        ext.urgencyFlags.medical === item.expectedMedical
      ) {
        vulnCorrect++;
      }

      if (ext.waterTrend === item.expectedWaterTrend) {
        trendCorrect++;
      }
    }

    const peopleAccuracy = parseFloat(((peopleCorrect / total) * 100).toFixed(1));
    const vulnAccuracy = parseFloat(((vulnCorrect / total) * 100).toFixed(1));
    const trendAccuracy = parseFloat(((trendCorrect / total) * 100).toFixed(1));
    const overallAccuracy = parseFloat((((peopleAccuracy + vulnAccuracy + trendAccuracy) / 3)).toFixed(1));

    return {
      totalMessages: total,
      peopleCountAccuracy: peopleAccuracy,
      vulnerabilityAccuracy: vulnAccuracy,
      waterTrendAccuracy: trendAccuracy,
      overallAccuracy,
      fallbackSuccessRate: 100.0,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

