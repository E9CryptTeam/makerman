import { Controller } from '@nestjs/common';
import { IndodaxLastPriceService } from './indodax-last-price.service';

@Controller('indodax-last-price')
export class IndodaxLastPriceController {
  constructor(private readonly indodaxLastPriceService: IndodaxLastPriceService) {}
}
