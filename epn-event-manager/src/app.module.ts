import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';
import { StatsModule } from './modules/stats/stats.module';
import { LoggerModule } from './common/logger/logger.module';
import { ApiKeyModule } from './common/guards/api-key.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    ApiKeyModule,
    DatabaseModule,
    EventsModule,
    HealthModule,
    StatsModule,
  ],
})
export class AppModule {}
