import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BinanceTicker } from 'src/entities';
import { Repository } from 'typeorm';
import * as WebSocket from 'ws';
import { BinanceSocketMessage, BinanceTickerMessage } from './types';

@Injectable()
export class BinanceCrawlerService implements OnModuleInit {
  private started = false;

  private readonly host = 'wss://stream.binance.com:443/stream';
  private readonly stream = '!ticker@arr';
  private readonly logger = new Logger(BinanceCrawlerService.name);

  private socket: WebSocket = null;

  constructor(
    @InjectRepository(BinanceTicker)
    private binanceTickerRepository: Repository<BinanceTicker>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    // WE MIGHT WANT TO CLEAR THE TABLE HERE
    // await this.binanceTickerRepository.clear();
    this.socket = new WebSocket(this.host);
    this.socket.on('open', () => this.handleOpen());
  }

  handleOpen(): void {
    this.logger.debug('Connected to Binance');
    this.logger.debug('Subscribing to ticker stream');
    this.socket.send(
      JSON.stringify({
        method: 'SUBSCRIBE',
        params: [this.stream],
      }),
    );
    this.socket.on('message', (data) => this.handleMessage(data));
  }

  async handleMessage(data: WebSocket.RawData): Promise<void> {
    const message = JSON.parse(data.toString()) as BinanceSocketMessage;

    if (message?.stream === this.stream) {
      const usdtPrice = await this.cacheManager.get<number>('usdt');
      if (!usdtPrice) return;
      const tickers = message.data
        .filter((t) => t.s.endsWith('USDT'))
        .map(({ s, c }) => {
          const symbol = s.split('USDT').shift().toLowerCase();
          const price = +(+c * usdtPrice).toFixed(2);
          const ticker = this.binanceTickerRepository.create({ symbol, price });
          return ticker;
        });

      await this.binanceTickerRepository.upsert(tickers, ['symbol']);
    }
  }
}
