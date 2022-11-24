import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionRequestDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';
import { CategoryService } from '../category/category.service';
import { ExchangeDto } from './dto/exchange.dto';
import { TransactionType } from './models/transaction-type';
import { QueryStatisticDto } from './dto/query-statistic.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService,
              private readonly userService: UserService,
              private readonly walletService: WalletService,
              private readonly categoryService: CategoryService) {
  }

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionRequestDto, @Request() req) {
    const user = await this.userService.getUser(req.user.deviceId);
    const category = await this.categoryService.findOne(createTransactionDto.category);
    const wallet = await this.walletService.findOne(createTransactionDto.wallet);

    const transaction = await this.transactionService.create({
      ...createTransactionDto,
      user: user,
      category: category,
      wallet: wallet
    });

    await this.walletService.updateWalletBalance(transaction, wallet['_id']);

    return transaction;
  }

  @Post('exchange')
  async exchange(@Body() exchangeDto: ExchangeDto, @Request() req) {
    console.log('exchange');

    const user = await this.userService.getUser(req.user.deviceId);

    const walletFrom = await this.walletService.findOne(exchangeDto.additional.fromWalletId);
    const walletTo = await this.walletService.findOne(exchangeDto.additional.toWalletId);

    await this.walletService.update(exchangeDto.additional.fromWalletId, {
      balance: walletFrom.balance - exchangeDto.additional.fromSum
    });

    await this.walletService.update(exchangeDto.additional.toWalletId, {
      balance: walletTo.balance + exchangeDto.additional.toSum
    });

    const transaction = await this.transactionService.create({
      name: exchangeDto.name,
      date: exchangeDto.date,
      type: exchangeDto.type,
      additional: exchangeDto.additional,
      user: user
    });

    return {
      ...transaction['_doc'],
      additional: {
        ...transaction.additional,
        fromWallet: walletFrom,
        toWallet: walletTo
      }
    };
  }

  @Get()
  async findAll(@Request() req, @Query() query) {
    const transactions = await this.transactionService.findAllWithOffset(
      req.user.id,
      +query.offset,
      +query.size
    );
    const wallets: any = await this.walletService.findAll(req.user.id);

    return transactions.map(t => {
      return {
        '_id': t['_id'],
        name: t.name,
        sum: t.sum,
        date: t.date,
        type: t.type,
        wallet: !t.wallet ? null : {
          '_id': t.wallet['_id'],
          name: t.wallet.name,
          type: t.wallet.type,
          currency: t.wallet.currency
        },
        category: !t.category ? null : {
          '_id': t.category['_id'],
          name: t.category.name,
          color: t.category.color,
        },
        additional: !t.additional ? null : {
          fromWallet: wallets.find(w => w.id === t.additional.fromWalletId),
          toWallet: wallets.find(w => w.id === t.additional.toWalletId),
          fromSum: t.additional.fromSum,
          commission: t.additional.commission,
          toSum: t.additional.toSum
        }
      };
    }).reverse();
  }

  @Get('statistic')
  async getStatistic(@Request() req, @Query() query: QueryStatisticDto) {
    return this.transactionService.getStatistic(
      req.user.id,
      query
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Get('update/dates')
  async updateDates() {
    return this.transactionService.updateAllDates();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const transaction = await this.transactionService.findOne(id);
    switch (transaction.type) {
      case TransactionType.EXPENSE:
        await this.walletService.update(transaction.wallet['_id'], {
          balance: transaction.wallet.balance + transaction.sum
        });
        break;
      case TransactionType.INCOME:
        await this.walletService.update(transaction.wallet['_id'], {
          balance: transaction.wallet.balance - transaction.sum
        });
        break;
      case TransactionType.EXCHANGE:
        const walletFrom = await this.walletService.findOne(transaction.additional.fromWalletId);
        const walletTo = await this.walletService.findOne(transaction.additional.toWalletId);

        await this.walletService.update(transaction.additional.fromWalletId, {
          balance: walletFrom.balance + transaction.additional.fromSum
        });

        await this.walletService.update(transaction.additional.toWalletId, {
          balance: walletTo.balance - transaction.additional.toSum
        });

        break;
    }

    return this.transactionService.remove(id);
  }
}
