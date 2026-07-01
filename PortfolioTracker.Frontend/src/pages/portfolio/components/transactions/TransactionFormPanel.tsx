import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FormEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { transactionService } from "../../../../services/transactionService";
import { useToast } from "../../../../context/ToastContext";
import type {
  Transaction,
  TransactionType,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "../../../../types/transaction";
import { formatCurrency } from "../../../../utils/formatters";
import {
  calculateTransactionTotal,
  isDecimalInput,
  parseDecimalInput,
} from "../../utils/portfolioCalculations";
import ConfirmationModal from "./ConfirmationModal";

type TransactionFormMode = "sidebar" | "modal";
type ConfirmationType = "delete" | "cancel" | "save";
type FieldErrors = Partial<
  Record<"symbol" | "quantity" | "unitPrice" | "date", string>
>;

interface TransactionFormPanelProps {
  mode?: TransactionFormMode;
  transaction?: Transaction;
  closeRequestKey?: number;
  onSaved: () => void;
  onClose?: () => void;
  onDelete?: () => Promise<void> | void;
}

function toLocalDateTimeInput(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 19);
}

function getInitialDate(transaction?: Transaction) {
  return toLocalDateTimeInput(
    transaction ? new Date(transaction.transactionDate) : new Date(),
  );
}

function getInitialFormState(transaction?: Transaction) {
  return {
    type: transaction?.type ?? "Buy",
    symbol: transaction?.symbol ?? "",
    quantity: transaction ? String(transaction.quantity) : "",
    unitPrice: transaction ? String(transaction.unitPrice) : "",
    note: transaction?.note ?? "",
    date: getInitialDate(transaction),
  };
}

const styles = {
  panelBase:
    "relative min-w-0 max-w-full overflow-x-hidden rounded-2xl border border-[color:var(--line)] bg-[var(--bg)] p-3.5 sm:p-4 shadow-xl shadow-[color:var(--line-soft)]/50",
  sidebarPanel:
    "w-full min-w-0 self-start min-[921px]:sticky min-[921px]:top-6 min-[921px]:w-[var(--quickadd-w)] min-[921px]:min-w-[var(--quickadd-w)] max-[920px]:static max-[920px]:self-stretch",
  modalPanel: "w-full max-w-md",

  headerContainer: "mb-3 flex min-w-0 flex-col text-center",
  title:
    "block min-w-0 break-words font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl",
  form: "space-y-3",

  segmentContainer:
    "flex w-full rounded-xl bg-[var(--bg-2)] p-1 ring-1 ring-inset ring-[color:var(--line-soft)]",
  segmentButtonBase:
    "flex-1 rounded-lg py-1.5 text-[15px] font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]",
  segmentButtonActive:
    "bg-[var(--bg)] text-[var(--ink)] shadow-sm ring-1 ring-[color:var(--control-ring)]",
  segmentButtonInactive: "text-[var(--ink-3)] hover:text-[var(--ink-2)]",

  fieldGroup: "space-y-2.5",
  field: "flex w-full min-w-0 flex-col",
  fieldGrid: "grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2",
  label: "mb-1 block text-sm font-medium text-[var(--ink-2)]",

  input:
    "min-w-0 w-full max-w-full block box-border rounded-xl border border-[color:var(--line)] bg-[var(--bg)] px-3.5 py-1.5 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-3)] focus:border-[color:var(--accent)] focus:shadow-[0_0_0_2px_var(--focus-ring)] hover:border-[color:var(--ink-3)]",
  dateTimeInput:
    "appearance-none overflow-hidden text-ellipsis whitespace-nowrap",
  fieldError:
    "mt-1 min-h-4 text-[11px] font-medium leading-4 text-[var(--expense)]",
  fieldErrorHidden: "invisible",

  suggestionsContainer:
    "app-scrollbar absolute left-0 right-0 top-full z-50 mt-1.5 max-h-52 overflow-auto rounded-xl border border-[color:var(--line)] bg-[var(--bg)]/95 py-1.5 shadow-xl shadow-[color:var(--line-soft)] backdrop-blur-xl",
  suggestionButtonBase:
    "w-full break-words px-3.5 py-2.5 text-left text-[15px] transition-colors focus-visible:bg-[var(--bg-2)] focus-visible:outline-none",
  suggestionActive: "bg-[var(--bg-2)] text-[var(--accent)]",
  suggestionInactive: "text-[var(--ink)] hover:bg-[var(--bg-2)]",

  totalContainer:
    "relative mt-1 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg)] p-3 ring-1 ring-inset ring-[color:var(--line)] sm:p-4",
  totalLabel:
    "text-xs font-medium tracking-wide text-[var(--ink-2)] sm:text-[13px]",
  totalValue:
    "mt-0.5 break-words font-[family-name:var(--font-display)] text-[24px] font-bold tracking-tight text-[var(--ink)] sm:text-[28px]",

  actionsContainer:
    "mt-3 flex w-full flex-row items-center justify-end gap-2 sm:gap-3",
  deleteButton:
    "inline-flex flex-1 items-center justify-center rounded-xl px-2 py-2 text-sm font-medium text-[var(--expense)] transition-colors hover:bg-[var(--expense-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--expense)] sm:mr-auto sm:flex-none sm:px-4",
  cancelButton:
    "inline-flex flex-1 items-center justify-center rounded-xl bg-transparent px-2 py-2 text-sm font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)] sm:flex-none sm:px-4",
  saveButton:
    "inline-flex flex-[2] items-center justify-center rounded-xl bg-[var(--accent)] px-2 py-2 text-sm font-semibold text-[var(--on-accent)] shadow-sm transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--accent)] sm:flex-none sm:px-4",

  spinner:
    "inline-block h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--on-accent)]/30 border-t-[color:var(--on-accent)]",
};

