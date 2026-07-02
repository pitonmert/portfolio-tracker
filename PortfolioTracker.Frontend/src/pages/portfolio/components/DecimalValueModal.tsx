import type { KeyboardEvent, ReactNode } from "react";

import { ModalShell } from "@/components/ui/ModalShell";
import { XIcon } from "@/components/ui/icons";
import { uiStyles } from "@/components/ui/styles";
import { cx } from "@/utils/cx";

interface DecimalValueModalProps {
  title: string;
  titleId: string;
  label: string;
  message: string;
  hasError?: boolean;
  value: string;
  saving: boolean;
  dirty: boolean;
  inputLabel: string;
  leftAction?: ReactNode;
  leadingIcon?: ReactNode;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onCancel?: () => void;
}

const styles = {
  backdrop:
    "fixed inset-x-0 top-0 bottom-auto z-[150] flex h-[100dvh] touch-none items-start justify-center overflow-hidden bg-[var(--backdrop)] p-4 backdrop-blur sm:items-center max-[420px]:p-3",
  modal: "touch-auto overflow-hidden bg-[var(--page-bg)]",
  header: "flex items-center justify-between gap-4",
  title:
    "min-w-0 truncate font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]",
  body: "mt-4 flex flex-col gap-2 text-left",
  label:
    "mb-1.5 block text-left text-xs font-medium uppercase text-[var(--ink-3)]",
  input:
    "min-w-0 flex-1 border-0 bg-transparent p-0 text-left font-mono text-lg font-medium tabular-nums text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]",
  message: "min-h-4 text-left text-[11px] font-medium text-[var(--ink-3)]",
  error: "min-h-4 text-left text-[11px] font-medium text-[var(--expense)]",
  actions: "mt-4 flex items-center justify-between gap-3",
  rightActions: "ml-auto flex items-center justify-end gap-2",
  actionButton: "h-10 select-none",
};

export function DecimalValueModal({
  title,
  titleId,
  label,
  message,
  hasError = false,
  value,
  saving,
  dirty,
  inputLabel,
  leftAction,
  leadingIcon,
  onChange,
  onClose,
  onSave,
  onCancel,
}: DecimalValueModalProps) {
  const closeModal = () => {
    if (saving) return;
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSave();
      return;
    }

    if (event.key === "Escape") {
      closeModal();
    }
  };

  return (
    <ModalShell backdropClassName={styles.backdrop} onClose={closeModal}>
      <div
        className={cx(uiStyles.modalPanel, styles.modal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            className={uiStyles.modalCloseButton}
            type="button"
            onClick={closeModal}
            disabled={saving}
            aria-label="Kapat"
          >
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>
          <label>
            <span className={styles.label}>{label}</span>
            <span className={uiStyles.inputFrame}>
              {leadingIcon}
              <input
                autoFocus
                className={styles.input}
                inputMode="decimal"
                enterKeyHint="done"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="0,00"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onDoubleClick={(event) => {
                  event.currentTarget.select();
                }}
                onKeyDown={handleKeyDown}
                disabled={saving}
                aria-label={inputLabel}
              />
            </span>
          </label>

          <span className={hasError ? styles.error : styles.message}>
            {message}
          </span>
        </div>

        <div className={styles.actions}>
          {leftAction ?? <span aria-hidden="true" />}

          <div className={styles.rightActions}>
            <button
              className={cx(uiStyles.buttonSecondary, styles.actionButton)}
              type="button"
              onClick={onCancel ?? closeModal}
              disabled={saving}
            >
              Vazgeç
            </button>
            <button
              className={cx(uiStyles.buttonPrimary, styles.actionButton)}
              type="button"
              onClick={onSave}
              disabled={saving || !dirty}
            >
              {saving ? "Kaydediliyor" : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
