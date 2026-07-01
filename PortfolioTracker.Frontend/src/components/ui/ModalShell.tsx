import { useEffect } from "react";
import type { MouseEvent, ReactNode } from "react";

export interface ModalShellProps {
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropClassName?: string;
  closeOnBackdrop?: boolean;
}

const DEFAULT_BACKDROP_CLASS =
  "fixed inset-0 z-[100] flex items-center justify-center bg-[var(--backdrop)] backdrop-blur p-4";

export function ModalShell({
  isOpen = true,
  onClose,
  children,
  backdropClassName = DEFAULT_BACKDROP_CLASS,
  closeOnBackdrop = true,
}: ModalShellProps) {
  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  // ESC handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={backdropClassName} onClick={handleBackdropClick}>
      {children}
    </div>
  );
}
