import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { transactionService } from "@/services/transactionService";
import { useToast } from "@/context/ToastContext";
import type {
  Transaction,
  TransactionType,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "@/types/transaction";
import { formatCurrency } from "@/utils/formatters";
import {
  calculateTransactionTotal,
  parseDecimalInput,
} from "@/pages/portfolio/utils/portfolioUiUtils";
import ConfirmationModal from "./ConfirmationModal";
import { ModalShell } from "@/components/ui/ModalShell";
import { uiStyles } from "@/components/ui/styles";
import { cx } from "@/utils/cx";
import { TransactionAssetAutocomplete } from "./TransactionAssetAutocomplete";
import {
  getInitialFormState,
  hasCreateTransactionInput,
  hasTransactionFormChanges,
  toLocalDateTimeInput,
  transactionFormResolver,
  type TransactionFormState,
} from "@/pages/portfolio/utils/transactionForm";

type ConfirmationType = "delete" | "cancel" | "save";

interface TransactionFormModalProps {
  transaction?: Transaction;
  onSaved: () => void;
  onClose: () => void;
  onDelete?: () => Promise<void> | void;
}

const styles = {
  backdrop:
    "app-scrollbar fixed inset-0 z-[100] flex items-center justify-center overflow-auto overscroll-contain bg-[var(--backdrop)] px-3 py-4 backdrop-blur sm:p-4",
  modalWrapper: "w-full max-w-md rounded-lg",

  panel:
    "relative w-full max-w-md min-w-0 overflow-x-hidden rounded-2xl border border-[color:var(--line)] bg-[var(--bg)] p-3.5 sm:p-4 shadow-xl shadow-[color:var(--line-soft)]/50",

  headerContainer: "mb-3 flex min-w-0 flex-col text-center",
  title:
    "block min-w-0 break-words font-[family-name:var(--font-display)] text-xl font-bold leading-snug text-[var(--ink)] sm:text-2xl",
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

  input: "max-w-full block box-border",
  dateTimeInput:
    "appearance-none overflow-hidden text-ellipsis whitespace-nowrap",
  fieldErrorHidden: "invisible",

  totalContainer:
    "relative mt-1 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg)] p-3 ring-1 ring-inset ring-[color:var(--line)] sm:p-4",
  totalLabel: "text-xs font-medium text-[var(--ink-2)] sm:text-[13px]",
  totalValue:
    "mt-0.5 break-words font-[family-name:var(--font-display)] text-[24px] font-bold leading-snug text-[var(--ink)] sm:text-[28px]",

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

export default function TransactionFormModal({
  transaction,
  onSaved,
  onClose,
  onDelete,
}: TransactionFormModalProps) {
  const { showToast } = useToast();
  const editing = transaction !== undefined;
  const initialFormState = useMemo(
    () => getInitialFormState(transaction),
    [transaction],
  );
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<TransactionFormState>({
    defaultValues: initialFormState,
    resolver: transactionFormResolver,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationType | null>(
    null,
  );
  const currentFormState = watch();
  const { type, quantity, unitPrice } = currentFormState;
  const quantityValue = parseDecimalInput(quantity);
  const unitPriceValue = parseDecimalInput(unitPrice);
  const totalAmount = calculateTransactionTotal(quantityValue, unitPriceValue);
  const title = editing ? "İşlemi Düzenle" : "Yeni İşlem";
  const hasChanges = hasTransactionFormChanges(
    currentFormState,
    initialFormState,
  );
  const createHasInput =
    !editing && hasCreateTransactionInput(currentFormState, initialFormState);
  const saveDisabled = saving || (editing && !hasChanges);

  const resetCreateForm = () => {
    reset({
      type: "Buy",
      assetId: null,
      symbol: "",
      quantity: "",
      unitPrice: "",
      note: "",
      date: toLocalDateTimeInput(new Date()),
    });
  };

  const visibleFieldErrors = {
    symbol: errors.symbol?.message,
    quantity: errors.quantity?.message,
    unitPrice: errors.unitPrice?.message,
    date: errors.date?.message,
  };

  const saveTransaction = async (values: TransactionFormState) => {
    setSaving(true);
    try {
      const nextQuantityValue = parseDecimalInput(values.quantity);
      const nextUnitPriceValue = parseDecimalInput(values.unitPrice);
      const baseDto: CreateTransactionDto = {
        assetId: values.assetId ?? null,
        symbol: values.symbol.trim(),
        quantity: nextQuantityValue,
        unitPrice: nextUnitPriceValue,
        note: values.note.trim() || null,
        type: values.type,
        transactionDate: new Date(values.date).toISOString(),
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
        resetCreateForm();
      }

      onSaved();
      onClose();
    } catch {
      showToast(editing ? "Kaydetme başarısız" : "Kaydetme başarısız", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleValidSubmit = async (values: TransactionFormState) => {
    if (editing && !hasChanges) return;

    if (editing && hasChanges) {
      setConfirmation("save");
      return;
    }

    await saveTransaction(values);
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

    onClose();
  };

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

    const valid = await trigger();
    if (!valid) {
      setConfirmation(null);
      return;
    }

    setConfirmation(null);
    await saveTransaction(getValues());
  };

  const handleConfirmationCancel = () => {
    if (saving || deleting) return;
    setConfirmation(null);
  };

  const setTransactionType = (nextType: TransactionType) => {
    setValue("type", nextType, { shouldDirty: true });
  };

  const submitForm = handleSubmit(handleValidSubmit);

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
      onConfirm: onClose,
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

  return (
    <ModalShell backdropClassName={styles.backdrop} onClose={handleCancelClick}>
      <div
        className={styles.modalWrapper}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.panel}>
          <div className={styles.headerContainer}>
            <span className={styles.title}>{title}</span>
          </div>
          <form
            onSubmit={(event) => void submitForm(event)}
            className={styles.form}
          >
            <input type="hidden" {...register("type")} />
            <div className={styles.segmentContainer}>
              <button
                type="button"
                className={`${styles.segmentButtonBase} ${type === "Buy" ? styles.segmentButtonActive : styles.segmentButtonInactive}`}
                onClick={() => setTransactionType("Buy")}
              >
                Alış
              </button>
              <button
                type="button"
                className={`${styles.segmentButtonBase} ${type === "Sell" ? styles.segmentButtonActive : styles.segmentButtonInactive}`}
                onClick={() => setTransactionType("Sell")}
              >
                Satış
              </button>
            </div>
            <div className={styles.fieldGroup}>
              <Controller
                control={control}
                name="symbol"
                render={({ field }) => (
                  <TransactionAssetAutocomplete
                    value={field.value}
                    error={visibleFieldErrors.symbol}
                    onChange={(nextSymbol, nextAssetId) => {
                      field.onChange(nextSymbol);
                      setValue("assetId", nextAssetId, {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                    }}
                  />
                )}
              />
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="quantity-input" className={uiStyles.label}>
                    Adet
                  </label>
                  <input
                    id="quantity-input"
                    className={cx(uiStyles.input, styles.input)}
                    type="number"
                    step="0.00000001"
                    min="0.00000001"
                    placeholder="0"
                    {...register("quantity")}
                    aria-invalid={
                      visibleFieldErrors.quantity ? "true" : undefined
                    }
                  />
                  <span
                    className={`${uiStyles.fieldError} ${
                      visibleFieldErrors.quantity ? "" : styles.fieldErrorHidden
                    }`}
                    aria-live="polite"
                  >
                    {visibleFieldErrors.quantity ?? "Alan geçerli"}
                  </span>
                </div>
                <div className={styles.field}>
                  <label htmlFor="unitprice-input" className={uiStyles.label}>
                    Birim fiyat
                  </label>
                  <input
                    id="unitprice-input"
                    className={cx(uiStyles.input, styles.input)}
                    type="text"
                    inputMode="decimal"
                    placeholder="₺ 0,00"
                    {...register("unitPrice")}
                    aria-invalid={
                      visibleFieldErrors.unitPrice ? "true" : undefined
                    }
                  />
                  <span
                    className={`${uiStyles.fieldError} ${
                      visibleFieldErrors.unitPrice
                        ? ""
                        : styles.fieldErrorHidden
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
                <label htmlFor="note-input" className={uiStyles.label}>
                  Not
                </label>
                <input
                  id="note-input"
                  className={cx(uiStyles.input, styles.input)}
                  type="text"
                  placeholder="İsteğe bağlı bir not ekle"
                  {...register("note")}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="date-input" className={uiStyles.label}>
                  Tarih ve Saat
                </label>
                <input
                  id="date-input"
                  className={cx(
                    uiStyles.input,
                    styles.input,
                    styles.dateTimeInput,
                  )}
                  type="datetime-local"
                  step="1"
                  {...register("date")}
                  aria-invalid={visibleFieldErrors.date ? "true" : undefined}
                />
                <span
                  className={`${uiStyles.fieldError} ${
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
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelClick}
                disabled={saving || deleting}
              >
                İptal
              </button>
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
      </div>
    </ModalShell>
  );
}
