import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { HealthModule } from './modules/health/health.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { SosModule } from './modules/sos/sos.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    ReferenceModule,
    SosModule,
    GatewayModule,
    IncidentsModule,
  ],
})
export class AppModule {}
