"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type ToastType = "success" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", description?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, message, description, type };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep up to 4 recent

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Real Top-Right Notification Stack */}
      <div
        aria-live="polite"
        className="fixed top-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-[min(90vw,360px)] pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto bg-surface/95 backdrop-blur-md border border-strong text-primary p-4 shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-right-8 duration-300 transition-all rounded-none relative overflow-hidden"
          >
            {/* Left accent bar based on type */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                t.type === "success"
                  ? "bg-white"
                  : t.type === "warning"
                  ? "bg-secondary"
                  : "bg-muted"
              }`}
            />

            <div className="flex-1 pl-1">
              <div className="flex items-center gap-2">
                {t.type === "success" && (
                  <span className="text-xs text-white">✓</span>
                )}
                {t.type === "warning" && (
                  <span className="text-xs text-secondary">⚠</span>
                )}
                {t.type === "info" && (
                  <span className="text-xs text-muted">✦</span>
                )}
                <p className="text-sm font-semibold text-primary">{t.message}</p>
              </div>
              {t.description && (
                <p className="text-xs text-secondary mt-1 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-xs text-muted hover:text-primary px-1.5 py-0.5 border border-transparent hover:border-border transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
