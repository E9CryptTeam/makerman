import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

import * as WebSocket from 'ws';

import { IndodaxSummaryService } from './indodax-summary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { IndodaxTicker } from 'src/entities';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class IndodaxLastPriceService implements OnModuleInit {
  private started = false;
  private ws: WebSocket = null;
  private coins = ['btc', 'eth', 'adx', 'xrp', 'doge', 'ltc', 'bch', 'etc'];

  private readonly logger = new Logger(IndodaxLastPriceService.name);
  private readonly host = 'wss://ws3.indodax.com/ws/';
  private readonly token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5NDY2MTg0MTV9.UR1lBM6Eqh0yWz-PVirw1uPCxe60FdchR8eNVdsskeo';

  constructor(
    @InjectRepository(IndodaxTicker)
    private readonly indodaxTickerRepository: Repository<IndodaxTicker>,

    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

    private readonly eventEmitter: EventEmitter2,
    private readonly indodaxSummaryService: IndodaxSummaryService,
  ) {}

  async onModuleInit() {
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
    this.logger.debug('Getting snapshot');
    const summary = await this.indodaxSummaryService.get();
    const tickers = this.indodaxTickerRepository.create(
      summary.map(([symbol, price]) => ({ symbol, price: +price.toFixed(2) })),
    );

    const usdt = tickers.find((t) => t.symbol === 'usdt');
    if (usdt) await this.cacheManager.set('usdt', usdt.price);
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
        id: this.coins.length + 20,
      }),
    );
    this.logger.debug('Subscribing to market summary');
    this.ws.send(
      JSON.stringify({
        method: 1,
        params: {
          channel: 'market:summary-24h',
        },
        id: 2,
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
        .map(([coin, _timestamp, price]) => {
          const symbol = coin.split('idr').shift();
          this.eventEmitter.emit('indodax.updated', { symbol, price });

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
