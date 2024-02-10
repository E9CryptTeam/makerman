import { Module } from '@nestjs/common';
import { PriceUpdateListener } from './price-update.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinanceTicker, IndodaxTicker } from 'src/entities';
import { Signal } from 'src/entities/singal.entity';

@Module({
  providers: [PriceUpdateListener],
  imports: [TypeOrmModule.forFeature([BinanceTicker, IndodaxTicker, Signal])],
})
export class ListenersModule {}
