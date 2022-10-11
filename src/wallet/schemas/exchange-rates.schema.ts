import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ExchangeRatesDocument = ExchangeRates & Document;

@Schema()
export class ExchangeRates {

  @Prop({ type: Date, required: true })
  requestedAt: Date;

  @Prop({type: mongoose.Schema.Types.Mixed})
  rates: any;
}

export const ExchangeRatesSchema = SchemaFactory.createForClass(ExchangeRates);
