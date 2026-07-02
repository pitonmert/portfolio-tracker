export interface MarketPriceQuote {
  symbol: string;
  companyName?: string | null;
  currentPrice?: number | null;
  dayHigh?: number | null;
  dayLow?: number | null;
  marketCap?: number | null;
  fetchedAt?: string | null;
  delayMinutes?: number | null;
  isAvailable: boolean;
  isManual: boolean;
  isRefreshing: boolean;
  manualUpdatedAt?: string | null;
  error?: string | null;
}
