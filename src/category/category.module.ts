import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { WalletService } from '../wallet/wallet.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from '../wallet/schemas/wallet.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { HttpModule } from '@nestjs/axios';
import { ExchangeRates, ExchangeRatesSchema } from '../wallet/schemas/exchange-rates.schema';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, WalletService, JwtService, UserService],
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: ExchangeRates.name, schema: ExchangeRatesSchema },
    ]),
  ],
})
export class CategoryModule {}
