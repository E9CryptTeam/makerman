import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { EventEmitter } from 'stream';
import { fromEvent, merge } from 'rxjs';

import { Signal } from 'src/entities/singal.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SignalsService {
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(
    @InjectRepository(Signal) private signalRepository: Repository<Signal>,
  ) {}

  stream() {
    const signal = fromEvent(this.eventEmitter, 'signal');
    const ping = fromEvent(this.eventEmitter, 'ping');

    return merge(signal, ping);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  ping() {
    this.eventEmitter.emit('ping', {
      id: Date.now(),
      type: 'PING',
      data: null,
    });
  }

  @Cron(CronExpression.EVERY_SECOND)
  async sentSignal() {
    const signal = await this.signalRepository.find();
    this.eventEmitter.emit('signal', {
      id: Date.now(),
      type: 'SIGNAL',
      data: signal,
    });
  }
}
