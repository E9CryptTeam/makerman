import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinanceTicker, IndodaxTicker } from 'src/entities';
import { Signal } from 'src/entities/singal.entity';
import { ComparatorScheduler } from './comparator.scheduler';

@Module({
  providers: [ComparatorScheduler],
  imports: [TypeOrmModule.forFeature([BinanceTicker, IndodaxTicker, Signal])],
})
export class ListenersModule {}
