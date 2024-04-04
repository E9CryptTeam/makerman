import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

import * as WebSocket from 'ws';

import { IndodaxSummaryService } from './indodax-summary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { IndodaxTicker } from 'src/entities';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { ActiveCoin } from 'src/entities/mongo/active-coin.entity';
import { Model } from 'mongoose';

@Injectable()
export class IndodaxCrawlersService implements OnModuleInit {
  private started = false;
  private ws: WebSocket = null;
  private coins: string[] = [];

  private readonly logger = new Logger(IndodaxCrawlersService.name);
  private readonly host = 'wss://ws3.indodax.com/ws/';
  private readonly token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5NDY2MTg0MTV9.UR1lBM6Eqh0yWz-PVirw1uPCxe60FdchR8eNVdsskeo';

  constructor(
    @InjectRepository(IndodaxTicker)
    private readonly indodaxTickerRepository: Repository<IndodaxTicker>,

    @InjectModel(ActiveCoin.name)
    private readonly activeCoinModel: Model<ActiveCoin>,

    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

    private readonly eventEmitter: EventEmitter2,
    private readonly indodaxSummaryService: IndodaxSummaryService,
  ) {}

  async onModuleInit() {
    await this.indodaxTickerRepository.clear();
    await this.getSnapshot();

    this.ws = new WebSocket(this.host);
    this.ws.on('open', () => this.handleOpen());
    this.ws.on('message', (message) => this.handleMessage(message));
    this.ws.on('close', (code, reason) => {
      this.started = false;
      this.logger.error(`Connection closed: ${code} - ${reason}`);
    });
    this.ws.on('error', (err) => {
      this.logger.error('Error', err);
      this.ws.close();
    });

    this.started = true;
  }

  private async getSnapshot() {
    const coins = await this.activeCoinModel
      .find()
      .where({
        indodax: true,
      })
      .exec();
    this.coins = coins.map((c) => c.symbol);
    this.coins.push('usdt');
    this.logger.debug('Getting snapshot');
    const summary = await this.indodaxSummaryService.get();
    const tickers = this.indodaxTickerRepository.create(
      summary
        .map(([symbol, price]) => ({ symbol, price: +price.toFixed(2) }))
        .filter((t) => this.coins.includes(t.symbol)),
    );
    const usdt = tickers.find((t) => t.symbol === 'usdt');
    if (usdt) {
      await this.cacheManager.set('usdt', usdt.price);
      tickers.splice(tickers.indexOf(usdt), 1);
    }
    await this.indodaxTickerRepository.upsert(tickers, ['symbol']);
  }

  private handleOpen() {
    this.started = true;
    this.logger.debug('Connected to Indodax');
    this.logger.debug('Authenticating');
    this.ws.send(
      JSON.stringify({
        params: {
          token: this.token,
        },
        id: Math.floor(Date.now() / 1000),
      }),
    );
    this.logger.debug('Subscribing to market summary');
    this.ws.send(
      JSON.stringify({
        method: 1,
        params: {
          channel: 'market:summary-24h',
        },
        id: Math.floor(Date.now() / 1000) + 1,
      }),
    );
  }

  private async handleMessage(data: WebSocket.Data) {
    const message = JSON.parse(data.toString());
    if (message?.result?.recoverable) {
      this.logger.log('Subscribe to market summary');
    }

    if (message?.result?.data?.data) {
      const tickers = message.result.data.data as [string, number, number][];
      const parsed = tickers
        .filter(([coin]) => coin.endsWith('idr'))
        .filter(([coin]) => this.coins.includes(coin.split('idr').shift()))
        .map(([coin, _timestamp, price]) => {
          const symbol = coin.split('idr').shift();
          // this.eventEmitter.emit('indodax.updated', { symbol, price });

          const ticker = this.indodaxTickerRepository.create({
            symbol,
            price: +price.toFixed(2),
          });
          return ticker;
        });

      const usdt = parsed.find((t) => t.symbol === 'usdt');
      if (usdt) await this.cacheManager.set('usdt', usdt.price);
      await this.indodaxTickerRepository.upsert(parsed, ['symbol']);
    }
  }
}
