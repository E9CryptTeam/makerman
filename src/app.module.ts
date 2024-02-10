import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { IndodaxLastPriceModule } from './indodax-last-price/indodax-last-price.module';
import { BinanceCrawlerModule } from './binance-crawler/binance-crawler.module';
import { ListenersModule } from './listeners/listeners.module';
import { SignalsModule } from './signals/signals.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    IndodaxLastPriceModule,
    BinanceCrawlerModule,
    ListenersModule,
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
  ],
})
export class AppModule { }
