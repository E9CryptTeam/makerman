import { Test, TestingModule } from '@nestjs/testing';
import { BinanceCrawlerController } from './binance-crawler.controller';
import { BinanceCrawlerService } from './binance-crawler.service';

describe('BinanceCrawlerController', () => {
  let controller: BinanceCrawlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinanceCrawlerController],
      providers: [BinanceCrawlerService],
    }).compile();

    controller = module.get<BinanceCrawlerController>(BinanceCrawlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
