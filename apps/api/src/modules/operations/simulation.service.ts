import { BadRequestException, Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { evaluateThreeSignalAlert } from '../../domain/flood-alert/three-signal-alert';
import { SimulationRunState } from './entities/simulation-run-state.entity';

export interface SimulationTick {
  waterLevelM: number;
  rainfallMm: number;
  volunteerReading: boolean;
  incomingSos: number;
  gaugeAvailable: boolean;
  connectivityAvailable: boolean;
}

const TICKS: readonly SimulationTick[] = [
  { waterLevelM: 11.2, rainfallMm: 22, volunteerReading: false, incomingSos: 0, gaugeAvailable: true, connectivityAvailable: true },
  { waterLevelM: 11.85, rainfallMm: 78.5, volunteerReading: false, incomingSos: 1, gaugeAvailable: true, connectivityAvailable: true },
  { waterLevelM: 12.3, rainfallMm: 110, volunteerReading: true, incomingSos: 3, gaugeAvailable: true, connectivityAvailable: true },
  { waterLevelM: 13.4, rainfallMm: 135, volunteerReading: true, incomingSos: 6, gaugeAvailable: false, connectivityAvailable: false },
  { waterLevelM: 12.7, rainfallMm: 93, volunteerReading: true, incomingSos: 8, gaugeAvailable: true, connectivityAvailable: true },
];

@Injectable()
export class SimulationService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(SimulationService.name);
  private tickIndex = 0;
  private running = false;
  private speed = 1;
  private internetOverride: boolean | null = null;
  private timer?: NodeJS.Timeout;

  constructor(@Optional() @InjectRepository(SimulationRunState) private readonly runRepository?: Repository<SimulationRunState>) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.runRepository) return;
    try {
      const record = await this.runRepository.findOneBy({ id: 'feni-synthetic-rising-water-v1' });
      if (record) {
        this.tickIndex = Math.min(Math.max(record.state.tickIndex, 0), TICKS.length - 1);
        this.speed = [1, 2, 4].includes(record.state.speed) ? record.state.speed : 1;
        this.internetOverride = record.state.internetOverride;
        // A restart always pauses an exercise; it never resumes simulation without operator action.
        this.running = false;
        if (record.state.tickIndex !== this.tickIndex) await this.persistState();
      }
    } catch {
      this.logger.warn('Saved simulation state could not be loaded; using the documented initial fixture state.');
    }
  }

  onModuleDestroy(): void {
    this.stopTimer();
  }

  getState() {
    const tick = TICKS[this.tickIndex];
    const connectivityAvailable = this.internetOverride ?? tick.connectivityAvailable;
    const alert = evaluateThreeSignalAlert({
      areaId: '22222222-2222-2222-2222-222222222202',
      areaName: 'Parshuram',
      reportedBreach: tick.waterLevelM >= 13,
      signalA: {
        gaugeLevelM: tick.waterLevelM,
        rise3hCm: [8, 28, 35, 45, 22][this.tickIndex],
        minutesSinceObservation: tick.gaugeAvailable ? 5 : 75,
        isBlanked: !tick.gaugeAvailable,
      },
      signalB: { rainfallMm: tick.rainfallMm, windowMinutes: 180, minutesSinceObservation: 10 },
      signalC: {
        levelM: tick.waterLevelM,
        isRapidRiseReported: tick.volunteerReading,
        minutesSinceObservation: tick.volunteerReading ? 15 : 120,
      },
    });

    return {
      scenarioId: 'feni-synthetic-rising-water-v1',
      scenarioName: 'Feni Synthetic Rising Water Exercise',
      provenance: 'SYNTHETIC_SCENARIO_FIXTURE',
      isReconstructed: false,
      mode: 'SIMULATION',
      tickIndex: this.tickIndex,
      totalTicks: TICKS.length,
      running: this.running,
      speed: this.speed,
      simulatedAt: new Date().toISOString(),
      sourceData: {
        gauge: { valueM: tick.waterLevelM, available: tick.gaugeAvailable, source: 'SYNTHETIC_GAUGE_FIXTURE' },
        rainfall: { valueMm: tick.rainfallMm, available: true, source: 'SYNTHETIC_RAINFALL_FIXTURE' },
        volunteerReading: { available: tick.volunteerReading, source: 'SYNTHETIC_VOLUNTEER_FIXTURE' },
      },
      alert,
      incomingSos: tick.incomingSos,
      connectivity: { internetAvailable: connectivityAvailable, source: 'SIMULATION_CONTROL' },
    };
  }

  async start() {
    this.running = true;
    this.schedule();
    await this.persistState();
    return this.getState();
  }

  async pause() {
    this.running = false;
    this.stopTimer();
    await this.persistState();
    return this.getState();
  }

  async step() {
    this.tickIndex = Math.min(this.tickIndex + 1, TICKS.length - 1);
    await this.persistState();
    return this.getState();
  }

  async setSpeed(speed: number) {
    if (![1, 2, 4].includes(speed)) throw new BadRequestException('Speed must be 1, 2, or 4.');
    this.speed = speed;
    if (this.running) this.schedule();
    await this.persistState();
    return this.getState();
  }

  async setConnectivity(internetAvailable: boolean) {
    this.internetOverride = internetAvailable;
    await this.persistState();
    return this.getState();
  }

  async reset() {
    this.running = false;
    this.stopTimer();
    this.tickIndex = 0;
    this.speed = 1;
    this.internetOverride = null;
    await this.persistState();
    return this.getState();
  }

  private schedule() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (this.tickIndex >= TICKS.length - 1) {
        this.running = false;
        this.stopTimer();
        void this.persistState();
        return;
      }
      this.tickIndex += 1;
      void this.persistState();
    }, 5000 / this.speed);
    this.timer.unref();
  }

  private stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  private async persistState(): Promise<void> {
    if (!this.runRepository) return;
    try {
      await this.runRepository.save({
        id: 'feni-synthetic-rising-water-v1',
        state: { tickIndex: this.tickIndex, speed: this.speed, internetOverride: this.internetOverride },
      });
    } catch {
      this.logger.warn('Simulation state change could not be persisted.');
    }
  }
}
