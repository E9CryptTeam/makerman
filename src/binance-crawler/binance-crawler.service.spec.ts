import { Test, TestingModule } from '@nestjs/testing';
import { BinanceCrawlerService } from './binance-crawler.service';

describe('BinanceCrawlerService', () => {
  let service: BinanceCrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinanceCrawlerService],
    }).compile();

    service = module.get<BinanceCrawlerService>(BinanceCrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
