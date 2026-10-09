import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RedactingLogger } from './common/logger/redacting-logger.service';

async function bootstrap() {
  const logger = new RedactingLogger();
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 3001);
  const webOrigin = configService.get<string>('WEB_ORIGIN', 'http://localhost:5173');

  // Strict CORS for frontend client
  app.enableCors({
    origin: [webOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Aali AI — Disaster Decision Support API')
    .setDescription(
      'Feni flash-flood warning, rescue coordination and recovery decision-support REST API.\n\n' +
      'NOTE: This prototype provides decision-support and coordination. ' +
      'Emergency alerts and dispatch recommendations require authorized human approval.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`Aali AI API is running on port ${port} (Swagger docs: http://localhost:${port}/api/docs)`);
}

bootstrap();

