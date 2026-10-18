import { RecoveryService } from './recovery.service';

describe('RecoveryService event scope', () => {
  it('preserves explicitly reported zero needs', async () => {
    const service = new RecoveryService();
    const report = await service.createReport({ areaId: 'synthetic-area', damageLevel: 'LOW', roadPassability: 'OPEN', tubeWellContaminated: false, needWater: true, needFood: true, needMedicine: false, reportedWaterLitresNeed: 0, reportedFoodPacksNeed: 0, reportedBy: 'synthetic-test' });
    expect(report.needs_json).toMatchObject({ waterLitres: 0, foodPacks: 0 });
  });
  it('filters needs and deliveries by selected event', async () => {
    const service = new RecoveryService();
    const exercise = await service.getSummary('11111111-1111-1111-1111-111111111103');
    const historical = await service.getSummary('11111111-1111-1111-1111-111111111101');

    expect(exercise.totalReports).toBeGreaterThan(0);
    expect(exercise.totalDeliveries).toBeGreaterThan(0);
    expect(historical.totalReports).toBe(0);
    expect(historical.totalDeliveries).toBe(0);
    expect(historical.villagesRanking).toHaveLength(0);
  });
});
