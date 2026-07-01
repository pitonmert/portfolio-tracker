# borsapy Asset Data Probe Results

- Generated at: `2026-06-23T08:09:37.556796+00:00`
- borsapy version: `0.10.1`
- Reference: `market-data-service/user-guide.md`

## Overview

| Probe | Status | Shape / Count | Columns / Keys |
|---|---:|---:|---|
| `companies` | ok | 777 x 3 | `ticker`, `name`, `city` |
| `search_companies_banka` | ok | 38 x 3 | `ticker`, `name`, `city` |
| `screen_stocks_default` | ok | 587 x 3 | `symbol`, `name`, `criteria_7` |
| `search_funds_banka_limit_10` | ok | 10 | `fund_code`, `fund_type`, `name`, `return_1y` |
| `screen_funds_YAT_limit_5000` | ok | 2136 x 10 | `fund_code`, `name`, `fund_type`, `return_1m`, `return_3m`, `return_6m`, `return_ytd`, `return_1y`, `return_3y`, `return_5y` |
| `screen_funds_EMK_limit_5000` | ok | 399 x 10 | `fund_code`, `name`, `fund_type`, `return_1m`, `return_3m`, `return_6m`, `return_ytd`, `return_1y`, `return_3y`, `return_5y` |
| `ticker_THYAO_fast_info` | ok | - | `currency`, `exchange`, `timezone`, `last_price`, `open`, `day_high`, `day_low`, `previous_close`, `volume`, `amount`, `market_cap`, `shares`, `pe_ratio`, `pb_ratio`, `year_high`, `year_low`, `fifty_day_average`, `two_hundred_day_average`, `free_float`, `foreign_ratio` |
| `ticker_THYAO_info` | ok | - | `symbol`, `exchange`, `last`, `change`, `change_percent`, `open`, `high`, `low`, `prev_close`, `volume`, `bid`, `ask`, `bid_size`, `ask_size`, `timestamp`, `description`, `currency`, `timezone`, `sector`, `industry`, `website`, `marketCap`, `sharesOutstanding`, `trailingPE`, `priceToBook`, `enterpriseToEbitda`, `netDebt`, `floatShares`, `foreignRatio`, `fiftyTwoWeekHigh`, `fiftyTwoWeekLow`, `fiftyDayAverage`, `twoHundredDayAverage`, `longBusinessSummary`, `dividendYield`, `exDividendDate`, `trailingAnnualDividendRate`, `trailingAnnualDividendYield` |
| `fund_KPA_info` | ok | - | `fund_code`, `name`, `date`, `price`, `fund_size`, `investor_count`, `founder`, `manager`, `fund_type`, `fund_class`, `category`, `risk_value`, `return_1m`, `return_3m`, `return_6m`, `return_ytd`, `return_1y`, `return_3y`, `return_5y`, `daily_return`, `weekly_return`, `category_rank`, `category_fund_count`, `market_share`, `isin`, `last_trading_time`, `first_trading_time`, `min_purchase`, `min_redemption`, `max_purchase`, `max_redemption`, `buy_valor`, `sell_valor`, `entry_fee`, `exit_fee`, `kap_link`, `tefas_status`, `allocation` |
| `fund_AAK_info_error_example` | error | - |  |

## Details

### companies

- Status: `ok`
- Kind: `dataframe`
- Type: `dataframe`
- Shape / Count: 777 x 3
- Columns: `ticker`, `name`, `city`

Sample:

```json
[
  {
    "ticker": "ACSEL",
    "name": "ACISELSAN ACIPAYAM SELÜLOZ SANAYİ VE TİCARET A.Ş.",
    "city": "DENİZLİ"
  },
  {
    "ticker": "ADEL",
    "name": "ADEL KALEMCİLİK TİCARET VE SANAYİ A.Ş.",
    "city": "KOCAELİ"
  },
  {
    "ticker": "ADESE",
    "name": "ADESE GAYRİMENKUL YATIRIM A.Ş.",
    "city": "KONYA"
  }
]
```

### search_companies_banka

- Status: `ok`
- Kind: `dataframe`
- Type: `dataframe`
- Shape / Count: 38 x 3
- Columns: `ticker`, `name`, `city`

Sample:

```json
[
  {
    "ticker": "AFB",
    "name": "AKTİF YATIRIM BANKASI A.Ş.",
    "city": "İSTANBUL"
  },
  {
    "ticker": "AKTIF",
    "name": "AKTİF YATIRIM BANKASI A.Ş.",
    "city": "İSTANBUL"
  },
  {
    "ticker": "ALBRK",
    "name": "ALBARAKA TÜRK KATILIM BANKASI A.Ş.",
    "city": "İSTANBUL"
  }
]
```

### screen_stocks_default

- Status: `ok`
- Kind: `dataframe`
- Type: `dataframe`
- Shape / Count: 587 x 3
- Columns: `symbol`, `name`, `criteria_7`

Sample:

