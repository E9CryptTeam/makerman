import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BinanceTicker } from 'src/entities';
import { Repository } from 'typeorm';
import * as WebSocket from 'ws';
import { BinanceSocketMessage } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { ActiveCoin } from 'src/entities/mongo/active-coin.entity';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BinanceCrawlerService implements OnModuleInit {
  private coins: string[] = [];

  private readonly host = 'wss://stream.binance.com:443/stream';
  private readonly logger = new Logger(BinanceCrawlerService.name);

  private socket: WebSocket = null;

  constructor(
    @InjectRepository(BinanceTicker)
    private binanceTickerRepository: Repository<BinanceTicker>,

    @InjectModel(ActiveCoin.name)
    private readonly activeCoinModel: Model<ActiveCoin>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    const coins = await this.activeCoinModel
      .find()
      .where({ binance: true })
      .exec();
    this.coins = coins.map((c) => c.symbol);
    // WE MIGHT NEED TO CLEAR THE TABLE HERE
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
        params: this.coins.map((c) => `${c.toLowerCase()}usdt@ticker`),
      }),
    );
    this.socket.on('message', (data) => this.handleMessage(data));
    this.socket.on('close', (code, reason) => {
      this.logger.error(`Connection closed: ${code} - ${reason}`);
    });
    this.socket.on('error', (err) => {
      this.logger.error('Error', err);
      this.socket.close();
    });
  }

  async handleMessage(data: WebSocket.RawData): Promise<void> {
    const message = JSON.parse(data.toString()) as BinanceSocketMessage;

    if (message?.id === null && message?.result === null) return;
    const usdtPrice = await this.cacheManager.get<number>('usdt');
    if (!usdtPrice) return;
    const price = +message.data.c * usdtPrice;
    const symbol = message.data.s.split('USDT').shift().toLowerCase();
    const ticker = this.binanceTickerRepository.create({ symbol, price });

    await this.binanceTickerRepository.upsert(ticker, ['symbol']);
    this.eventEmitter.emit('binance.updated', ticker);
  }
}
