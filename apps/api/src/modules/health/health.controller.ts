import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService, HealthStatus, ReadinessStatus } from './health.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  getLiveness(): { status: string; timestamp: string } {
    return this.healthService.getLiveness();
  }

  @Get('api/v1/health')
  @ApiOperation({ summary: 'API version and configuration status' })
  @ApiResponse({ status: 200, description: 'API health information' })
  getHealth(): HealthStatus {
    return this.healthService.getHealth();
  }

  @Get('api/v1/health/readiness')
  @ApiOperation({ summary: 'Readiness check for database and core subsystems' })
  @ApiResponse({ status: 200, description: 'System readiness status' })
  async getReadiness(): Promise<ReadinessStatus> {
    return this.healthService.getReadiness();
  }
}

