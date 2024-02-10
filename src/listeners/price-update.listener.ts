import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { BinanceTicker, IndodaxTicker } from 'src/entities';
import { Market } from 'src/enums';
import { PriceUpdatePayload } from 'src/types';
import { Repository } from 'typeorm';

import BigNumber from 'bignumber.js';
import { Sign } from 'crypto';
import { Signal } from 'src/entities/singal.entity';

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

  @OnEvent('indodax.updated')
  async handleIndodaxUpdatedEvent(payload: PriceUpdatePayload) {
    const currentMarket = Market.INDODAX;
    const { symbol, price } = payload;

    for (const market of Object.keys(Market)) {
      if (market === currentMarket) continue;
      if (market === Market.BINANCE) {
        const binance = await this.binanceTickerRepository.findOne({
          where: { symbol },
          select: { price: true },
        });
        if (!binance) {
          this.logger.debug(`${symbol} not found in Binance`);
          return;
        }

        const a = new BigNumber(price);
        const b = new BigNumber(binance.price);
        const percentage = calculatePercentageDifference(
          a.toNumber(),
          b.toNumber(),
        );
        if (a.isGreaterThan(b)) {
          const markets = [currentMarket, market];
          const route = `${symbol}.` + markets.join('.');
          const reversedRoute = `${symbol}.` + markets.reverse().join('.');
          const reversedSignal = await this.signalRepository.findOneBy({
            id: reversedRoute,
          });
          if (reversedSignal) {
            await this.signalRepository.remove(reversedSignal);
          }

          await this.signalRepository
            .create({
              id: route,
              symbol,
              percentage,
              route: markets.join(' - '),
            })
            .save();
        }
        if (b.isGreaterThan(a)) {
          const markets = [market, currentMarket];
          const route = `${symbol}.` + markets.join('.');
          const reversedRoute = `${symbol}.` + markets.reverse().join('.');
          const reversedSignal = await this.signalRepository.findOneBy({
            id: reversedRoute,
          });
          if (reversedSignal) {
            await this.signalRepository.remove(reversedSignal);
          }

          await this.signalRepository
            .create({
              id: route,
              symbol,
              percentage,
              route: markets.join(' - '),
            })
            .save();
        }
      }
    }
  }

  @OnEvent('binance.updated')
  async handleBinanceUpdatedEvent(payload: PriceUpdatePayload) {
    this.logger.debug('Binance updated', payload);
  }
}
