import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum AiProvider {
  Mock = 'mock',
  Local = 'local',
  Remote = 'remote',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  API_PORT: number = 3001;

  @IsString()
  @IsOptional()
  WEB_ORIGIN: string = 'http://localhost:5173';

  @IsString()
  @IsOptional()
  API_PUBLIC_URL: string = 'http://localhost:3001';

  @IsString()
  @IsOptional()
  MYSQL_HOST: string = '127.0.0.1';

  @IsNumber()
  @IsOptional()
  MYSQL_PORT: number = 3307;

  @IsString()
  @IsOptional()
  MYSQL_DATABASE: string = 'aali_ai';

  @IsString()
  @IsOptional()
  MYSQL_USER: string = 'aali_dev';

  @IsString()
  @IsOptional()
  MYSQL_PASSWORD: string = 'change-this-local-password';

  @IsString()
  @IsOptional()
  MYSQL_ROOT_PASSWORD: string = 'change-this-local-root-password';

  @IsString()
  @MinLength(16, { message: 'JWT_SECRET must be at least 16 characters' })
  @IsOptional()
  JWT_SECRET: string = 'replace-with-a-long-random-local-development-secret';

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '30m';

  @IsEnum(AiProvider)
  @IsOptional()
  AI_PROVIDER: AiProvider = AiProvider.Mock;

  @IsString()
  @IsOptional()
  AI_BASE_URL?: string;

  @IsString()
  @IsOptional()
  AI_API_KEY?: string;

  @IsString()
  @IsOptional()
  AI_PRIMARY_PROVIDER: string = 'deterministic_mock';

  @IsString()
  @IsOptional()
  AI_BACKUP_PROVIDER: string = 'deterministic_fallback';

  @IsNumber()
  @IsOptional()
  AI_TIMEOUT_MS: number = 3000;

  @IsString()
  @IsOptional()
  SMS_GATEWAY_MODE: string = 'simulated';

  @IsString()
  @IsOptional()
  SATELLITE_MODE: string = 'simulated';

  @IsString()
  @IsOptional()
  OFFICIAL_DATA_MODE: string = 'fixtures';

  @IsBoolean()
  @IsOptional()
  DEMO_DATA_ONLY: boolean = true;

  @IsNumber()
  @IsOptional()
  ROAD_WATER_FRESHNESS_MINUTES: number = 90;

  @IsNumber()
  @IsOptional()
  SILENT_VILLAGE_MINUTES: number = 20;

  @IsNumber()
  @IsOptional()
  GAUGE_SILENCE_MINUTES: number = 60;

  @IsNumber()
  @IsOptional()
  DUPLICATE_WINDOW_MINUTES: number = 30;

  @IsNumber()
  @IsOptional()
  DUPLICATE_RADIUS_METERS: number = 300;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((err) => Object.values(err.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  return validatedConfig;
}

