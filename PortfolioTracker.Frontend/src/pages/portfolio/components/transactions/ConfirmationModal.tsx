import { ModalShell } from "@/components/ui/ModalShell";
import { uiStyles } from "@/components/ui/styles";
import { cx } from "@/utils/cx";

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const styles = {
  message: "mt-3 text-sm leading-6 text-[var(--ink-2)]",
  actions: "mt-5 flex flex-row justify-end gap-2",
  cancelButton:
    "rounded-xl border-0 bg-transparent py-2.5 text-[var(--ink-2)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)]",
  confirmButtonBase:
    "rounded-xl py-2.5 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  confirmButtonDefault: "focus-visible:outline-[var(--accent)]",
  confirmButtonDanger: "focus-visible:outline-[var(--expense)]",
  spinner:
    "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current",
};

export default function ConfirmationModal({
  title,
  message,
  confirmLabel,
  cancelLabel = "Vazgeç",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const confirmButtonClass = cx(
    tone === "danger" ? uiStyles.buttonDanger : uiStyles.buttonPrimary,
    styles.confirmButtonBase,
    tone === "danger"
      ? styles.confirmButtonDanger
      : styles.confirmButtonDefault,
  );

  return (
    <ModalShell backdropClassName={uiStyles.modalBackdrop} onClose={onCancel}>
      <section
        className={uiStyles.modalPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirmation-title" className={uiStyles.modalTitle}>
          {title}
        </h2>
        <p id="confirmation-message" className={styles.message}>
          {message}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={cx(uiStyles.buttonSecondary, styles.cancelButton)}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmButtonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : confirmLabel}
          </button>
        </div>
      </section>
    </ModalShell>
  );
}
