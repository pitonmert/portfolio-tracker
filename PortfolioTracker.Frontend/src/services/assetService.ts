import { api } from "@/api/httpClient";
import type { AssetSearchResult } from "@/types/asset";

interface AssetSearchParams {
  q: string;
  assetType?: "auto" | "stock" | "fund";
  limit?: number;
}

function toQueryString(params: AssetSearchParams) {
  const query = new URLSearchParams();
  query.set("q", params.q.trim());
  if (params.assetType) query.set("assetType", params.assetType);
  if (params.limit) query.set("limit", String(params.limit));

  return `?${query.toString()}`;
}

export const assetService = {
  search: (params: AssetSearchParams) =>
    params.q.trim()
      ? api.get<AssetSearchResult[]>(
          `/api/assets/search${toQueryString(params)}`,
        )
      : Promise.resolve([]),
};
