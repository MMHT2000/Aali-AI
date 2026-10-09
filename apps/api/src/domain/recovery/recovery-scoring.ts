export interface VillageNeedInput {
  villageId: string;
  villageName: string;
  damageLevel: 'DESTROYED' | 'SEVERE' | 'MODERATE' | 'LOW';
  tubeWellContaminated: boolean;
  roadPassability: 'IMPASSABLE' | 'BOAT_ONLY' | '4WD_ONLY' | 'OPEN';
  needWater: boolean;
  needMedicine: boolean;
  needFood: boolean;
  estimatedFamilies: number;
  reportedWaterLitresNeed: number;
  reportedFoodPacksNeed: number;
}

export interface VillageDeliverySummary {
  deliveredWaterLitres: number;
  deliveredFoodPacks: number;
  lastDeliveryTime: string | null;
}

export interface VillageNeedScoreOutput {
  villageId: string;
  villageName: string;
  priorityScore: number; // [0, 100]
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  factorBreakdown: {
    damageFactor: number;
    tubeWellFactor: number;
    roadCutOffFactor: number;
    healthFactor: number;
  };
  reasonsBn: string[];
  waterCoverageRatio: number; // [0, 1]
  foodCoverageRatio: number; // [0, 1]
  overallCoveragePercentage: number;
  disclaimer: string;
}

/**
 * Pure deterministic coordination scoring for post-disaster recovery.
 * Never makes eligibility or "deservingness" determinations.
 */
export function calculateVillageNeedScore(
  input: VillageNeedInput,
  delivery: VillageDeliverySummary,
): VillageNeedScoreOutput {
  let damageScore: number;
  if (input.damageLevel === 'DESTROYED') damageScore = 35;
  else if (input.damageLevel === 'SEVERE') damageScore = 25;
  else if (input.damageLevel === 'MODERATE') damageScore = 15;
  else damageScore = 5;

  let tubeWellScore = 0;
  if (input.tubeWellContaminated) tubeWellScore = 25;

  let roadScore = 0;
  if (input.roadPassability === 'IMPASSABLE') roadScore = 20;
  else if (input.roadPassability === 'BOAT_ONLY') roadScore = 15;
  else if (input.roadPassability === '4WD_ONLY') roadScore = 8;

  let healthScore = 0;
  if (input.needMedicine) healthScore += 10;
  if (input.needWater) healthScore += 5;
  if (input.needFood) healthScore += 5;

  const rawScore = damageScore + tubeWellScore + roadScore + healthScore;

  // Calculate coverage ratios based on recorded deliveries
  const waterRatio = input.reportedWaterLitresNeed > 0
    ? Math.min(1.0, delivery.deliveredWaterLitres / input.reportedWaterLitresNeed)
    : 1.0;

  const foodRatio = input.reportedFoodPacksNeed > 0
    ? Math.min(1.0, delivery.deliveredFoodPacks / input.reportedFoodPacksNeed)
    : 1.0;

  const averageCoverage = (waterRatio + foodRatio) / 2;

  // Unmet priority reduces as verified deliveries arrive
  const adjustedScore = Math.max(0, Math.round(rawScore * (1 - averageCoverage * 0.7)));

  let urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (adjustedScore >= 70) urgencyLevel = 'CRITICAL';
  else if (adjustedScore >= 45) urgencyLevel = 'HIGH';
  else if (adjustedScore >= 25) urgencyLevel = 'MEDIUM';

  const reasonsBn: string[] = [];
  if (input.damageLevel === 'DESTROYED' || input.damageLevel === 'SEVERE') {
    reasonsBn.push(`বসতবাড়ি মারাত্মক ক্ষতিগ্রস্ত (${input.damageLevel})`);
  }
  if (input.tubeWellContaminated) {
    reasonsBn.push('নলকূপ দূষিত হওয়ায় সুপেয় পানির তীব্র সংকট');
  }
  if (input.roadPassability === 'IMPASSABLE' || input.roadPassability === 'BOAT_ONLY') {
    reasonsBn.push(`যোগাযোগ বিচ্ছিন্ন (${input.roadPassability}) - ত্রাণ পৌঁছাতে নৌকা আবশ্যক`);
  }
  if (input.needMedicine) {
    reasonsBn.push('জরুরি ওষুধ ও পানি-বাহিত রোগের চিকিৎসা প্রয়োজন');
  }

  return {
    villageId: input.villageId,
    villageName: input.villageName,
    priorityScore: adjustedScore,
    urgencyLevel,
    factorBreakdown: {
      damageFactor: damageScore,
      tubeWellFactor: tubeWellScore,
      roadCutOffFactor: roadScore,
      healthFactor: healthScore,
    },
    reasonsBn,
    waterCoverageRatio: parseFloat(waterRatio.toFixed(2)),
    foodCoverageRatio: parseFloat(foodRatio.toFixed(2)),
    overallCoveragePercentage: Math.round(averageCoverage * 100),
    disclaimer: 'Rankings support logistical coordination and relief transparency, not beneficiary eligibility.',
  };
}
