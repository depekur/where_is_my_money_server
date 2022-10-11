import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { HttpModule } from '@nestjs/axios';
import { ExchangeRates, ExchangeRatesSchema } from './schemas/exchange-rates.schema';

@Module({
  controllers: [WalletController],
  providers: [WalletService, JwtService, UserService],
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
      { name: ExchangeRates.name, schema: ExchangeRatesSchema },
    ]),
  ],
})
export class WalletModule {}

