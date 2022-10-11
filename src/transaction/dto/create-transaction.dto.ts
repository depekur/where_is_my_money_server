import { TransactionType } from '../models/transaction-type';
import { User } from '../../user/schemas/user.schema';
import { Wallet } from '../../wallet/schemas/wallet.schema';
import { Category } from '../../category/schemas/category.schema';
import { ExchangeData } from '../models/exchange-data';

export class CreateTransactionRequestDto {
  name: string;
  sum: number;
  date: string;
  type: TransactionType;
  user: string;
  wallet: string;
  category: string;
}

export class CreateTransactionDto {
  name: string;
  sum?: number;
  date: string;
  type: TransactionType;
  user: User;
  wallet?: Wallet;
  category?: Category;
  additional?: ExchangeData;
}
