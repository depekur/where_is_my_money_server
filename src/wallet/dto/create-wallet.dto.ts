import { WalletType } from '../models/wallet-type';
import { User } from '../../user/schemas/user.schema';
import { Currency } from '../models/currency';

export class CreateWalletDto {
  name: string;
  currency: Currency;
  balance: number;
  type: WalletType;
  user: User;
}
