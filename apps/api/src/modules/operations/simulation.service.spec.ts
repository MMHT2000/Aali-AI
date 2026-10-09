import { SimulationService } from './simulation.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SimulationRunState } from './entities/simulation-run-state.entity';

describe('SimulationService', () => {
  let simulation: SimulationService;

  beforeEach(() => { simulation = new SimulationService(); });
  afterEach(() => simulation.onModuleDestroy());

  it('advances a reproducible synthetic timeline and derives alerts from rule evidence', async () => {
    const initial = simulation.getState();
    expect(initial.provenance).toBe('SYNTHETIC_SCENARIO_FIXTURE');
    expect(initial.alert.computedLevel).toBe('NORMAL');

    const second = await simulation.step();
    expect(second.tickIndex).toBe(1);
    expect(second.sourceData.rainfall.valueMm).toBe(78.5);
    expect(second.alert.computedLevel).toBe('WARNING');
    expect(second.alert.reasonCodes).toContain('SIGNAL_A_GAUGE_CRITICAL');

    const reset = await simulation.reset();
    expect(reset.tickIndex).toBe(0);
    expect(reset.alert.computedLevel).toBe(initial.alert.computedLevel);
  });

  it('lets the operator simulate connectivity loss without claiming message delivery', async () => {
    const state = await simulation.setConnectivity(false);
    expect(state.connectivity).toEqual({ internetAvailable: false, source: 'SIMULATION_CONTROL' });
    expect(state.provenance).toBe('SYNTHETIC_SCENARIO_FIXTURE');
  });

  it('restores persisted scenario position paused and saves subsequent ticks', async () => {
    const repository = {
      findOneBy: jest.fn().mockResolvedValue({ id: 'feni-synthetic-rising-water-v1', state: { tickIndex: 2, speed: 4, internetOverride: false } }),
      save: jest.fn(async (record: SimulationRunState) => record),
    };
    const module = await Test.createTestingModule({
      providers: [SimulationService, { provide: getRepositoryToken(SimulationRunState), useValue: repository }],
    }).compile();
    const restored = module.get(SimulationService);
    await restored.onApplicationBootstrap();
    expect(restored.getState().tickIndex).toBe(2);
    expect(restored.getState().running).toBe(false);
    expect(restored.getState().speed).toBe(4);
    await restored.step();
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ state: { tickIndex: 3, speed: 4, internetOverride: false } }));
  });
});
