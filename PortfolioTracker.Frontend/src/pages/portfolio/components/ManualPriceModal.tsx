import { useState } from "react";

import { TurkishLiraIcon } from "@/components/ui/icons";
import { useToast } from "@/context/ToastContext";
import { marketPriceService } from "@/services/marketPriceService";
import {
  formatDecimalDraft,
  formatDecimalInput,
  parseFormattedDecimalInput,
} from "@/utils/decimalInput";
import { DecimalValueModal } from "./DecimalValueModal";

interface ManualPriceModalProps {
  symbol: string;
  currentPrice: number | null;
  isManualPrice: boolean;
  onClose: () => void;
  onChanged: () => void;
}

const styles = {
  currencyIcon: "h-4 w-4 shrink-0 text-[var(--ink)]",
  deleteButton:
    "inline-flex h-10 items-center justify-center rounded-lg border border-[color:var(--line)] bg-[var(--bg)] px-4 text-sm font-medium text-[var(--expense)] transition-all hover:border-[color:var(--expense)] hover:bg-[var(--bg-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--expense)] disabled:cursor-not-allowed disabled:opacity-50",
};

export function ManualPriceModal({
  symbol,
  currentPrice,
  isManualPrice,
  onClose,
  onChanged,
}: ManualPriceModalProps) {
  const { showToast } = useToast();
  const [value, setValue] = useState(() =>
    currentPrice !== null ? formatDecimalDraft(currentPrice, 8) : "",
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (saving || !dirty) return;

    setError(null);

    const isEmpty = !value.trim();
    const nextCurrentPrice = parseFormattedDecimalInput(value);

    if (!isEmpty && nextCurrentPrice <= 0) {
      setError("Geçerli fiyat gir.");
      return;
    }

    setSaving(true);
    try {
      if (isEmpty) {
        await marketPriceService.clearManualPrice(symbol);
        showToast("Manuel fiyat kaldırıldı");
      } else {
        await marketPriceService.saveManualPrice(symbol, nextCurrentPrice);
        setValue(formatDecimalDraft(nextCurrentPrice, 8));
        showToast("Fiyat kaydedildi");
      }
      setDirty(false);
      onClose();
      onChanged();
    } catch {
      setError("İşlem başarısız.");
      showToast("İşlem başarısız", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteManualPrice = async () => {
    if (saving || !isManualPrice) return;

    setSaving(true);
    setError(null);

    try {
      await marketPriceService.clearManualPrice(symbol);
      showToast("Manuel fiyat silindi");
      setDirty(false);
      onClose();
      onChanged();
    } catch {
      setError("Silme başarısız.");
      showToast("Silme başarısız", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (nextValue: string) => {
    setValue(formatDecimalInput(nextValue));
    setDirty(true);
    setError(null);
  };

  return (
    <DecimalValueModal
      title={symbol}
      titleId={`${symbol}-price-modal-title`}
      label="Sembol fiyatı"
      message={error ?? "Güncel fiyat bulunamadı."}
      hasError={error !== null}
      value={value}
      saving={saving}
      dirty={dirty}
      inputLabel={`${symbol} sembol fiyatı`}
      leadingIcon={
        <TurkishLiraIcon className={styles.currencyIcon} aria-hidden="true" />
      }
      leftAction={
        isManualPrice ? (
          <button
            className={styles.deleteButton}
            type="button"
            onClick={() => void handleDeleteManualPrice()}
            disabled={saving}
          >
            Sil
          </button>
        ) : undefined
      }
      onChange={handleInputChange}
      onClose={closeModal}
      onCancel={closeModal}
      onSave={() => void handleSave()}
    />
  );
}
