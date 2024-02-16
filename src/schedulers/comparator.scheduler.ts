import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ComparatorScheduler {
  private readonly logger = new Logger(ComparatorScheduler.name);

  @Cron(CronExpression.EVERY_SECOND)
  handle() {
    this.logger.debug('Called when the current second is 0');
  }
}
