import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { EventEmitter } from 'stream';
import { Observable, fromEvent, merge } from 'rxjs';

import { Signal } from 'src/entities/singal.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import handlebars from 'handlebars';

export enum SignalType {
  PING = 'PING',
  SIGNAL = 'SIGNAL',
}
export type PingMessage = {
  id: number;
  type: SignalType.PING;
  data: null;
};

export type SignalMessage = {
  id: number;
  type: SignalType.SIGNAL;
  data: Signal[];
};

@Injectable()
export class SignalsService {
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(
    @InjectRepository(Signal) private signalRepository: Repository<Signal>,
  ) {}

  stream(): Observable<SignalMessage | PingMessage> {
    const signal = fromEvent<SignalMessage>(this.eventEmitter, 'signal');
    const ping = fromEvent<PingMessage>(this.eventEmitter, 'ping');

    return merge<[SignalMessage, PingMessage]>(signal, ping);
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
    const signal = await this.signalRepository.find({
      order: {
        percentage: 'DESC',
      },
    });
    const template = handlebars.compile(`
      {{#each this}}
        <tr id="{{id}}">
          <td>{{symbol}}</td>
          <td>{{route}}</td>
          <td>{{percentage}} %</td>
          <td>{{buy}}</td>
          <td>{{sell}}</td>
        </tr>
      {{/each}}
    `);
    this.eventEmitter.emit('signal', {
      id: Date.now(),
      type: 'SIGNAL',
      data: template(signal),
    });
  }

  async find() {
    return await this.signalRepository.find({
      order: {
        percentage: 'DESC',
      },
    });
  }
}
