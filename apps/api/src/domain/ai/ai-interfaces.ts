export interface SosExtractedFields {
  peopleCount: number | null;
  urgencyFlags: {
    trapped: boolean;
    elderly: boolean;
    child: boolean;
    medical: boolean;
  };
  locationWords: string[];
  waterTrend: 'RISING_RAPID' | 'RISING_STEADY' | 'STABLE' | 'RECEDING' | 'UNKNOWN';
  fieldConfidence: {
    peopleCount: number;
    urgencyFlags: number;
    locationWords: number;
    waterTrend: number;
  };
}

export interface SosUnderstandingResult {
  extracted: SosExtractedFields;
  rawText: string;
  providerMode: 'mock' | 'local' | 'remote' | 'deterministic_keyword_fallback';
  isFallback: boolean;
  latencyMs: number;
}

export interface DuplicateExplanationResult {
  similarityScore: number; // [0, 1]
  matchReasons: string[];
  explanationBn: string;
  suggestedAction: 'MERGE_CANDIDATE' | 'DISTINCT_REPORTS';
}

export interface CommunicationDraftResult {
  draftTextBn: string;
  sourceRecordIds: string[];
  isEditable: true;
  generatedBy: string;
}

export interface SyntheticBenchmarkItem {
  id: string;
  text: string;
  expectedPeopleCount: number | null;
  expectedTrapped: boolean;
  expectedElderly: boolean;
  expectedChild: boolean;
  expectedMedical: boolean;
  expectedWaterTrend: 'RISING_RAPID' | 'RISING_STEADY' | 'STABLE' | 'RECEDING' | 'UNKNOWN';
  category: 'BANGLA_FORMAL' | 'BANGLA_COLLOQUIAL' | 'BANGLISH';
}

export interface BenchmarkReport {
  totalMessages: number;
  peopleCountAccuracy: number; // percentage
  vulnerabilityAccuracy: number; // percentage
  waterTrendAccuracy: number; // percentage
  overallAccuracy: number; // percentage
  fallbackSuccessRate: number; // percentage
  evaluatedAt: string;
}

