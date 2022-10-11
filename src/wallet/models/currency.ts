export class Currency {
  name: string;
  symbol: string;
  code: string;
  isoCode: string;
}

export const CURRENCY: Currency[] = [
  {
    name: 'Euro',
    symbol: '€',
    code: 'EUR',
    isoCode: '978'
  },
  {
    name: 'US Dollar',
    symbol: '$',
    code: 'USD',
    isoCode: '840'
  },
  {
    name: 'Hryvnia',
    symbol: '₴',
    code: 'UAH',
    isoCode: '980'
  },
  {
    name: 'Pound Sterling',
    symbol: '£',
    code: 'GBP',
    isoCode: '826'
  },
];

// {
//   "currencyCodeA": 840,
//   "currencyCodeB": 980,
//   "date": 1664831409,
//   "rateBuy": 36.65,
//   "rateSell": 37.9507
// },
