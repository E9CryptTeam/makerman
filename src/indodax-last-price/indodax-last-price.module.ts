import { Module } from '@nestjs/common';
import { IndodaxSummaryService } from './indodax-summary.service';
import { HttpModule } from '@nestjs/axios';

import { IndodaxLastPriceService } from './indodax-last-price.service';
import { IndodaxLastPriceController } from './indodax-last-price.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndodaxTicker } from 'src/entities';

@Module({
  controllers: [IndodaxLastPriceController],
  providers: [IndodaxLastPriceService, IndodaxSummaryService],
  imports: [
    HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
    TypeOrmModule.forFeature([IndodaxTicker]),
  ],
})
export class IndodaxLastPriceModule {}