```json
[
  {
    "symbol": "A1CAP",
    "name": "A1 Capital",
    "criteria_7": 10.57
  },
  {
    "symbol": "A1YEN",
    "name": "Kartal Yenilenebili Enerji",
    "criteria_7": 3.19
  },
  {
    "symbol": "ACSEL",
    "name": "Acıselsan Acıpayam Selüloz",
    "criteria_7": 143.8
  }
]
```

### search_funds_banka_limit_10

- Status: `ok`
- Kind: `list`
- Type: `list`
- Shape / Count: 10
- Keys: `fund_code`, `fund_type`, `name`, `return_1y`

Sample:

```json
[
  {
    "fund_code": "AVJ",
    "name": "AGESA EMEKLİLİK VE HAYAT A.Ş. INITIAL PARTICIPATION PENSION MUTUAL FUND",
    "fund_type": "",
    "return_1y": null
  },
  {
    "fund_code": "VVZ",
    "name": "AGESA HAYAT VE EMEKLİLİK A.Ş. AES AGGRESSIVE PARTICIPATION VARIABLE PENSION MUTUAL FUND",
    "fund_type": "",
    "return_1y": null
  },
  {
    "fund_code": "VVA",
    "name": "AGESA HAYAT VE EMEKLİLİK A.Ş. AES AGGRESSIVE VARIABLE PENSION MUTUAL FUND",
    "fund_type": "",
    "return_1y": null
  }
]
```

### screen_funds_YAT_limit_5000

- Status: `ok`
- Kind: `dataframe`
- Type: `dataframe`
- Shape / Count: 2136 x 10
- Columns: `fund_code`, `name`, `fund_type`, `return_1m`, `return_3m`, `return_6m`, `return_ytd`, `return_1y`, `return_3y`, `return_5y`

Sample:

```json
[
  {
    "fund_code": "NMG",
    "name": "NEO PORTFÖY İKİNCİ SERBEST FON",
    "fund_type": "Serbest Şemsiye Fonu",
    "return_1m": 2.7921,
    "return_3m": 9.7418,
    "return_6m": 20.0789,
    "return_ytd": 18.9186,
    "return_1y": 11611.1377,
    "return_3y": null,
    "return_5y": null
  },
  {
    "fund_code": "PHN",
    "name": "PUSULA PORTFÖY İKİNCİ HİSSE SENEDİ SERBEST FON (HİSSE SENEDİ YOĞUN FON)",
    "fund_type": "Serbest Şemsiye Fonu",
    "return_1m": 137.6283,
    "return_3m": 257.2879,
    "return_6m": 3142.5196,
    "return_ytd": 2530.0682,
    "return_1y": 10401.4257,
    "return_3y": null,
    "return_5y": null
  },
  {
    "fund_code": "PKZ",
    "name": "PUSULA PORTFÖY KUZEY HİSSE SENEDİ SERBEST (TL) FON (HİSSE SENEDİ YOĞUN FON)",
    "fund_type": "Serbest Şemsiye Fonu",
    "return_1m": 62.0677,
    "return_3m": 224.6296,
    "return_6m": 2552.1029,
    "return_ytd": 1901.494,
    "return_1y": 7363.9767,
    "return_3y": null,
    "return_5y": null
  }
]
```

### screen_funds_EMK_limit_5000

- Status: `ok`
- Kind: `dataframe`
- Type: `dataframe`
- Shape / Count: 399 x 10
- Columns: `fund_code`, `name`, `fund_type`, `return_1m`, `return_3m`, `return_6m`, `return_ytd`, `return_1y`, `return_3y`, `return_5y`

Sample:

```json
[
  {
    "fund_code": "BZY",
    "name": "BNP PARİBAS CARDİF EMEKLİLİK A.Ş. TEKNOLOJİ SEKTÖRÜ DEĞİŞKEN EMEKLİLİK YATIRIM FONU",
    "fund_type": "Değişken Fon",
    "return_1m": 11.4939,
    "return_3m": 42.3167,
    "return_6m": 58.5641,
    "return_ytd": 58.2233,
    "return_1y": 97.4912,
    "return_3y": 387.7958,
    "return_5y": null
  },
  {
    "fund_code": "GMF",
    "name": "ANADOLU HAYAT EMEKLİLİK A.Ş. GÜMÜŞ FON SEPETİ EMEKLİLİK YATIRIM FONU",
    "fund_type": "Fon Sepeti Fonu",
    "return_1m": -9.8689,
    "return_3m": -7.9615,
    "return_6m": 1.8804,
    "return_ytd": -4.7286,
    "return_1y": 97.185,
    "return_3y": null,
    "return_5y": null
  },
  {
    "fund_code": "FFC",
    "name": "HDI FİBA EMEKLİLİK VE HAYAT A.Ş. TEKNOLOJİ SEKTÖRÜ DEĞİŞKEN EMEKLİLİK YATIRIM FONU",
    "fund_type": "Değişken Fon",
    "return_1m": 5.1487,
    "return_3m": 32.0518,
    "return_6m": 42.764,
    "return_ytd": 41.0804,
    "return_1y": 89.3812,
    "return_3y": 458.7062,
    "return_5y": null
  }
]
```

### ticker_THYAO_fast_info

