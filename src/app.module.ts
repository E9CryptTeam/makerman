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

@Module({
  imports: [
    CrawlerModule,
    ListenersModule,
    ScheduleModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'makerman',
      autoLoadEntities: true,
      synchronize: true,
    }),
    CacheModule.register({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    SignalsModule,
    MongooseModule.forRoot(
      'mongodb://root:123456@192.168.1.3:27018/ticker_db_back?authSource=admin',
    ),
    StatusMonitorModule.forRoot(),
  ],
})
export class AppModule {}
