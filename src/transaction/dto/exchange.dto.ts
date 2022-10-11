import { ExchangeData } from '../models/exchange-data';
import { TransactionType } from '../models/transaction-type';

export class ExchangeDto {
  name: string;
  sum: number;
  date: string;
  type: TransactionType;
  user: string;
  wallet: string;
  category: string;
  additional: ExchangeData;
}
