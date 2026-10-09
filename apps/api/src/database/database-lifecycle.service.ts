import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseLifecycleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseLifecycleService.name);
  private retryTimer?: NodeJS.Timeout;
  private stopping = false;

  constructor(private readonly dataSource: DataSource, private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    if (this.config.get<string>('NODE_ENV') === 'test') return;
    await this.connectAndMigrate();
  }

  onModuleDestroy(): void {
    this.stopping = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  private async connectAndMigrate(): Promise<void> {
    if (this.stopping || this.dataSource.isInitialized) return;
    try {
      await this.dataSource.initialize();
      await this.dataSource.runMigrations({ transaction: 'all' });
      this.logger.log('MySQL connected and versioned migrations are current.');
    } catch (error) {
      this.logger.warn(`MySQL unavailable; readiness remains down and retry is scheduled: ${this.safeMessage(error)}`);
      if (!this.stopping) {
        this.retryTimer = setTimeout(() => void this.connectAndMigrate(), 5000);
        this.retryTimer.unref();
      }
    }
  }

  private safeMessage(error: unknown): string {
    return error instanceof Error ? error.message.slice(0, 180) : 'database connection failed';
  }
}
