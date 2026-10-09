import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { allEntities } from './database/entities.index';
import { InitialAaliSchema1728490000000 } from './database/migrations/1728490000000-InitialAaliSchema';
import { ResidentAccounts1791600000000 } from './database/migrations/1791600000000-ResidentAccounts';
import { SimulationRunState1791600000001 } from './database/migrations/1791600000001-SimulationRunState';
import { DatabaseLifecycleService } from './database/database-lifecycle.service';
import { OperationsModule } from './modules/operations/operations.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { HealthModule } from './modules/health/health.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { SosModule } from './modules/sos/sos.module';
import { UsersModule } from './modules/users/users.module';
import { WarningsModule } from './modules/warnings/warnings.module';
import { AiModule } from './modules/ai/ai.module';
import { RecoveryModule } from './modules/recovery/recovery.module';
import { AuditModule } from './modules/audit/audit.module';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { RolesGuard } from './common/auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [resolve(__dirname, '../../..', '.env'), '.env'],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('MYSQL_HOST', '127.0.0.1'),
        port: config.get<number>('MYSQL_PORT', 3307),
        username: config.get<string>('MYSQL_USER', 'aali_dev'),
        password: config.get<string>('MYSQL_PASSWORD', 'change-this-local-password'),
        database: config.get<string>('MYSQL_DATABASE', 'aali_ai'),
        entities: allEntities,
        migrations: [InitialAaliSchema1728490000000, ResidentAccounts1791600000000, SimulationRunState1791600000001],
        synchronize: false,
        manualInitialization: true,
        connectTimeout: 5000,
        logging: false,
      }),
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    ReferenceModule,
    SosModule,
    GatewayModule,
    IncidentsModule,
    WarningsModule,
    AiModule,
    RecoveryModule,
    AuditModule,
    OperationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    DatabaseLifecycleService,
  ],
})
export class AppModule {}
