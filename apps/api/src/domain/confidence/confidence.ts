import { SosSourceType } from '../../modules/sos/entities/sos-report.entity';

export interface ConfidenceInput {
  sourceType: SosSourceType | string;
  independentCorroboratingReportsCount: number; // within 300m and 30min
  nearbyGaugeAboveWarningOrHeavyRain: boolean;
  minutesSinceReported?: number;
  freshnessWindowMinutes?: number; // default 90 min
}

export interface ConfidenceResult {
  score: number; // [0, 1]
  baseScore: number;
  corroborationBonus: number;
  corroborationCapApplied: boolean;
  environmentalBonus: number;
  isStale: boolean;
  breakdown: {
    sourceType: string;
    base: number;
    corroborationCount: number;
    corroborationScore: number;
    environmental: number;
    freshnessMinutes: number;
    reasons: string[];
  };
}

/**
 * Computes deterministic confidence score based on proposal starting rules:
 * - Base by source: RESPONDER 0.90, KNOWN_VOLUNTEER 0.75, NEW_USER / other 0.40
 * - Add +0.15 per independent report within 300m / 30min, capped at +0.30
 * - Add +0.10 when nearby gauge is above warning level or rainfall is heavy
 * - Clamp final score to [0, 1]
 * - Reports older than freshness window (default 90 min) are marked stale
 */
export function calculateConfidenceScore(input: ConfidenceInput): ConfidenceResult {
  let baseScore = 0.40;
  if (input.sourceType === SosSourceType.RESPONDER || input.sourceType === 'RESPONDER') {
    baseScore = 0.90;
  } else if (input.sourceType === SosSourceType.KNOWN_VOLUNTEER || input.sourceType === 'KNOWN_VOLUNTEER') {
    baseScore = 0.75;
  }

  const rawCorroboration = Math.max(0, input.independentCorroboratingReportsCount) * 0.15;
  const corroborationBonus = Math.min(rawCorroboration, 0.30);
  const corroborationCapApplied = rawCorroboration > 0.30;

  const environmentalBonus = input.nearbyGaugeAboveWarningOrHeavyRain ? 0.10 : 0.0;

  const rawTotal = baseScore + corroborationBonus + environmentalBonus;
  const clampedScore = Math.min(1.0, Math.max(0.0, Math.round(rawTotal * 1000) / 1000));

  const freshnessWindow = input.freshnessWindowMinutes ?? 90;
  const freshnessMinutes = input.minutesSinceReported ?? 0;
  const isStale = freshnessMinutes > freshnessWindow;

  const reasons: string[] = [];
  reasons.push(`Base score ${baseScore.toFixed(2)} from source type '${input.sourceType}'`);
  if (corroborationBonus > 0) {
    reasons.push(
      `Corroboration bonus +${corroborationBonus.toFixed(2)} from ${input.independentCorroboratingReportsCount} independent report(s)${corroborationCapApplied ? ' (capped at +0.30)' : ''}`,
    );
  }
  if (environmentalBonus > 0) {
    reasons.push(`Environmental bonus +0.10 from high gauge level or heavy rainfall`);
  }
  if (isStale) {
    reasons.push(`Report age (${freshnessMinutes}m) exceeds freshness window (${freshnessWindow}m)`);
  }

  return {
    score: clampedScore,
    baseScore,
    corroborationBonus,
    corroborationCapApplied,
    environmentalBonus,
    isStale,
    breakdown: {
      sourceType: String(input.sourceType),
      base: baseScore,
      corroborationCount: input.independentCorroboratingReportsCount,
      corroborationScore: corroborationBonus,
      environmental: environmentalBonus,
      freshnessMinutes,
      reasons,
    },
  };
}

