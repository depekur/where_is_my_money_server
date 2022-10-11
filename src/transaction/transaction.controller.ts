import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionRequestDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';
import { CategoryService } from '../category/category.service';
import { ExchangeDto } from './dto/exchange.dto';

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
      user: user,
    });

    return {
      ...transaction,
      additional: {
        ...transaction.additional,
        walletFrom: walletFrom,
        walletTo: walletTo
      }
    };
  }

  @Get()
  async findAll(@Request() req) {
    const transactions = await this.transactionService.findAll(req.user.id);
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
          currency: t.wallet.currency,
        },
        category: !t.category ? null :{
          '_id': t.category['_id'],
          name: t.category.name
        },
        additional: !t.additional ? null : {
          fromWallet: wallets.find(w => w.id === t.additional.fromWalletId),
          toWallet: wallets.find(w => w.id === t.additional.toWalletId),
          fromSum: t.additional.fromSum,
          commission: t.additional.commission,
          toSum: t.additional.toSum,
        }
      }
    }).reverse();
  }

  @Get('statistic')
  async getStatistic(@Request() req) {
    return this.transactionService.getStatistic(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
