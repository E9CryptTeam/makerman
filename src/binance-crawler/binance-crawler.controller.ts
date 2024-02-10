import { Controller } from '@nestjs/common';
import { BinanceCrawlerService } from './binance-crawler.service';

@Controller('binance-crawler')
export class BinanceCrawlerController {
  constructor(private readonly binanceCrawlerService: BinanceCrawlerService) {}
}
