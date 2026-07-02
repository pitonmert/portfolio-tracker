import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "@/types/transaction";
import type { PortfolioPosition } from "@/types/portfolio";
import type { MarketPriceQuote } from "@/types/marketPrice";
import { TransactionCard } from "./transactions/TransactionCard";
import { transactionService } from "@/services/transactionService";
import { queryKeys } from "@/services/queryKeys";
import { ModalShell } from "@/components/ui/ModalShell";
import TransactionFormModal from "./transactions/TransactionFormModal";
import { useToast } from "@/context/ToastContext";
import { XIcon } from "@/components/ui/icons";
import { uiStyles } from "@/components/ui/styles";
import { PositionCard } from "./PositionCard";

interface PositionHistoryModalProps {
  symbol: string;
  position: PortfolioPosition;
  marketPrice?: MarketPriceQuote | null;
  marketPriceLoading: boolean;
  onMarketPriceChanged: () => void;
  onClose: () => void;
  onChanged: () => void;
}

const styles = {
  backdrop:
    "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden overscroll-contain bg-[var(--backdrop)] p-3 backdrop-blur",
  modal:
    "flex h-full max-h-full w-[642px] max-w-full flex-col min-h-0 min-w-0 overflow-hidden rounded-2xl border border-[color:var(--line-soft)] bg-[var(--bg)] text-[var(--ink)] shadow-xl",

  headerRow:
    "flex min-w-0 shrink-0 flex-col gap-3 px-5 pt-5 pb-1 max-[640px]:px-4 max-[640px]:pt-4",
  headerTop: "flex min-w-0 items-center justify-between gap-3",
  title:
    "pl-2 truncate font-[family-name:var(--font-display)] text-xl font-bold leading-snug text-[var(--ink)]",
  closeBtn:
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[var(--bg)] text-[var(--ink-2)] transition-colors hover:border-[color:var(--accent)] hover:text-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",

  body: "app-scrollbar flex-1 min-h-0 overflow-auto overscroll-none px-5 py-3 max-[640px]:px-4",
  list: "flex flex-col gap-3",
};

// Shared loading, error, and empty states.
function LoadingState() {
  return (
    <div className={uiStyles.loadingBox} role="status" aria-live="polite">
      <span className={uiStyles.spinner} /> yükleniyor...
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className={uiStyles.errorBox} role="alert" aria-live="assertive">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className={uiStyles.emptyBox}>{message}</div>;
}

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? error.message : "Bir hata oluştu";
}

// Modal content state and table rendering.
interface ModalContentProps {
  loading: boolean;
  error: string | null;
  rows: Transaction[];
  onEdit: (transaction: Transaction) => void;
  listRef: RefObject<HTMLDivElement | null>;
}

function ModalContent({
  loading,
  error,
  rows,
  onEdit,
  listRef,
}: ModalContentProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (rows.length === 0) return <EmptyState message="İşlem bulunamadı" />;

  return (
    <div ref={listRef} className={styles.list}>
      {rows.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onClick={() => onEdit(transaction)}
          hideSymbol={true}
        />
      ))}
    </div>
  );
}

export default function PositionHistoryModal({
  symbol,
  position,
  marketPrice,
  marketPriceLoading,
  onMarketPriceChanged,
  onClose,
  onChanged,
}: PositionHistoryModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [editing, setEditing] = useState<Transaction | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    data: transactions,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.transactions.bySymbol(symbol),
    queryFn: () => transactionService.getAll({ symbol }),
  });
  const error = getErrorMessage(queryError);

  useEffect(() => {
    if (!loading) {
      setShowModal(true);
      return;
    }
    const timer = setTimeout(() => setShowModal(true), 150);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleChanged = () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.transactions.bySymbol(symbol),
    });
    onChanged();
  };

  const handleDelete = async (transaction: Transaction) => {
    try {
      await transactionService.delete(transaction.id);
      showToast("İşlem silindi");
      setEditing(undefined);
      handleChanged();
    } catch {
      showToast("Silme başarısız", "error");
    }
  };

  const rows = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort(
      (left, right) =>
        new Date(right.transactionDate).getTime() -
        new Date(left.transactionDate).getTime(),
    );
  }, [transactions]);

  return (
    <ModalShell
      backdropClassName={styles.backdrop}
      closeOnBackdrop={false}
      onClose={onClose}
    >
      {showModal && (
        <section
          className={styles.modal}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.headerRow}>
            <div className={styles.headerTop}>
              <h2 className={styles.title}>Özet</h2>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Kapat"
                type="button"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <PositionCard
              position={position}
              marketPrice={marketPrice}
              marketPricesLoading={marketPriceLoading}
              displayMetric="unrealizedPnL"
              onMarketPriceChanged={onMarketPriceChanged}
            />
          </div>

          <div className={styles.body}>
            <ModalContent
              loading={loading}
              error={error}
              rows={rows}
              onEdit={setEditing}
              listRef={listRef}
            />
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
      )}
    </ModalShell>
  );
}
