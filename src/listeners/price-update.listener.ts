import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { BinanceTicker, IndodaxTicker } from 'src/entities';
import { Market } from 'src/enums';
import { PriceUpdatePayload } from 'src/types';
import { Repository } from 'typeorm';

import BigNumber from 'bignumber.js';
import { Signal } from 'src/entities/singal.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

export class Potention {
  symbol: string;
  percentage: number;
  route: `${Market}.${Market}`;
}

function calculatePercentageDifference(
  a: number,
  b: number,
  scale: number = 2,
) {
  const factor = Math.pow(10, scale);
  const scaledA = a * factor;
  const scaledB = b * factor;
  const absoluteDifference = Math.abs(scaledA - scaledB);
  const average = Math.floor((scaledA + scaledB) / 2);

  const percentageDifference = (absoluteDifference / average) * 100;
  return percentageDifference;
}

@Injectable()
export class PriceUpdateListener {
  private logger = new Logger(PriceUpdateListener.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(Signal)
    private readonly signalRepository: Repository<Signal>,
    @InjectRepository(IndodaxTicker)
    private readonly indodaxTickerRepository: Repository<IndodaxTicker>,
    @InjectRepository(BinanceTicker)
    private readonly binanceTickerRepository: Repository<BinanceTicker>,
  ) {}

  // @OnEvent('indodax.updated')
  // @Cron(CronExpression.EVERY_SECOND)
  async handleIndodax() {
    // const q =  this.indodaxTickerRepository.createQueryBuilder('idx')
  }
}

