import { describe, it, expect } from '@jest/globals';
import { calculateVillageNeedScore } from './recovery-scoring';

describe('Recovery Needs Scoring & Coverage', () => {
  it('calculates CRITICAL priority for destroyed village with contaminated water and cut off roads', () => {
    const result = calculateVillageNeedScore(
      {
        villageId: 'vil-chitholia',
        villageName: 'Chitholia',
        damageLevel: 'DESTROYED',
        tubeWellContaminated: true,
        roadPassability: 'BOAT_ONLY',
        needWater: true,
        needMedicine: true,
        needFood: true,
        estimatedFamilies: 250,
        reportedWaterLitresNeed: 5000,
        reportedFoodPacksNeed: 250,
      },
      {
        deliveredWaterLitres: 0,
        deliveredFoodPacks: 0,
        lastDeliveryTime: null,
      },
    );

    expect(result.priorityScore).toBeGreaterThanOrEqual(70);
    expect(result.urgencyLevel).toBe('CRITICAL');
    expect(result.overallCoveragePercentage).toBe(0);
    expect(result.reasonsBn.length).toBeGreaterThan(2);
    expect(result.disclaimer).toContain('logistical coordination');
  });

  it('reduces priority score and increases coverage when deliveries are confirmed', () => {
    const result = calculateVillageNeedScore(
      {
        villageId: 'vil-mirzanagar',
        villageName: 'Mirzanagar',
        damageLevel: 'SEVERE',
        tubeWellContaminated: true,
        roadPassability: '4WD_ONLY',
        needWater: true,
        needMedicine: false,
        needFood: true,
        estimatedFamilies: 100,
        reportedWaterLitresNeed: 2000,
        reportedFoodPacksNeed: 100,
      },
      {
        deliveredWaterLitres: 2000, // 100% water delivered
        deliveredFoodPacks: 80, // 80% food delivered
        lastDeliveryTime: '2026-10-09T14:00:00Z',
      },
    );

    expect(result.waterCoverageRatio).toBe(1.0);
    expect(result.foodCoverageRatio).toBe(0.8);
    expect(result.overallCoveragePercentage).toBe(90);
    // Adjusted score reduced due to high coverage
    expect(result.priorityScore).toBeLessThan(35);
  });

  it('handles village with low damage and open road as LOW urgency', () => {
    const result = calculateVillageNeedScore(
      {
        villageId: 'vil-safe',
        villageName: 'Highground Ward',
        damageLevel: 'LOW',
        tubeWellContaminated: false,
        roadPassability: 'OPEN',
        needWater: false,
        needMedicine: false,
        needFood: false,
        estimatedFamilies: 50,
        reportedWaterLitresNeed: 0,
        reportedFoodPacksNeed: 0,
      },
      {
        deliveredWaterLitres: 0,
        deliveredFoodPacks: 0,
        lastDeliveryTime: null,
      },
    );

    expect(result.urgencyLevel).toBe('LOW');
    expect(result.priorityScore).toBeLessThan(20);
  });

  it('generates pre-positioning and staging suggestion when road is cut off and water is contaminated', () => {
    const result = calculateVillageNeedScore(
      {
        villageId: 'vil-chitholia',
        villageName: 'Chitholia',
        damageLevel: 'DESTROYED',
        tubeWellContaminated: true,
        roadPassability: 'BOAT_ONLY',
        needWater: true,
        needMedicine: true,
        needFood: true,
        estimatedFamilies: 250,
        reportedWaterLitresNeed: 5000,
        reportedFoodPacksNeed: 250,
        coordinates: { lat: 23.235, lng: 91.415 },
      },
      {
        deliveredWaterLitres: 500,
        deliveredFoodPacks: 50,
        lastDeliveryTime: null,
      },
    );

    expect(result.coordinates).toEqual({ lat: 23.235, lng: 91.415 });
    expect(result.stagingSuggestionBn).toBeDefined();
    expect(result.stagingSuggestionBn).toContain('নৌকা ছাড়া সড়কপথে ত্রাণ পৌঁছানো অসম্ভব');
    expect(result.stagingSuggestionBn).toContain('রিলে-পয়েন্ট');
  });
});

