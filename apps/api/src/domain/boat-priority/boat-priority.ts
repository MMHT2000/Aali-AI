export interface BoatPriorityInput {
  peopleCount: number; // raw 1-99
  vulnerabilityFlags: {
    hasChild: boolean;
    elderly: boolean;
    medical: boolean;
    trapped: boolean;
  };
  confidenceScore: number; // [0, 1]
  waterTrend: 'RISING_RAPID' | 'RISING' | 'STEADY' | 'RECEDING';
  waitingMinutes: number; // e.g., 0 - 360+
}

export interface BoatPriorityResult {
  score: number; // [0, 1]
  factorBreakdown: {
    peopleAtRiskNorm: number;
    peopleAtRiskContribution: number;
    vulnerabilityNorm: number;
    vulnerabilityContribution: number;
    confidenceNorm: number;
    confidenceContribution: number;
    waterTrendNorm: number;
    waterTrendContribution: number;
    timeWaitingNorm: number;
    timeWaitingContribution: number;
    weights: {
      peopleAtRisk: 0.30;
      vulnerabilityFlags: 0.25;
      confidence: 0.20;
      waterTrend: 0.15;
      timeWaiting: 0.10;
    };
    reasons: string[];
  };
}

/**
 * Computes deterministic boat priority score based on proposal starting weights:
 * priority = 0.30 * people_at_risk + 0.25 * vulnerability_flags + 0.20 * confidence + 0.15 * water_trend + 0.10 * time_waiting
 * Normalizes all factors to [0, 1].
 */
export function calculateBoatPriority(input: BoatPriorityInput): BoatPriorityResult {
  // 1. people_at_risk norm: 1 person -> 0.1, 10+ people -> 1.0
  const peopleNorm = Math.min(1.0, Math.max(0.1, input.peopleCount / 10));
  const peopleContrib = 0.30 * peopleNorm;

  // 2. vulnerability norm: 4 flags, each 0.25
  let vulnPoints = 0;
  if (input.vulnerabilityFlags.hasChild) vulnPoints += 0.25;
  if (input.vulnerabilityFlags.elderly) vulnPoints += 0.25;
  if (input.vulnerabilityFlags.medical) vulnPoints += 0.25;
  if (input.vulnerabilityFlags.trapped) vulnPoints += 0.25;
  const vulnNorm = Math.min(1.0, Math.max(0.0, vulnPoints));
  const vulnContrib = 0.25 * vulnNorm;

  // 3. confidence norm: direct [0, 1]
  const confNorm = Math.min(1.0, Math.max(0.0, input.confidenceScore));
  const confContrib = 0.20 * confNorm;

  // 4. water trend norm
  let trendNorm = 0.40;
  if (input.waterTrend === 'RISING_RAPID') trendNorm = 1.0;
  else if (input.waterTrend === 'RISING') trendNorm = 0.75;
  else if (input.waterTrend === 'STEADY') trendNorm = 0.40;
  else if (input.waterTrend === 'RECEDING') trendNorm = 0.10;
  const trendContrib = 0.15 * trendNorm;

  // 5. time waiting norm: 0 to 180 minutes -> [0, 1]
  const timeNorm = Math.min(1.0, Math.max(0.0, input.waitingMinutes / 180));
  const timeContrib = 0.10 * timeNorm;

  const totalScore = Math.round((peopleContrib + vulnContrib + confContrib + trendContrib + timeContrib) * 1000) / 1000;

  const reasons = [
    `People at risk: ${input.peopleCount} (${(peopleNorm * 100).toFixed(0)}% normalized) contributing ${peopleContrib.toFixed(3)}`,
    `Vulnerabilities: ${vulnPoints * 4}/4 flags active contributing ${vulnContrib.toFixed(3)}`,
    `Report confidence: ${confNorm.toFixed(2)} contributing ${confContrib.toFixed(3)}`,
    `Water trend: ${input.waterTrend} (${trendNorm.toFixed(2)} normalized) contributing ${trendContrib.toFixed(3)}`,
    `Wait time: ${input.waitingMinutes}m (${timeNorm.toFixed(2)} normalized) contributing ${timeContrib.toFixed(3)}`,
  ];

  return {
    score: totalScore,
    factorBreakdown: {
      peopleAtRiskNorm: peopleNorm,
      peopleAtRiskContribution: peopleContrib,
      vulnerabilityNorm: vulnNorm,
      vulnerabilityContribution: vulnContrib,
      confidenceNorm: confNorm,
      confidenceContribution: confContrib,
      waterTrendNorm: trendNorm,
      waterTrendContribution: trendContrib,
      timeWaitingNorm: timeNorm,
      timeWaitingContribution: timeContrib,
      weights: {
        peopleAtRisk: 0.30,
        vulnerabilityFlags: 0.25,
        confidence: 0.20,
        waterTrend: 0.15,
        timeWaiting: 0.10,
      },
      reasons,
    },
  };
}

