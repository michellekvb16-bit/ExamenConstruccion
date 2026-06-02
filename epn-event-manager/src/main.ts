import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Configurar logger personalizado
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Registrar filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configurar CORS
  app.enableCors();

  // Configurar Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('EPN Event Manager API')
    .setDescription('API para gestión de eventos con auditoría y trazabilidad')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-FIS-EPN-KEY',
        in: 'header',
        description: 'API Key para autenticación',
      },
      'X-FIS-EPN-KEY',
    )
    .addTag('events', 'Operaciones CRUD de eventos')
    .addTag('health', 'Endpoint de salud')
    .addTag('stats', 'Estadísticas de eventos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/api`,
    'Bootstrap',
  );
}

void bootstrap();
