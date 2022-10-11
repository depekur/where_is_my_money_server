import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { WalletType } from '../models/wallet-type';
import { User } from '../../user/schemas/user.schema';
import { Currency } from '../models/currency';

export type WalletDocument = Wallet & Document;

@Schema()
export class Wallet {
  @Prop()
  name: string;

  @Prop()
  balance: number;

  @Prop()
  currency: Currency;

  @Prop()
  type: WalletType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
