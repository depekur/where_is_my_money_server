import { HttpException, Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { Model } from 'mongoose';
import { Transaction } from '../transaction/schemas/transaction.schema';
import { TransactionType } from '../transaction/models/transaction-type';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ExchangeRates, ExchangeRatesDocument } from './schemas/exchange-rates.schema';
import { Currency } from './models/currency';

@Injectable()
export class WalletService {

  constructor(@InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
              @InjectModel(ExchangeRates.name) private exchangeRatesModel: Model<ExchangeRatesDocument>,
              private readonly http: HttpService,
              private config: ConfigService,) {
  }

  async create(createWalletDto: CreateWalletDto) {
    const createdWallet = new this.walletModel(createWalletDto);
    return createdWallet.save();
  }

  async updateWalletBalance(transaction: Transaction, walletId: string) {
    const wallet = await this.findOne(walletId);

    if (transaction.type === TransactionType.INCOME) {
      await this.update(walletId, {
        balance: wallet.balance + transaction.sum
      });
    } else if (transaction.type === TransactionType.EXPENSE) {
      await this.update(walletId, {
        balance: wallet.balance - transaction.sum
      });
    }
  }

  findAll(userId: string) {
    return this.walletModel.find({ user: userId });
  }

  findOne(id: string) {
    return this.walletModel.findOne({ _id: id });
  }

  update(id: string, updateWalletDto: UpdateWalletDto) {
    return this.walletModel.findByIdAndUpdate(id, updateWalletDto, {new: true});
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }

  exchangeToEuro(amount: number, currency: Currency, exchangeData: any): number {
    const euroCode = 978;
    const uahCode = 980;

    const eurRates = exchangeData.find(x => x.currencyCodeA === euroCode);

    if (amount === 0) {
      return 0;
    }

    if (currency.isoCode === `${uahCode}`) {
      return amount / eurRates.rateSell;
    } else if (currency.isoCode === `${euroCode}`) {
      return amount;
    } else {
      const walletCurrencyRates = exchangeData.find(x => {
        return `${x.currencyCodeA}` === currency.isoCode;
      });
      let uahWalletBalance = 0;
      if (walletCurrencyRates.rateBuy) {
        uahWalletBalance = amount * walletCurrencyRates.rateBuy;
      } else {
        uahWalletBalance = amount * walletCurrencyRates.rateCross;
      }
      return (uahWalletBalance / eurRates.rateSell);
    }
  }

  async getExchangeData() {
    let latest: any = await this.exchangeRatesModel.find().sort({ _id: -1 }).limit(1);
    latest = latest[0];

    if (!latest) {
      return this.requestExchangeRates();
    }

    const requestedAt = new Date(latest['requestedAt']).getTime();
    const now = new Date().getTime();
    let interval = this.config.get('CURRENCY_DATA_UPDATE_INTERVAL_HOURS');
    interval = interval * 60 * 60 * 1000; // hours to ms

    if ((now - requestedAt) > interval) {
      const rates = await this.requestExchangeRates();

      if (rates) {
        return rates;
      } else {
        return latest.rates;
      }
    }

    return latest.rates;
  }

  private async requestExchangeRates() {
    const url = this.config.get('CURRENCY_DATA_API');

    try {
      const data = await this.http.axiosRef.get(url);

      await this.storeExchangeRates({
        requestedAt: new Date().getTime(),
        rates: data.data
      });

      return data.data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private storeExchangeRates(ratesData) {
    const rates = new this.exchangeRatesModel(ratesData);
    return rates.save();
  }
}