export default function TransactionFormPanel({
  mode = "modal",
  transaction,
  closeRequestKey,
  onSaved,
  onClose,
  onDelete,
}: TransactionFormPanelProps) {
  const { showToast } = useToast();
  const editing = transaction !== undefined;
  const assetInputRef = useRef<HTMLInputElement>(null);
  const assetAutocompleteRef = useRef<HTMLDivElement>(null);
  const previousCloseRequestKey = useRef(closeRequestKey);
  const initialFormState = useMemo(
    () => getInitialFormState(transaction),
    [transaction],
  );
  const [type, setType] = useState<TransactionType>(initialFormState.type);
  const [symbol, setSymbol] = useState(initialFormState.symbol);
  const [quantity, setQuantity] = useState(initialFormState.quantity);
  const [unitPrice, setUnitPrice] = useState(initialFormState.unitPrice);
  const [note, setNote] = useState(initialFormState.note);
  const [date, setDate] = useState(initialFormState.date);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationType | null>(
    null,
  );
  const [knownSymbols, setKnownSymbols] = useState<string[]>([]);
  const [assetSuggestionsOpen, setAssetSuggestionsOpen] = useState(false);
  const [selectedAssetSuggestionIndex, setSelectedAssetSuggestionIndex] =
    useState(0);
  const quantityValue = parseDecimalInput(quantity);
  const unitPriceValue = parseDecimalInput(unitPrice);
  const totalAmount = calculateTransactionTotal(quantityValue, unitPriceValue);
  const symbolQuery = symbol.trim();
  const title = editing ? "İşlemi Düzenle" : "Yeni İşlem";
  const hasChanges =
    type !== initialFormState.type ||
    symbol !== initialFormState.symbol ||
    quantity !== initialFormState.quantity ||
    unitPrice !== initialFormState.unitPrice ||
    note !== initialFormState.note ||
    date !== initialFormState.date;
  const createHasInput =
    !editing &&
    (symbol.trim() !== "" ||
      quantity.trim() !== "" ||
      unitPrice.trim() !== "" ||
      note.trim() !== "" ||
      type !== initialFormState.type ||
      date !== initialFormState.date);
  const saveDisabled = saving || (editing && !hasChanges);

  const assetSuggestions = useMemo(() => {
    if (!symbolQuery) return [];

    const normalizedQuery = symbolQuery.toLocaleLowerCase("tr-TR");
    return knownSymbols
      .filter((name) =>
        name.toLocaleLowerCase("tr-TR").startsWith(normalizedQuery),
      )
      .filter((name) => name !== symbolQuery)
      .slice(0, 6);
  }, [symbolQuery, knownSymbols]);

  const showAssetSuggestions =
    assetSuggestionsOpen && assetSuggestions.length > 0;

  useEffect(() => {
    setSelectedAssetSuggestionIndex(0);
    setAssetSuggestionsOpen(assetSuggestions.length > 0);
  }, [assetSuggestions]);

  useEffect(() => {
    let cancelled = false;

    transactionService
      .getAll()
      .then((transactions) => {
        if (cancelled) return;

        const names = Array.from(
          new Map(
            transactions
              .map((item) => item.symbol.trim())
              .filter(Boolean)
              .map((name) => [name.toLocaleLowerCase("tr-TR"), name]),
          ).values(),
        ).sort((a, b) => a.localeCompare(b, "tr-TR"));

        setKnownSymbols(names);
      })
      .catch(() => {
        if (!cancelled) setKnownSymbols([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        assetAutocompleteRef.current?.contains(event.target as Node) ||
        document.activeElement !== assetInputRef.current
      ) {
        return;
      }

      setAssetSuggestionsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const selectAssetSuggestion = (name: string) => {
    setSymbol(name);
    setAssetSuggestionsOpen(false);
    setSelectedAssetSuggestionIndex(0);
    window.requestAnimationFrame(() => assetInputRef.current?.focus());
  };

  const handleSymbolKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showAssetSuggestions) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedAssetSuggestionIndex(
        (index) => (index + 1) % assetSuggestions.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedAssetSuggestionIndex(
        (index) =>
          (index - 1 + assetSuggestions.length) % assetSuggestions.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectAssetSuggestion(assetSuggestions[selectedAssetSuggestionIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setAssetSuggestionsOpen(false);
    }
  };

  const handleAssetSuggestionMouseDown = (
    event: ReactMouseEvent<HTMLButtonElement>,
    name: string,
  ) => {
    event.preventDefault();
    selectAssetSuggestion(name);
  };

  const resetCreateForm = () => {
    setType("Buy");
    setSymbol("");
    setQuantity("");
    setUnitPrice("");
    setNote("");
    setDate(toLocalDateTimeInput(new Date()));
  };

  const getFieldErrors = () => {
    const errors: FieldErrors = {};

    if (!symbol.trim()) errors.symbol = "Varlık adı zorunlu.";
    if (!quantity.trim()) errors.quantity = "Adet zorunlu.";
    else if (!isDecimalInput(quantity)) errors.quantity = "Adet sayı olmalı.";
    else if (quantityValue <= 0) errors.quantity = "Adet 0’dan büyük olmalı.";
    if (!unitPrice.trim()) errors.unitPrice = "Birim fiyat zorunlu.";
    else if (!isDecimalInput(unitPrice))
      errors.unitPrice = "Birim fiyat sayı olmalı.";
    else if (unitPriceValue <= 0)
      errors.unitPrice = "Birim fiyat 0’dan büyük olmalı.";
    if (!date.trim()) errors.date = "Tarih ve saat zorunlu.";

    return errors;
  };

  const fieldErrors = getFieldErrors();
  const visibleFieldErrors = submitAttempted ? fieldErrors : {};

  const validateForm = () => {
    const errors = getFieldErrors();
    return Object.keys(errors).length === 0;
  };

  const saveTransaction = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const baseDto: CreateTransactionDto = {
        symbol: symbol.trim(),
        quantity: quantityValue,
        unitPrice: unitPriceValue,
        note: note.trim() || null,
        type,
        transactionDate: new Date(date).toISOString(),
      };

      if (transaction) {
        const dto: UpdateTransactionDto = {
          id: transaction.id,
          ...baseDto,
        };
        await transactionService.update(transaction.id, dto);
        showToast("İşlem güncellendi");
      } else {
        await transactionService.create(baseDto);
        showToast("İşlem eklendi");
        setKnownSymbols((current) =>
          current.some(
            (name) =>
              name.toLocaleLowerCase("tr-TR") ===
              baseDto.symbol.toLocaleLowerCase("tr-TR"),
          )
            ? current
            : [...current, baseDto.symbol].sort((a, b) =>
                a.localeCompare(b, "tr-TR"),
              ),
        );
        resetCreateForm();
      }

      onSaved();
      onClose?.();
    } catch {
      showToast(editing ? "Kaydetme başarısız" : "Kaydetme başarısız", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (editing && !hasChanges) return;
    if (!validateForm()) return;

    if (editing && hasChanges) {
      setConfirmation("save");
      return;
    }

    await saveTransaction();
  };

  const handleCancelClick = () => {
    if (editing && hasChanges) {
      setConfirmation("cancel");
      return;
    }

    if (!editing && createHasInput) {
      setConfirmation("cancel");
      return;
    }

    onClose?.();
  };

  useEffect(() => {
    if (closeRequestKey === undefined) return;
    if (previousCloseRequestKey.current === closeRequestKey) return;

    previousCloseRequestKey.current = closeRequestKey;
    if (confirmation) return;

    handleCancelClick();
  }, [closeRequestKey, confirmation]);

  const handleDeleteClick = () => {
    setConfirmation("delete");
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setConfirmation(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmSave = async () => {
    if (editing && !hasChanges) {
      setConfirmation(null);
      return;
    }

    setConfirmation(null);
    await saveTransaction();
  };

  const handleConfirmationCancel = () => {
    if (saving || deleting) return;
    setConfirmation(null);
  };

  const confirmationContent = {
    delete: {
      title: "İşlem silinsin mi?",
      message: "Bu işlem kalıcı olarak silinecek. Bu işlem geri alınamaz.",
      confirmLabel: "Sil",
      tone: "danger" as const,
      loading: deleting,
      onConfirm: handleConfirmDelete,
    },
    cancel: {
      title: "Değişiklikler kaybedilsin mi?",
      message: editing
        ? "Yaptığınız değişiklikleri kaybedeceksiniz. Devam etmek istediğinizden emin misiniz?"
        : "Girdiğiniz bilgiler kaybolacak. Devam etmek istediğinizden emin misiniz?",
      confirmLabel: "İptal",
      tone: "danger" as const,
      loading: false,
      onConfirm: onClose ?? (() => undefined),
    },
    save: {
      title: "İşlem güncellensin mi?",
      message:
        "Mevcut işlem güncellenecek. Eski veriler geri alınamaz. Emin misiniz?",
      confirmLabel: "Kaydet",
      tone: "default" as const,
      loading: saving,
      onConfirm: handleConfirmSave,
    },
  };

  const panelClass = `${styles.panelBase} ${
    mode === "modal" ? styles.modalPanel : styles.sidebarPanel
  }`;

  return (
    <div className={panelClass}>
      <div className={styles.headerContainer}>
        <span className={styles.title}>{title}</span>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.segmentContainer}>
          <button
            type="button"
            className={`${styles.segmentButtonBase} ${type === "Buy" ? styles.segmentButtonActive : styles.segmentButtonInactive}`}
            onClick={() => setType("Buy")}
          >
            Alış
          </button>
          <button
            type="button"
            className={`${styles.segmentButtonBase} ${type === "Sell" ? styles.segmentButtonActive : styles.segmentButtonInactive}`}
            onClick={() => setType("Sell")}
          >
            Satış
          </button>
        </div>
        <div className={styles.fieldGroup}>
          <div
            className={`relative ${styles.field}`}
            ref={assetAutocompleteRef}
          >
            <label htmlFor="asset-input" className={styles.label}>
              Varlık
            </label>
            <input
              id="asset-input"
              className={styles.input}
              type="text"
              placeholder="Gümüş"
              value={symbol}
              onChange={(event) => {
                setSymbol(event.target.value);
                setAssetSuggestionsOpen(true);
              }}
              onFocus={() =>
                setAssetSuggestionsOpen(assetSuggestions.length > 0)
              }
              onKeyDown={handleSymbolKeyDown}
              autoComplete="off"
              aria-invalid={visibleFieldErrors.symbol ? "true" : undefined}
            />
            <span
              className={`${styles.fieldError} ${
                visibleFieldErrors.symbol ? "" : styles.fieldErrorHidden
              }`}
              aria-live="polite"
            >
              {visibleFieldErrors.symbol ?? "Alan geçerli"}
            </span>
            {showAssetSuggestions && (
              <div className={styles.suggestionsContainer}>
                {assetSuggestions.map((name, index) => (
                  <button
                    key={name}
                    type="button"
                    className={`${styles.suggestionButtonBase} ${
                      index === selectedAssetSuggestionIndex
                        ? styles.suggestionActive
                        : styles.suggestionInactive
                    }`}
                    onMouseDown={(event) =>
                      handleAssetSuggestionMouseDown(event, name)
                    }
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="quantity-input" className={styles.label}>
                Adet
              </label>
              <input
                id="quantity-input"
                className={styles.input}
                type="number"
                step="0.00000001"
                min="0.00000001"
                placeholder="0"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                aria-invalid={visibleFieldErrors.quantity ? "true" : undefined}
              />
              <span
                className={`${styles.fieldError} ${
                  visibleFieldErrors.quantity ? "" : styles.fieldErrorHidden
                }`}
                aria-live="polite"
              >
                {visibleFieldErrors.quantity ?? "Alan geçerli"}
              </span>
            </div>
            <div className={styles.field}>
              <label htmlFor="unitprice-input" className={styles.label}>
                Birim fiyat
              </label>
              <input
                id="unitprice-input"
                className={styles.input}
                type="text"
                inputMode="decimal"
                placeholder="₺ 0,00"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
                aria-invalid={visibleFieldErrors.unitPrice ? "true" : undefined}
              />
              <span
                className={`${styles.fieldError} ${
                  visibleFieldErrors.unitPrice ? "" : styles.fieldErrorHidden
                }`}
                aria-live="polite"
              >
                {visibleFieldErrors.unitPrice ?? "Alan geçerli"}
              </span>
            </div>
          </div>
          <div className={styles.totalContainer}>
            <div className={styles.totalLabel}>Toplam Tutar</div>
            <div className={styles.totalValue} aria-live="polite">
              {formatCurrency(totalAmount)}
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="note-input" className={styles.label}>
              Not
            </label>
            <input
              id="note-input"
              className={styles.input}
              type="text"
              placeholder="İsteğe bağlı bir not ekle"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="date-input" className={styles.label}>
              Tarih ve Saat
            </label>
            <input
              id="date-input"
              className={`${styles.input} ${styles.dateTimeInput}`}
              type="datetime-local"
              step="1"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={visibleFieldErrors.date ? "true" : undefined}
            />
            <span
              className={`${styles.fieldError} ${
                visibleFieldErrors.date ? "" : styles.fieldErrorHidden
              }`}
              aria-live="polite"
            >
              {visibleFieldErrors.date ?? "Alan geçerli"}
            </span>
          </div>
        </div>
        <div className={styles.actionsContainer}>
          {editing && onDelete && (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDeleteClick}
              disabled={saving || deleting}
            >
              {deleting ? <span className={styles.spinner} /> : "Sil"}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancelClick}
              disabled={saving || deleting}
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saveDisabled}
          >
            {saving ? <span className={styles.spinner} /> : "Kaydet"}
          </button>
        </div>
      </form>

      {confirmation && (
        <ConfirmationModal
          title={confirmationContent[confirmation].title}
          message={confirmationContent[confirmation].message}
          confirmLabel={confirmationContent[confirmation].confirmLabel}
          tone={confirmationContent[confirmation].tone}
          loading={confirmationContent[confirmation].loading}
          onConfirm={confirmationContent[confirmation].onConfirm}
          onCancel={handleConfirmationCancel}
        />
      )}
    </div>
  );
}
