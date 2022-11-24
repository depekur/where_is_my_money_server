import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { WalletService } from '../wallet/wallet.service';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';
import { TransactionType } from './models/transaction-type';
import { QueryStatisticDto } from './dto/query-statistic.dto';
import { DATE_FILTER_TYPE } from './models/date-filter-type';
import { add, sub } from 'date-fns'

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly categoryService: CategoryService
  ) {
  }

  private parseDate(dateStr: string): Date {
    const offset = new Date().getTimezoneOffset();
    const date =  new Date(dateStr);
    let properDate;

    if (offset > 0) {
      properDate = add(date, {
        minutes: offset
      });
    } else {
      properDate = sub(date, {
        minutes: offset
      });
    }

    return properDate;
  }

  async updateAllDates() {
    const allTransactions = await this.transactionModel.find().limit(999999999999).exec();

    for (let i = 0; i < allTransactions.length; i++) {
      await this.transactionModel.findByIdAndUpdate(
        allTransactions[i]['_id'],
        {jsDate: this.parseDate(allTransactions[i]['date'])}
      )
    }

    return true;
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const t = new this.transactionModel({
      ...createTransactionDto,
      jsDate: this.parseDate(createTransactionDto.date),
    });
    return t.save();
  }

  findAllWithOffset(userId: string, offset: number, size: number) {
    if (offset) {
      return this.transactionModel.find({ user: userId })
        .sort({ date: 'asc' })
        .skip(offset ?? 0)
        .limit(size)
        .populate('wallet', 'id currency name type')
        .populate('category', 'id name color');
    } else {
      return this.transactionModel.find({ user: userId })
        .sort({ date: 'asc' })
        .populate('wallet', 'id currency name type')
        .populate('category', 'id name color');
    }
  }

  findAll(userId: string, queryDto?: QueryStatisticDto) {
    if (queryDto && queryDto.filterType !== DATE_FILTER_TYPE.ALL_TIME) {
      return this.transactionModel.find({
        user: userId,
        jsDate: {
          $gte: new Date(queryDto.startDate),
          $lte: new Date(queryDto.endDate)
        }
      })
        .limit(9999999999)
        .populate('wallet', 'id currency name type')
        .populate('category', 'id name color');
    } else {
      return this.transactionModel.find({ user: userId })
        .limit(9999999999)
        .populate('wallet', 'id currency name type')
        .populate('category', 'id name color');
    }
  }

  async getStatistic(userId: string, queryDto: QueryStatisticDto) {
    const userWallets: any = await this.walletService.findAll(userId);
    const userCategories: any = await this.categoryService.findAll(userId);
    const userTransactions = await this.findAll(userId, queryDto);
    const exchangeData = await this.walletService.getExchangeData();

    const totalIncome = [];
    const totalOutcome = [];

    const incomeTransactions = userTransactions
      .filter(t => t.type === TransactionType.INCOME);

    const outcomeTransactions = userTransactions
      .filter(t => t.type === TransactionType.EXPENSE);

    userWallets.forEach(wallet => {
      const walletId = wallet['_id'].toString();

      totalIncome.push({
        currency: wallet.currency,
        total: incomeTransactions
          .filter(x => x.wallet['_id'].toString() === walletId)
          .map(x => x.sum)
          .reduce((prev, curr) => prev + curr, 0)
      });

      totalOutcome.push({
        currency: wallet.currency,
        total: outcomeTransactions
          .filter(x => x.wallet['_id'].toString() === walletId)
          .map(x => x.sum)
          .reduce((prev, curr) => prev + curr, 0)
      });
    });

    const totalEuroIncomeAmount = totalIncome.reduce((prev, curr) => {
      return prev + this.walletService.exchangeToEuro(curr.total, curr.currency, exchangeData);
    }, 0);

    const totalEuroExpenseAmount = totalOutcome.reduce((prev, curr) => {
      return prev + this.walletService.exchangeToEuro(curr.total, curr.currency, exchangeData);
    }, 0);

    const transactionsByCategory = userCategories
      .map(category => {
        const categoryTransactions = userTransactions
          .filter(transaction => transaction.type === TransactionType.EXPENSE)
          .filter(transaction => transaction.category['_id'].toString() === category.id);

        const totalEuro = categoryTransactions.reduce((prev, curr) => {
          return prev + this.walletService.exchangeToEuro(curr.sum, curr.wallet.currency, exchangeData);
        }, 0);

        return {
          categoryName: category.name,
          categoryColor: category.color,
          categoryId: category['_id'].toString(),
          transactionsCount: categoryTransactions.length,
          totalEuro: totalEuro.toFixed(2),
          totalPercent: (totalEuro / totalEuroExpenseAmount * 100).toFixed(2),
          transactions: categoryTransactions
        };
      }).filter(x => x.transactionsCount);

    return {
      totalEuroIncomeAmount: totalEuroIncomeAmount.toFixed(2),
      totalEuroExpenseAmount: totalEuroExpenseAmount.toFixed(2),
      totalIncomeByWallets: totalIncome,
      totalExpenseByWallets: totalOutcome,
      byCategory: transactionsByCategory.sort((a, b) => b.totalEuro - a.totalEuro)
    };
  }

  findOne(id: string) {
    return this.transactionModel.findOne({ _id: id })
      .populate('wallet', 'id currency name type balance');
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: string) {
    return this.transactionModel.deleteOne({ _id: id });
  }
}
