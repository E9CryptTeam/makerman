import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { BinanceTicker, IndodaxTicker } from 'src/entities';
import BinanceCrawler from './binance';
import IndodaxCrawlers from './indodax';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ActiveCoin,
  ActiveCoinSchema,
} from 'src/entities/mongo/active-coin.entity';
import { Signal } from 'src/entities/singal.entity';
import { Repository } from 'typeorm';

@Module({
  controllers: [],
  providers: [...BinanceCrawler, ...IndodaxCrawlers],
  imports: [
    TypeOrmModule.forFeature([BinanceTicker, IndodaxTicker, Signal]),
    MongooseModule.forFeature([
      {
        name: ActiveCoin.name,
        schema: ActiveCoinSchema,
      },
    ]),
    HttpModule.register({}),
  ],
})
export class CrawlerModule implements OnModuleInit {
  private readonly logger = new Logger(CrawlerModule.name);
  constructor(
    @InjectRepository(Signal)
    private readonly signalRepository: Repository<Signal>,
  ) {}
  async onModuleInit() {
    this.logger.log('Clearing signals');
    await this.signalRepository.clear();
  }
}
