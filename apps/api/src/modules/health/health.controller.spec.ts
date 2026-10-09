import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    healthController = moduleRef.get<HealthController>(HealthController);
  });

  describe('getLiveness', () => {
    it('should return liveness status ok', () => {
      const res = healthController.getLiveness();
      expect(res.status).toBe('ok');
      expect(res.timestamp).toBeDefined();
    });
  });

  describe('getHealth', () => {
    it('should return health status with modes and version', () => {
      const res = healthController.getHealth();
      expect(res.status).toBe('ok');
      expect(res.version).toBe('0.1.0');
      expect(res.modes).toBeDefined();
      expect(res.modes.aiProvider).toBeDefined();
    });
  });

  describe('getReadiness', () => {
    it('should return readiness structure', async () => {
      const res = await healthController.getReadiness();
      expect(res.status).toBe('ready');
      expect(res.checks.database.status).toBe('up');
    });
  });
});

