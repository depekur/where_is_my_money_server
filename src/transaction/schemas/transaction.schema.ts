import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Wallet } from '../../wallet/schemas/wallet.schema';
import { Category } from '../../category/schemas/category.schema';
import { TransactionType } from '../models/transaction-type';
import { ExchangeData } from '../models/exchange-data';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop()
  name: string;

  @Prop()
  sum: number;

  @Prop()
  date: string;

  @Prop()
  type: TransactionType;

  @Prop()
  additional: ExchangeData

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' })
  wallet: Wallet;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Category;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
