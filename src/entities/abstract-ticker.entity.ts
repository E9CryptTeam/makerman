import { Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export class AbstractTickerEntity {
  @PrimaryColumn()
  symbol: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  price: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
