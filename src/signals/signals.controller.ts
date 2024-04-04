import { Controller, Get, Render, Sse } from '@nestjs/common';
import { SignalsService } from './signals.service';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}
  @Sse('hx-stream')
  // @Get('test')
  async sse() {
    return this.signalsService.stream();
  }

  @Get()
  @Render('pages/signal.hbs')
  async index() {
    return { layout: true };
  }

  @Get('content')
  @Render('components/signal-content.hbs')
  async content() {
    const signals = await this.signalsService.find();
    return signals;
  }
}
