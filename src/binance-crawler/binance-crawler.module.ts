import { Module } from '@nestjs/common';
import { BinanceCrawlerService } from './binance-crawler.service';
import { BinanceCrawlerController } from './binance-crawler.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinanceTicker } from 'src/entities';

@Module({
  controllers: [BinanceCrawlerController],
  providers: [BinanceCrawlerService],
  imports: [TypeOrmModule.forFeature([BinanceTicker])],
})
export class BinanceCrawlerModule {}
