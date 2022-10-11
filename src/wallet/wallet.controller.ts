import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { UserService } from '../user/user.service';
import { CURRENCY } from './models/currency';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly userService: UserService
  ) {
  }

  @Get('currency')
  getCurrency() {
    return CURRENCY;
  }

  @Post('new')
  async create(@Body() createWalletDto: CreateWalletDto, @Request() req) {
    const user = await this.userService.getUser(req.user.deviceId);

    return this.walletService.create({
      ...createWalletDto,
      user: user
    });
  }

  @Patch('balance/:id')
  async updateBalance(@Body() createWalletDto: CreateWalletDto, @Request() req) {
    const user = await this.userService.getUser(req.user.deviceId);

    return this.walletService.create({
      ...req.body,
      user: user
    });
  }

  @Get('total')
  async totalBalance(@Request() req) {
    const wallets = await this.walletService.findAll(req.user.id);
    const exchangeData = await this.walletService.getExchangeData();

    const euroCode = 978;
    const uahCode = 980;
    let totalEur = 0;

    const eurRates = exchangeData.find(x => x.currencyCodeA === euroCode);

    wallets.forEach(w => {
      if (w.balance === 0) {
        return;
      }

      if (w.currency.isoCode === `${uahCode}`) {
        totalEur += w.balance / eurRates.rateSell;
      } else if (w.currency.isoCode === `${euroCode}`) {
        totalEur += w.balance;
      } else {
        const walletCurrencyRates = exchangeData.find(x => {
          return `${x.currencyCodeA}` === w.currency.isoCode;
        });
        let uahWalletBalance = 0;
        if (walletCurrencyRates.rateBuy) {
          uahWalletBalance = w.balance * walletCurrencyRates.rateBuy;
        } else {
          uahWalletBalance = w.balance * walletCurrencyRates.rateCross;
        }
        totalEur += (uahWalletBalance / eurRates.rateSell);
      }
    });

    return {
      totalEur: totalEur.toFixed(2),
    };
  }

  @Get()
  async findAll(@Request() req) {
    const user = await this.userService.getUser(req.user.deviceId);
    const wallets = await this.walletService.findAll(user.id);
    return wallets.reverse();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletService.findOne(id);
  }

  @Post('update/:id')
  async update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletService.update(id, updateWalletDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.walletService.remove(+id);
  // }
}
