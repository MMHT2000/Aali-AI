export interface DuplicateEvaluationInput {
  leftReport: {
    id: string;
    geohash7: string;
    peopleCount: number;
    reportedAt: Date | string;
    text?: string;
  };
  rightReport: {
    id: string;
    geohash7: string;
    peopleCount: number;
    reportedAt: Date | string;
    text?: string;
  };
  aiTextSimilarity?: number; // [0, 1] optional suggestion
}

export interface DuplicateEvaluationResult {
  isCandidate: boolean;
  score: number; // [0, 1]
  spatialMatch: boolean;
  timeDeltaSeconds: number;
  peopleCountMatch: boolean;
  reasonCodes: string[];
}

/**
 * Candidate duplicate detection:
 * Combines spatial cell (geohash7 match), candidate time window (<= 30 min),
 * people count similarity (difference <= 2), and optional AI text similarity.
 *
 * NOTE: AI text similarity is an advisory input only.
 * AI never auto-merges records; human review is required.
 */
export function evaluateDuplicateCandidate(input: DuplicateEvaluationInput): DuplicateEvaluationResult {
  const leftTime = new Date(input.leftReport.reportedAt).getTime();
  const rightTime = new Date(input.rightReport.reportedAt).getTime();
  const timeDeltaSeconds = Math.abs(leftTime - rightTime) / 1000;
  const within30MinWindow = timeDeltaSeconds <= 1800;

  const spatialMatch =
    input.leftReport.geohash7 === input.rightReport.geohash7 &&
    input.leftReport.geohash7 !== '0000000';

  const countDiff = Math.abs(input.leftReport.peopleCount - input.rightReport.peopleCount);
  const peopleCountMatch = countDiff <= 2;

  let score = 0.0;
  const reasonCodes: string[] = [];

  if (spatialMatch) {
    score += 0.40;
    reasonCodes.push(`Identical geohash7 cell: ${input.leftReport.geohash7}`);
  }

  if (within30MinWindow) {
    const timeScore = 0.30 * (1 - timeDeltaSeconds / 1800);
    score += timeScore;
    reasonCodes.push(`Report time delta: ${Math.round(timeDeltaSeconds / 60)} minutes (<= 30m)`);
  }

  if (peopleCountMatch) {
    score += 0.15;
    reasonCodes.push(`Similar people count (${input.leftReport.peopleCount} vs ${input.rightReport.peopleCount})`);
  }

  if (input.aiTextSimilarity !== undefined && input.aiTextSimilarity > 0) {
    const aiContrib = 0.15 * Math.min(1.0, Math.max(0, input.aiTextSimilarity));
    score += aiContrib;
    reasonCodes.push(`AI text similarity suggestion: ${(input.aiTextSimilarity * 100).toFixed(0)}%`);
  }

  const finalScore = Math.min(1.0, Math.round(score * 1000) / 1000);
  const isCandidate = spatialMatch && within30MinWindow && finalScore >= 0.50;

  return {
    isCandidate,
    score: finalScore,
    spatialMatch,
    timeDeltaSeconds: Math.round(timeDeltaSeconds),
    peopleCountMatch,
    reasonCodes,
  };
}

