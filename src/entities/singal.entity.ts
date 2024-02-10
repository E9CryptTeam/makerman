import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Signal extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  symbol: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  percentage: number;

  @Column()
  route: string;
}
