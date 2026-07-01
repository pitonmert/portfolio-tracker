import { FilterIcon, SearchIcon, XIcon } from "../../../../components/ui/icons";

export type TransactionFilter = "all" | "Buy" | "Sell";

export const transactionFilterOptions = [
  { value: "all", label: "Tümü" },
  { value: "Buy", label: "Alış" },
  { value: "Sell", label: "Satış" },
] satisfies Array<{ value: TransactionFilter; label: string }>;

interface TransactionHistoryNavbarProps {
  filter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  count: number;
  onClose: () => void;
}

const styles = {
  header:
    "shrink-0 border-b border-[color:var(--line-soft)] bg-[var(--bg)] p-4 sm:p-5",

  // Ana Konteyner (Alt alta iki satır)
  container: "flex flex-col gap-3 sm:gap-4",

  // 1. SATIR (Başlık ve Kapat)
  topRow: "flex items-center justify-between gap-3",
  title:
    "m-0 min-w-0 truncate font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold leading-tight",
  closeBtn:
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[color:var(--line)] bg-[var(--bg)] text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] focus:border-[color:var(--accent)] focus:outline-none sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium",

  // 2. SATIR (Filtre ve Arama)
  bottomRow: "flex w-full items-center gap-2 sm:gap-3",

  // Filtre (Sabit 120px)
  filterBtn:
    "inline-flex w-[120px] h-9 shrink-0 items-center justify-between gap-1 rounded border border-[color:var(--line)] bg-[var(--bg)] px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] focus:border-[color:var(--accent)] focus:outline-none active:scale-[0.98]",
  filterIcon: "h-3.5 w-3.5 shrink-0 text-[var(--ink-3)]",

  // Arama (Kalan tüm alanı doldurur: flex-1)
  searchContainer: "relative flex-1 min-w-0",
  searchInput:
    "h-9 w-full rounded border border-[color:var(--line)] bg-[var(--bg)] pl-3 pr-8 py-1.5 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-3)] focus:border-[color:var(--accent)]",
  searchIcon:
    "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[var(--ink-3)]",
};

export function TransactionHistoryNavbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  count,
  onClose,
}: TransactionHistoryNavbarProps) {
  const handleFilterToggle = () => {
    const currentIndex = transactionFilterOptions.findIndex(
      (f) => f.value === filter,
    );
    const nextIndex = (currentIndex + 1) % transactionFilterOptions.length;
    onFilterChange(transactionFilterOptions[nextIndex].value);
  };

  const activeFilterLabel =
    transactionFilterOptions.find((f) => f.value === filter)?.label ??
    transactionFilterOptions[0]?.label;

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        {/* ---- 1. SATIR ---- */}
        <div className={styles.topRow}>
          <h2 className={styles.title}>İşlem Geçmişi</h2>

          <button
            className={styles.closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Kapat"
          >
            <XIcon className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:inline">Kapat</span>
          </button>
        </div>

        {/* ---- 2. SATIR ---- */}
        <div className={styles.bottomRow}>
          <button
            type="button"
            className={styles.filterBtn}
            onClick={handleFilterToggle}
          >
            <span className="truncate">
              {activeFilterLabel} ({count})
            </span>
            <FilterIcon className={styles.filterIcon} />
          </button>

          <div className={styles.searchContainer}>
            <input
              id="search"
              name="search"
              type="search"
              className={styles.searchInput}
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Ara"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
            />
            <div className={styles.searchIcon}>
              <SearchIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
