export interface AssetSearchResult {
  id?: number | null;
  symbol: string;
  name?: string | null;
  assetType: "stock" | "fund" | "custom";
  market: string;
  currency: string;
  providerSymbol: string;
  source: string;
  fundType?: string | null;
  rawType?: string | null;
  isCustom: boolean;
  isOpenPosition: boolean;
  lastUsedAt?: string | null;
}