- Status: `ok`
- Kind: `mapping-like`
- Type: `FastInfo`
- Shape / Count: -
- Keys: `currency`, `exchange`, `timezone`, `last_price`, `open`, `day_high`, `day_low`, `previous_close`, `volume`, `amount`, `market_cap`, `shares`, `pe_ratio`, `pb_ratio`, `year_high`, `year_low`, `fifty_day_average`, `two_hundred_day_average`, `free_float`, `foreign_ratio`

Sample:

```json
{
  "currency": "TRY",
  "exchange": "BIST",
  "timezone": "Europe/Istanbul",
  "last_price": 321.75,
  "open": 323.5,
  "day_high": 324.0,
  "day_low": 321.5,
  "previous_close": null,
  "volume": 4720082.0,
  "amount": null,
  "market_cap": 448155000000,
  "shares": 1392867132,
  "pe_ratio": 3.2,
  "pb_ratio": 0.5,
  "year_high": 352.5,
  "year_low": 249.2,
  "fifty_day_average": 309.55,
  "two_hundred_day_average": 299.45,
  "free_float": 50.2,
  "foreign_ratio": 22.95
}
```

### ticker_THYAO_info

- Status: `ok`
- Kind: `mapping-like`
- Type: `EnrichedInfo`
- Shape / Count: -
- Keys: `symbol`, `exchange`, `last`, `change`, `change_percent`, `open`, `high`, `low`, `prev_close`, `volume`, `bid`, `ask`, `bid_size`, `ask_size`, `timestamp`, `description`, `currency`, `timezone`, `sector`, `industry`, `website`, `marketCap`, `sharesOutstanding`, `trailingPE`, `priceToBook`, `enterpriseToEbitda`, `netDebt`, `floatShares`, `foreignRatio`, `fiftyTwoWeekHigh`, `fiftyTwoWeekLow`, `fiftyDayAverage`, `twoHundredDayAverage`, `longBusinessSummary`, `dividendYield`, `exDividendDate`, `trailingAnnualDividendRate`, `trailingAnnualDividendYield`

Sample:

```json
{
  "symbol": "THYAO",
  "exchange": "BIST",
  "last": 322.25,
  "change": -2.5,
  "change_percent": -0.77,
  "open": 323.5,
  "high": 324.0,
  "low": 321.5,
  "prev_close": 324.75,
  "volume": 4801379.0,
  "bid": 322.0,
  "ask": 322.25,
  "bid_size": 102378.0,
  "ask_size": 124938.0,
  "timestamp": 1782201267,
  "description": "Turk Hava Yollari A.O.",
  "currency": "TRY",
  "timezone": "Europe/Istanbul",
  "sector": "ULAŞTIRMA VE DEPOLAMA",
  "industry": "ULAŞTIRMA VE DEPOLAMA",
  "website": "www.turkishairlines.com / http://investor.turkishairlines.com",
  "marketCap": 448155000000,
  "sharesOutstanding": 1390705973,
  "trailingPE": 3.2,
  "priceToBook": 0.5
}
```

### fund_KPA_info

- Status: `ok`
- Kind: `mapping`
- Type: `dict`
- Shape / Count: -
- Keys: `fund_code`, `name`, `date`, `price`, `fund_size`, `investor_count`, `founder`, `manager`, `fund_type`, `fund_class`, `category`, `risk_value`, `return_1m`, `return_3m`, `return_6m`, `return_ytd`, `return_1y`, `return_3y`, `return_5y`, `daily_return`, `weekly_return`, `category_rank`, `category_fund_count`, `market_share`, `isin`, `last_trading_time`, `first_trading_time`, `min_purchase`, `min_redemption`, `max_purchase`, `max_redemption`, `buy_valor`, `sell_valor`, `entry_fee`, `exit_fee`, `kap_link`, `tefas_status`, `allocation`

Sample:

```json
{
  "fund_code": "KPA",
  "name": "KUVEYT TÜRK PORTFÖY KAR PAYI ÖDEYEN KATILIM HİSSE SENEDİ FONU (HİSSE SENEDİ YOĞUN FON)",
  "date": "",
  "price": 1.66489,
  "fund_size": 422146181.09,
  "investor_count": 13185,
  "founder": "",
  "manager": "",
  "fund_type": "Hisse Senedi Şemsiye Fonu",
  "fund_class": "YAT",
  "category": "Hisse Senedi Fonu",
  "risk_value": 6,
  "return_1m": 7.8624,
  "return_3m": 17.4824,
  "return_6m": 39.417,
  "return_ytd": 36.8777,
  "return_1y": 56.4315,
  "return_3y": null,
  "return_5y": null,
  "daily_return": 0.0369,
  "weekly_return": null,
  "category_rank": 70,
  "category_fund_count": 191,
  "market_share": 0.17,
  "isin": "TRYKTPY00509"
}
```

### fund_AAK_info_error_example

- Status: `error`
- Error type: `DataNotAvailableError`
- Error: No data for fund: AAK

## Errors

- `fund_AAK_info_error_example`: `DataNotAvailableError` - No data for fund: AAK
