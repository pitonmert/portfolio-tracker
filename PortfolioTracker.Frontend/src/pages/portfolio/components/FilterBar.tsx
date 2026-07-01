import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import {
  CheckIcon,
  FilterIcon,
  ClockIcon,
  PlusIcon,
  SearchIcon,
  SortIcon,
} from "../../../components/ui/icons";

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

interface FilterBarProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filterCounts: FilterCounts;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  count: number;
  search: string;
  onSearchChange: (search: string) => void;
  onViewAllTransactions: () => void;
  onNewTransaction: () => void;
}

const baseButton = [
  "inline-flex h-10 shrink-0 items-center justify-center rounded",
  "border border-[color:var(--line)] bg-[var(--bg)]",
  "font-medium text-[var(--ink)] whitespace-nowrap",
  "transition-colors hover:bg-[var(--bg-2)] select-none",
].join(" ");

const styles = {
  container:
    "w-full shrink-0 flex justify-center px-5 pt-2 max-[760px]:px-4 max-[420px]:px-3",
  toolbar:
    "flex w-full max-w-[640px] min-w-0 items-center justify-between gap-1.5 pb-3",
  controlsRow: "flex min-w-0 shrink-0 items-center gap-1.5",
  filterWrapper: "relative h-10 w-10 shrink-0",
  filterButton: `${baseButton} relative h-full w-full px-0 py-2 text-sm focus:border-[color:var(--accent)] focus:outline-none active:scale-[0.98]`,
  filterButtonOpen:
    "bg-[var(--bg-2)] text-[var(--ink)] shadow-[inset_0_-2px_0_var(--accent)]",
  filterBadge:
    "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]",
  filterMenu:
    "absolute left-0 top-[calc(100%+4px)] z-50 w-max min-w-full overflow-hidden rounded-lg border border-[color:var(--line)] bg-[var(--bg)] shadow-lg",
  filterOption:
    "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] focus:bg-[var(--bg-2)] focus:outline-none select-none",
  filterOptionActive: "bg-[var(--bg-2)] text-[var(--accent)]",
  filterOptionCheck: "shrink-0 text-[var(--accent)]",
  actionButton: `${baseButton} w-10 sm:w-auto gap-2 px-0 sm:px-3.5 py-2 text-sm`,
  allTransactionsButton: `${baseButton} h-10 w-10 gap-2 px-0 py-2 text-sm`,
  newTransactionButton:
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[color:var(--accent)] bg-[var(--bg)] font-medium text-[var(--accent)] whitespace-nowrap transition-colors hover:bg-[var(--bg-2)] focus:outline-none gap-2 px-0 py-2 text-sm sm:w-auto sm:px-3.5 select-none",
  sortWrapper: "relative h-10 w-10 shrink-0 sm:min-w-[164px] sm:flex-1",
  sortButton: `${baseButton} h-full w-full gap-2 px-0 py-2 text-sm focus:border-[color:var(--accent)] focus:outline-none sm:justify-start sm:px-3.5`,
  sortButtonOpen:
    "bg-[var(--bg-2)] text-[var(--ink)] shadow-[inset_0_-2px_0_var(--accent)]",
  sortButtonLabel: "hidden min-w-0 truncate sm:block",
  sortMenu:
    "absolute left-0 top-[calc(100%+4px)] z-50 w-max min-w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-[color:var(--line)] bg-[var(--bg)] shadow-lg",
  sortOption:
    "flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] focus:bg-[var(--bg-2)] focus:outline-none select-none",
  sortOptionActive: "bg-[var(--bg-2)] text-[var(--accent)]",
  sortOptionCheck: "shrink-0 text-[var(--accent)]",
  sortIcon: "h-5 w-5 shrink-0",
  searchWrapper:
    "flex h-10 min-w-[72px] flex-1 shrink items-center rounded border border-[color:var(--line)] bg-[var(--bg)] transition-colors focus-within:border-[color:var(--accent)]",
  searchInput:
    "h-full w-full min-w-0 flex-1 bg-transparent pl-2 pr-1 py-2 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] placeholder:select-none",
  searchIcon:
    "pointer-events-none flex shrink-0 items-center gap-1 pr-3 text-[var(--ink-3)] select-none",
  searchBadge:
    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--bg-2)] px-1.5 text-[11px] font-bold tabular-nums text-[var(--ink-2)] select-none",
};

