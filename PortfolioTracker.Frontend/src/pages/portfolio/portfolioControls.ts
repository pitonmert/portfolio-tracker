export type FilterType = "all" | "open" | "closed";
export type FilterCounts = Record<FilterType, number>;
export type SortType =
  | "symbol_asc"
  | "symbol_desc"
  | "invested_desc"
  | "invested_asc"
  | "pnl_desc"
  | "pnl_asc"
  | "quantity_desc"
  | "quantity_asc"
  | "open_first"
  | "closed_first";

export const filterOptions = [
  { value: "all", label: "Tümü" },
  { value: "open", label: "Açık" },
  { value: "closed", label: "Kapalı" },
] satisfies Array<{ value: FilterType; label: string }>;

export const sortOptions = [
  { value: "symbol_asc", label: "A - Z" },
  { value: "symbol_desc", label: "Z - A" },
  { value: "invested_desc", label: "Maliyet (En Yüksek)" },
  { value: "invested_asc", label: "Maliyet (En Düşük)" },
  { value: "pnl_desc", label: "K/Z (En Yüksek)" },
  { value: "pnl_asc", label: "K/Z (En Düşük)" },
  { value: "quantity_desc", label: "Adet (En Yüksek)" },
  { value: "quantity_asc", label: "Adet (En Düşük)" },
  { value: "open_first", label: "Açık Önce" },
  { value: "closed_first", label: "Kapalı Önce" },
] satisfies Array<{ value: SortType; label: string }>;
