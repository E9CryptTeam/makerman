import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ListenersModule } from './listeners/listeners.module';
import { SignalsModule } from './signals/signals.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerModule } from './crawlers/crawlers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { StatusMonitorModule } from '@ntlib/status-monitor-nestjs';
import { SchedulersModule } from './schedulers/schedulers.module';

@Module({
  imports: [
    CrawlerModule,
    ListenersModule,
    ScheduleModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'e9admin',
      password: 'hjkl1234',
      database: 'ticker',
      autoLoadEntities: true,
      synchronize: true,
    }),
    CacheModule.register({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    SignalsModule,
    MongooseModule.forRoot(
      'mongodb://root:123456@localhost:27018/ticker_db_back?authSource=admin',
    ),
    StatusMonitorModule.forRoot(),
    SchedulersModule,
  ],
})
export class AppModule {}
