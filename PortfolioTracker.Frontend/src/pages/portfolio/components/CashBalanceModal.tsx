import { useState } from "react";

import { useToast } from "@/context/ToastContext";
import {
  formatDecimalDraft,
  formatDecimalInput,
  parseFormattedDecimalInput,
} from "@/utils/decimalInput";
import { DecimalValueModal } from "./DecimalValueModal";

interface CashBalanceModalProps {
  cashBalance: number;
  onClose: () => void;
  onSave: (cashBalance: number) => Promise<number>;
}

export function CashBalanceModal({
  cashBalance,
  onClose,
  onSave,
}: CashBalanceModalProps) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState(() => formatDecimalDraft(cashBalance, 2));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = () => {
    if (saving) return;
    onClose();
  };

  const saveCashBalance = async () => {
    const nextCashBalance = Math.max(0, parseFormattedDecimalInput(draft));
    if (!dirty && nextCashBalance === cashBalance) {
      onClose();
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave(nextCashBalance);
      setDirty(false);
      onClose();
      showToast("Bakiye kaydedildi");
    } catch {
      setError("Bakiye kaydedilemedi.");
      showToast("Bakiye kaydedilemedi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDraftChange = (value: string) => {
    setDraft(formatDecimalInput(value, { maxFractionDigits: 2 }));
    setDirty(true);
    setError(null);
  };

  return (
    <DecimalValueModal
      title="Bakiye"
      titleId="cash-balance-modal-title"
      label="Nakit bakiye"
      message={error ?? "Hisseye bağlı olmayan nakit tutarı gir."}
      hasError={error !== null}
      value={draft}
      saving={saving}
      dirty={dirty}
      inputLabel="Hisseye bağlı olmayan nakit bakiye"
      onChange={handleDraftChange}
      onClose={closeModal}
      onCancel={closeModal}
      onSave={() => void saveCashBalance()}
    />
  );
}
