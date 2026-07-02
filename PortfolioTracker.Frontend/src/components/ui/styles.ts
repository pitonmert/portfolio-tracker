export const uiStyles = {
  modalBackdrop:
    "fixed inset-0 z-[140] flex items-center justify-center bg-[var(--backdrop)] px-3 py-4 backdrop-blur-sm",
  modalPanel:
    "w-full max-w-sm rounded-2xl border border-[color:var(--line-soft)] bg-[var(--bg)] p-5 text-[var(--ink)] shadow-xl",
  modalTitle:
    "m-0 font-[family-name:var(--font-display)] text-xl font-bold leading-snug text-[var(--ink)]",
  modalCloseButton:
    "inline-flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-[var(--bg-2)] text-[var(--ink-2)] transition-colors hover:bg-[var(--line)] hover:text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",

  buttonPrimary:
    "inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
  buttonSecondary:
    "inline-flex items-center justify-center rounded-lg border border-[color:var(--line)] bg-[var(--bg)] px-4 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
  buttonDanger:
    "inline-flex items-center justify-center rounded-lg bg-[var(--expense)] px-4 text-sm font-semibold text-white transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--expense)] disabled:cursor-not-allowed disabled:opacity-70",
  iconButton:
    "inline-flex shrink-0 items-center justify-center rounded-full text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",

  input:
    "min-w-0 w-full rounded-xl border border-[color:var(--line)] bg-[var(--bg)] px-3.5 py-1.5 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-3)] hover:border-[color:var(--ink-3)] focus:border-[color:var(--accent)] focus:shadow-[0_0_0_2px_var(--focus-ring)]",
  inputFrame:
    "flex items-center gap-2 rounded-xl border border-[color:var(--line)] bg-[var(--bg)] px-3 py-2 focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",
  label: "mb-1 block text-sm font-medium text-[var(--ink-2)]",
  fieldError:
    "mt-1 min-h-4 text-xs font-medium leading-snug text-[var(--expense)]",

  loadingBox:
    "rounded bg-[var(--bg-2)] px-4 py-10 text-center text-sm text-[var(--ink-2)]",
  errorBox:
    "rounded bg-[var(--bg-2)] px-4 py-10 text-center text-sm text-[var(--expense)]",
  emptyBox:
    "rounded bg-[var(--bg-2)] px-4 py-12 text-center text-sm text-[var(--ink-2)]",
  spinner:
    "inline-block h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--line-soft)] border-t-[color:var(--ink)]",
};
