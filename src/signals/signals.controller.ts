import { Controller, Sse } from '@nestjs/common';
import { SignalsService } from './signals.service';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}
  @Sse('stream')
  sse() {
    return this.signalsService.stream();
  }
}
