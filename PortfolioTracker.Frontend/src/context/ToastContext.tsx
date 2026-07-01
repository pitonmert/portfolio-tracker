import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}
interface ToastContextType {
  showToast: (message: string, type?: "success" | "error") => void;
  activeToast: Toast | null;
}
const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  activeToast: null,
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3000,
      );
    },
    [],
  );

  const activeToast = toasts.length > 0 ? toasts[toasts.length - 1] : null;

  return (
    <ToastContext.Provider value={{ showToast, activeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
