import { useState, useEffect, useRef } from "react";
import { transactionService } from "../../../../services/transactionService";
import { TransactionCard } from "./TransactionCard";
import { useToast } from "../../../../context/ToastContext";
import { useAsync } from "../../../../hooks/useAsync";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import type { Transaction } from "../../../../types/transaction";
import TransactionFormModal from "./TransactionFormModal";
import { TransactionHistoryNavbar } from "./TransactionHistoryNavbar";
import type { TransactionFilter } from "./TransactionHistoryNavbar";
import { ModalShell } from "../../../../components/ui/ModalShell";

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

  loadingBox:
    "mt-4 rounded bg-[var(--bg-2)] px-4 py-10 text-center text-sm text-[var(--ink-2)]",
  errorBox:
    "mt-4 rounded bg-[var(--bg-2)] px-4 py-10 text-center text-sm text-[var(--expense)]",
  messageBox:
    "mt-4 rounded bg-[var(--bg-2)] px-4 py-12 text-center text-sm text-[var(--ink-2)]",
  spinner:
    "inline-block h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--line-soft)] border-t-[color:var(--ink)]",
};

function LoadingState() {
  return (
    <div className={styles.loadingBox} role="status" aria-live="polite">
      <span className={styles.spinner} /> yükleniyor...
    </div>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className={styles.errorBox} role="alert" aria-live="assertive">
      {message}
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return <div className={styles.messageBox}>{message}</div>;
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
  const { showToast } = useToast();
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Transaction | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search, 300);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = useAsync(
    () =>
      transactionService.getAll({
        type: filter === "all" ? undefined : filter,
        search: debouncedSearch,
      }),
    [filter, debouncedSearch],
  );

  const handleChanged = () => {
    refetch();
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

  const rows = transactions ?? [];
  const hasRows = rows.length > 0;
  const count = rows.length;

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [filter, error, hasRows, loading, search]);

  return (
    <ModalShell backdropClassName={styles.backdrop} onClose={onClose}>
      <section
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <TransactionHistoryNavbar
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          count={count}
          onClose={onClose}
        />

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
