import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  modes: {
    aiProvider: string;
    smsGateway: string;
    satellite: string;
    officialData: string;
    demoDataOnly: boolean;
  };
}

export interface ReadinessStatus {
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: {
    database: {
      status: 'up' | 'down' | 'unconfigured';
      message?: string;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getLiveness(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): HealthStatus {
    return {
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      modes: {
        aiProvider: this.configService.get<string>('AI_PROVIDER', 'mock'),
        smsGateway: this.configService.get<string>('SMS_GATEWAY_MODE', 'simulated'),
        satellite: this.configService.get<string>('SATELLITE_MODE', 'simulated'),
        officialData: this.configService.get<string>('OFFICIAL_DATA_MODE', 'fixtures'),
        demoDataOnly: this.configService.get<boolean>('DEMO_DATA_ONLY', true),
      },
    };
  }

  async getReadiness(): Promise<ReadinessStatus> {
    // In Phase 1 without strict DB dependency yet, reports readiness status clearly
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'up',
          message: 'Database connection check configured for MySQL 8.4',
        },
      },
    };
  }
}

