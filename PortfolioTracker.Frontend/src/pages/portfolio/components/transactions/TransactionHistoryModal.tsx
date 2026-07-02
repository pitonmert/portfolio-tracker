import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transactionService";
import { queryKeys } from "@/services/queryKeys";
import { TransactionCard } from "./TransactionCard";
import { useToast } from "@/context/ToastContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Transaction } from "@/types/transaction";
import TransactionFormModal from "./TransactionFormModal";
import { ModalShell } from "@/components/ui/ModalShell";
import { FilterIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import { uiStyles } from "@/components/ui/styles";

export type TransactionFilter = "all" | "Buy" | "Sell";

export const transactionFilterOptions = [
  { value: "all", label: "Tümü" },
  { value: "Buy", label: "Alış" },
  { value: "Sell", label: "Satış" },
] satisfies Array<{ value: TransactionFilter; label: string }>;

interface TransactionHistoryModalProps {
  onClose: () => void;
  onChanged: () => void;
}

const styles = {
  backdrop:
    "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden overscroll-contain bg-[var(--backdrop)] p-4 backdrop-blur max-[420px]:p-3",
  modal:
    "flex h-full max-h-full w-[800px] max-w-full flex-col min-h-0 min-w-0 overflow-hidden rounded-2xl border border-[color:var(--line-soft)] bg-[var(--page-bg)] text-[var(--ink)] shadow-xl",
  body: "flex min-h-0 flex-1 overflow-hidden",

  listScrollContainer:
    "app-scrollbar flex-1 w-full min-h-0 overflow-auto overscroll-none",
  listCenterContainer:
    "w-full flex justify-center px-5 max-[760px]:px-4 max-[420px]:px-3 pt-5 max-[640px]:pt-4",
  listInnerContainer: "w-full max-w-[640px] min-w-0 pb-3",
  list: "flex flex-col gap-3",

  header:
    "shrink-0 border-b border-[color:var(--line-soft)] bg-[var(--bg)] p-4 sm:p-5",
  container: "flex flex-col gap-3 sm:gap-4",
  topRow: "flex items-center justify-between gap-3",
  title:
    "m-0 min-w-0 truncate font-[family-name:var(--font-display)] text-xl font-bold leading-snug sm:text-2xl",
  closeBtn:
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[color:var(--line)] bg-[var(--bg)] text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] focus:border-[color:var(--accent)] focus:outline-none sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium",
  bottomRow: "flex w-full items-center gap-2 sm:gap-3",
  filterBtn:
    "inline-flex w-[120px] h-9 shrink-0 items-center justify-between gap-1 rounded border border-[color:var(--line)] bg-[var(--bg)] px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] focus:border-[color:var(--accent)] focus:outline-none active:scale-[0.98]",
  filterIcon: "h-3.5 w-3.5 shrink-0 text-[var(--ink-3)]",
  searchContainer: "relative flex-1 min-w-0",
  searchInput:
    "h-9 w-full rounded border border-[color:var(--line)] bg-[var(--bg)] pl-3 pr-8 py-1.5 text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-3)] focus:border-[color:var(--accent)]",
  searchIcon:
    "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[var(--ink-3)]",
};

function LoadingState() {
  return (
    <div
      className={`mt-4 ${uiStyles.loadingBox}`}
      role="status"
      aria-live="polite"
    >
      <span className={uiStyles.spinner} /> yükleniyor...
    </div>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <div
      className={`mt-4 ${uiStyles.errorBox}`}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return <div className={`mt-4 ${uiStyles.emptyBox}`}>{message}</div>;
}

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? error.message : "Bir hata oluştu";
}

interface ModalContentProps {
  loading: boolean;
  error: string | null;
  rows: Transaction[];
  onEdit: (tx: Transaction) => void;
}

function ModalContent({ loading, error, rows, onEdit }: ModalContentProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (rows.length === 0) return <EmptyState message="İşlem bulunamadı" />;

  return (
    <div className={styles.list}>
      {rows.map((tx) => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          onClick={() => onEdit(tx)}
        />
      ))}
    </div>
  );
}

export default function TransactionHistoryModal({
  onClose,
  onChanged,
}: TransactionHistoryModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Transaction | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search, 300);
  const listRef = useRef<HTMLDivElement>(null);

  const transactionQuery = {
    type: filter === "all" ? undefined : filter,
    search: debouncedSearch,
  };
  const {
    data: transactions,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.transactions.history(transactionQuery),
    queryFn: () => transactionService.getAll(transactionQuery),
  });
  const error = getErrorMessage(queryError);

  const handleChanged = () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.transactions.all,
    });
    onChanged();
  };

  const handleDelete = async (tx: Transaction) => {
    try {
      await transactionService.delete(tx.id);
      showToast("İşlem silindi");
      setEditing(undefined);
      handleChanged();
    } catch {
      showToast("Silme başarısız", "error");
      throw new Error("Delete failed");
    }
  };

  const handleFilterToggle = () => {
    const currentIndex = transactionFilterOptions.findIndex(
      (f) => f.value === filter,
    );
    const nextIndex = (currentIndex + 1) % transactionFilterOptions.length;
    setFilter(transactionFilterOptions[nextIndex].value);
  };

  const rows = transactions ?? [];
  const hasRows = rows.length > 0;
  const count = rows.length;

  const activeFilterLabel =
    transactionFilterOptions.find((f) => f.value === filter)?.label ??
    transactionFilterOptions[0]?.label;

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [filter, error, hasRows, loading, search]);

  return (
    <ModalShell backdropClassName={styles.backdrop} onClose={onClose}>
      <section
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.container}>
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
                  onChange={(event) => setSearch(event.target.value)}
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

        <div className={styles.body}>
          <div ref={listRef} className={styles.listScrollContainer}>
            <div className={styles.listCenterContainer}>
              <div className={styles.listInnerContainer}>
                <ModalContent
                  loading={loading}
                  error={error}
                  rows={rows}
                  onEdit={(tx) => setEditing(tx)}
                />
              </div>
            </div>
          </div>
        </div>

        {editing !== undefined && (
          <TransactionFormModal
            transaction={editing}
            onSaved={handleChanged}
            onClose={() => setEditing(undefined)}
            onDelete={() => handleDelete(editing)}
          />
        )}
      </section>
    </ModalShell>
  );
}
