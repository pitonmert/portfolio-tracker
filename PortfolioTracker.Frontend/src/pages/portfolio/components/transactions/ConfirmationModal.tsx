import { ModalShell } from "../../../../components/ui/ModalShell";

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
  backdrop:
    "fixed inset-0 z-[140] flex items-center justify-center bg-[var(--backdrop)] px-3 py-4 backdrop-blur-sm",
  modal:
    "w-full max-w-sm rounded-2xl border border-[color:var(--line-soft)] bg-[var(--bg)] p-5 text-[var(--ink)] shadow-xl",
  title:
    "m-0 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[var(--ink)]",
  message: "mt-3 text-sm leading-6 text-[var(--ink-2)]",
  actions: "mt-5 flex flex-row justify-end gap-2",
  cancelButton:
    "inline-flex items-center justify-center rounded-xl bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line)]",
  confirmButtonBase:
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
  confirmButtonDefault:
    "bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)] focus-visible:outline-[var(--accent)]",
  confirmButtonDanger:
    "bg-[var(--expense)] text-white hover:opacity-90 focus-visible:outline-[var(--expense)]",
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
  const confirmButtonClass = `${styles.confirmButtonBase} ${
    tone === "danger" ? styles.confirmButtonDanger : styles.confirmButtonDefault
  }`;

  return (
    <ModalShell backdropClassName={styles.backdrop} onClose={onCancel}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirmation-title" className={styles.title}>
          {title}
        </h2>
        <p id="confirmation-message" className={styles.message}>
          {message}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
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
