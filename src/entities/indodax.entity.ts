import { Entity } from 'typeorm';
import { AbstractTickerEntity } from './abstract-ticker.entity';

@Entity()
export class IndodaxTicker extends AbstractTickerEntity {}
