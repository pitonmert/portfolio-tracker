import type { Transaction } from "../../../../types/transaction";
import {
  formatDate,
  formatTL,
  formatNumber,
} from "../../../../utils/formatters";

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
  hideSymbol?: boolean;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const styles = {
  cardBase:
    "flex h-[68px] w-full min-w-0 select-none items-center justify-between gap-4 overflow-hidden rounded-xl border border-[color:var(--line)] border-l-4 bg-[var(--bg)] px-4 py-3 text-left shadow transition-all",
  cardInteractive:
    "cursor-pointer hover:border-[color:var(--ink-3)] hover:bg-[var(--bg-2)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",

  leftCol: "flex min-w-0 flex-1 flex-col justify-between self-stretch",
  titleRow: "flex min-w-0 items-baseline gap-1.5",
  symbolBase: "truncate font-mono text-[17px] font-semibold leading-tight",
  symbolDefault: "text-[var(--ink)]",
  typeBadgeBase: "shrink-0 font-sans text-[12px] font-medium leading-none",
  typeDot:
    "shrink-0 font-sans text-[12px] font-medium leading-none text-[var(--ink-3)]",

  infoRow:
    "flex items-center gap-1.5 truncate font-sans text-[12px] font-medium leading-none text-[var(--ink-3)]",
  infoDate: "shrink-0",
  infoDot: "shrink-0",
  infoNote: "truncate",

  rightCol:
    "flex shrink-0 flex-col items-end justify-between self-stretch text-right",
  amountBase: "font-mono text-[17px] font-semibold leading-tight tabular-nums",
  unitPrice:
    "font-mono text-[13px] font-medium leading-tight tabular-nums text-[var(--ink-3)]",

  incomeBorder: "border-l-[color:var(--income)]",
  expenseBorder: "border-l-[color:var(--expense)]",

  incomeText: "text-[var(--income)]",
  expenseText: "text-[var(--expense)]",
};

export function TransactionCard({
  transaction,
  onClick,
  hideSymbol = false,
}: TransactionCardProps) {
  const isSell = transaction.type === "Sell";
  const typeLabel = isSell ? "Satış" : "Alış";
  const typeColorClass = isSell ? styles.incomeText : styles.expenseText;
  const typeBorderClass = isSell ? styles.incomeBorder : styles.expenseBorder;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cx(
        styles.cardBase,
        onClick && styles.cardInteractive,
        typeBorderClass,
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.leftCol}>
        <div className={styles.titleRow}>
          <span
            className={cx(
              styles.symbolBase,
              hideSymbol ? typeColorClass : styles.symbolDefault,
            )}
          >
            {hideSymbol ? typeLabel : transaction.symbol}
          </span>
          {!hideSymbol && (
            <>
              <span className={styles.typeDot}>•</span>
              <span className={cx(styles.typeBadgeBase, typeColorClass)}>
                {typeLabel}
              </span>
            </>
          )}
        </div>

        <div className={styles.infoRow}>
          <span className={styles.infoDate}>
            {formatDate(transaction.transactionDate)}
          </span>
          {transaction.note && (
            <>
              <span className={styles.infoDot}>•</span>
              <span className={styles.infoNote}>{transaction.note}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.rightCol}>
        <span className={cx(styles.amountBase, typeColorClass)}>
          {formatTL(transaction.totalAmount, transaction.type)}
        </span>
        <span className={styles.unitPrice}>
          {formatNumber(transaction.quantity)} × ₺
          {transaction.unitPrice.toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
