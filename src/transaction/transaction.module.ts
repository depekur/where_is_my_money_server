import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from '../wallet/schemas/wallet.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { WalletService } from '../wallet/wallet.service';
import { CategoryService } from '../category/category.service';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { HttpModule } from '@nestjs/axios';
import { ExchangeRates, ExchangeRatesSchema } from '../wallet/schemas/exchange-rates.schema';

@Module({
  controllers: [TransactionController],
  providers: [
    TransactionService,
    WalletService,
    JwtService,
    UserService,
    CategoryService
  ],
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Category.name, schema: CategorySchema },
      { name: ExchangeRates.name, schema: ExchangeRatesSchema },
    ])
  ]
})
export class TransactionModule {
}