interface FilterMenuProps {
  filter: FilterType;
  filterCounts: FilterCounts;
  onChange: (filter: FilterType) => void;
}

function FilterMenu({ filter, filterCounts, onChange }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasActiveFilter = filter !== "open";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (value: FilterType) => {
    onChange(value);
    setOpen(false);
  };

  return (
    <div className={styles.filterWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.filterButton} ${
          open ? styles.filterButtonOpen : ""
        }`}
        aria-label="Filtre"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <FilterIcon className="h-5 w-5 shrink-0" />
        {hasActiveFilter && <span className={styles.filterBadge} />}
      </button>

      {open && (
        <div className={styles.filterMenu} role="listbox" aria-label="Filtre">
          {filterOptions.map((option) => {
            const active = option.value === filter;

            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.filterOption} ${
                  active ? styles.filterOptionActive : ""
                }`}
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(option.value)}
              >
                <span className="truncate">
                  {option.label} ({filterCounts[option.value]})
                </span>
                {active && (
                  <span className={styles.filterOptionCheck} aria-hidden="true">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  count: number;
}

function SearchInput({ value, onChange, count }: SearchInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  return (
    <div className={styles.searchWrapper}>
      <input
        className={styles.searchInput}
        id="search"
        name="search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="Ara"
        aria-label="Ara"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.searchIcon}>
        <span className={styles.searchBadge}>{count} sonuç</span>
        <SearchIcon className="h-5 w-5" />
      </div>
    </div>
  );
}

interface SortMenuProps {
  sort: SortType;
  onChange: (sort: SortType) => void;
}

function SortMenu({ sort, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const activeOption =
    sortOptions.find((option) => option.value === sort) ?? sortOptions[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (value: SortType) => {
    onChange(value);
    setOpen(false);
  };

  return (
    <div className={styles.sortWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.sortButton} ${open ? styles.sortButtonOpen : ""}`}
        aria-label="Sıralama"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <SortIcon className={styles.sortIcon} />
        <span className={styles.sortButtonLabel}>{activeOption.label}</span>
      </button>

      {open && (
        <div className={styles.sortMenu} role="listbox" aria-label="Sıralama">
          {sortOptions.map((option, index) => {
            const active = option.value === sort;
            const showDivider = [1, 5, 7].includes(index);

            return (
              <div key={option.value}>
                <button
                  type="button"
                  className={`${styles.sortOption} ${
                    active ? styles.sortOptionActive : ""
                  }`}
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="truncate">{option.label}</span>
                  {active && (
                    <span className={styles.sortOptionCheck} aria-hidden="true">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                  )}
                </button>
                {showDivider && (
                  <div className="mx-2 my-0.5 border-b border-[color:var(--line-soft)]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  labelClassName?: string;
}

function ActionButton({
  icon,
  label,
  onClick,
  className = styles.actionButton,
  labelClassName = "hidden sm:inline",
}: ActionButtonProps) {
  return (
    <button
      className={className}
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      {icon}
      <span className={labelClassName}>{label}</span>
    </button>
  );
}

export function FilterBar({
  filter,
  onFilterChange,
  filterCounts,
  sort,
  onSortChange,
  count,
  search,
  onSearchChange,
  onViewAllTransactions,
  onNewTransaction,
}: FilterBarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.controlsRow}>
          <ActionButton
            icon={<ClockIcon className="h-5 w-5 shrink-0" />}
            label="İşlem Geçmişi"
            onClick={onViewAllTransactions}
            className={styles.allTransactionsButton}
            labelClassName="hidden"
          />

          <FilterMenu
            filter={filter}
            filterCounts={filterCounts}
            onChange={onFilterChange}
          />

          <SortMenu sort={sort} onChange={onSortChange} />
        </div>

        <SearchInput value={search} onChange={onSearchChange} count={count} />

        <ActionButton
          icon={<PlusIcon className="h-5 w-5 shrink-0" />}
          label="Yeni İşlem"
          onClick={onNewTransaction}
          className={styles.newTransactionButton}
        />
      </div>
    </div>
  );
}
