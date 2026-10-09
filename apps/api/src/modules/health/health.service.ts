import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

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
  constructor(
    private readonly configService: ConfigService,
    @Optional() @Inject(getDataSourceToken()) private readonly dataSource?: DataSource,
  ) {}

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
    let databaseStatus: 'up' | 'down' | 'unconfigured' = 'down';
    if (!this.dataSource) databaseStatus = 'unconfigured';
    else if (this.dataSource.isInitialized) {
      try {
        await this.dataSource.query('SELECT 1');
        databaseStatus = 'up';
      } catch {
        databaseStatus = 'down';
      }
    }
    return {
      status: databaseStatus === 'up' ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: databaseStatus,
          message: databaseStatus === 'up' ? 'MySQL is accepting queries.' : 'MySQL is unavailable; API data is not ready.',
        },
      },
    };
  }
}

