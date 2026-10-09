import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Area } from '../modules/areas/entities/area.entity';
import { Asset } from '../modules/assets/entities/asset.entity';
import { FloodEvent } from '../modules/flood-events/entities/flood-event.entity';
import { Gauge, GaugeObservation } from '../modules/gauges/entities/gauge.entity';
import { RainfallObservation, VolunteerReading } from '../modules/gauges/entities/observation.entity';
import { Shelter } from '../modules/shelters/entities/shelter.entity';
import { User } from '../modules/users/entities/user.entity';
import { SYNTHETIC_FENI_SEEDS } from './seeds/feni-synthetic.seeds';

@Injectable()
export class DatabaseSeederService {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Starting synthetic Feni fixture seeding...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(User);
      for (const u of SYNTHETIC_FENI_SEEDS.users) {
        await userRepo.save(userRepo.create(u));
      }

      const eventRepo = queryRunner.manager.getRepository(FloodEvent);
      for (const e of SYNTHETIC_FENI_SEEDS.floodEvents) {
        await eventRepo.save(eventRepo.create(e));
      }

      const areaRepo = queryRunner.manager.getRepository(Area);
      for (const a of SYNTHETIC_FENI_SEEDS.areas) {
        await areaRepo.save(areaRepo.create(a));
      }

      const gaugeRepo = queryRunner.manager.getRepository(Gauge);
      for (const g of SYNTHETIC_FENI_SEEDS.gauges) {
        await gaugeRepo.save(gaugeRepo.create(g));
      }

      const gaugeObsRepo = queryRunner.manager.getRepository(GaugeObservation);
      for (const obs of SYNTHETIC_FENI_SEEDS.gaugeObservations) {
        await gaugeObsRepo.save(gaugeObsRepo.create(obs));
      }

      const rainRepo = queryRunner.manager.getRepository(RainfallObservation);
      for (const r of SYNTHETIC_FENI_SEEDS.rainfallObservations) {
        await rainRepo.save(rainRepo.create(r));
      }

      const volRepo = queryRunner.manager.getRepository(VolunteerReading);
      for (const v of SYNTHETIC_FENI_SEEDS.volunteerReadings) {
        await volRepo.save(volRepo.create(v));
      }

      const shelterRepo = queryRunner.manager.getRepository(Shelter);
      for (const s of SYNTHETIC_FENI_SEEDS.shelters) {
        await shelterRepo.save(shelterRepo.create(s));
      }

      const assetRepo = queryRunner.manager.getRepository(Asset);
      for (const ast of SYNTHETIC_FENI_SEEDS.assets) {
        await assetRepo.save(assetRepo.create(ast));
      }

      await queryRunner.commitTransaction();
      this.logger.log('Synthetic Feni seed data successfully applied.');
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error during seeding, transaction rolled back:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

