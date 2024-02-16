/*
const schema = new Schema({
  symbol: { type: String, required: true, unique: true },
  binance: { type: Boolean, default: false },
  indodax: { type: Boolean, default: false },
  huobi: { type: Boolean, default: false },
  reku: { type: Boolean, default: false },
  bybit: { type: Boolean, default: false },
  okx: { type: Boolean, default: false },
  kucoin: { type: Boolean, default: false },
  mexc: { type: Boolean, default: false },
  bittime: { type: Boolean, default: false },
  bitget: { type: Boolean, default: false },
  reason: { type: String, required: false, default: '' },
});
*/
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActiveCoinDocument = HydratedDocument<ActiveCoin>;

@Schema({ collection: 'active_coins' })
export class ActiveCoin {
  @Prop({ required: true, unique: true })
  symbol: string;

  @Prop({ default: false })
  binance: boolean;

  @Prop({ default: false })
  indodax: boolean;

  @Prop({ default: false })
  huobi: boolean;

  @Prop({ default: false })
  reku: boolean;

  @Prop({ default: false })
  bybit: boolean;

  @Prop({ default: false })
  okx: boolean;

  @Prop({ default: false })
  kucoin: boolean;

  @Prop({ default: false })
  mexc: boolean;

  @Prop({ default: false })
  bittime: boolean;

  @Prop({ default: false })
  bitget: boolean;

  @Prop({ required: false, default: '' })
  reason: string;
}

export const ActiveCoinSchema = SchemaFactory.createForClass(ActiveCoin);
