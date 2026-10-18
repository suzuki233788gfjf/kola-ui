"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type KolaToastType = "success" | "error" | "info" | "warning";

export type KolaToastOptions = {
  type?: KolaToastType;
  title?: string;
  /** Durée d'affichage en millisecondes. */
  duration?: number;
};

type Toast = KolaToastOptions & { id: number; message: string };

const ToastContext = createContext<((message: string, options?: KolaToastOptions) => void) | null>(null);

/**
 * Notifications. Place le provider une fois, autour de ton application :
 *
 * <KolaToastProvider><App /></KolaToastProvider>
 *
 * Puis, dans n'importe quel composant :
 *
 * const toast = useKolaToast();
 * toast("Paiement reçu", { type: "success" });
 */
export function KolaToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = useCallback((message: string, options: KolaToastOptions = {}) => {
    const id = ++nextId.current;
    setToasts((t) => [...t.slice(-2), { id, message, ...options }]);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4"
      >
        {toasts.map((t) => (
          <AutoDismiss key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useKolaToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useKolaToast doit être utilisé dans <KolaToastProvider>.");
  return show;
}

function AutoDismiss({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);
  return (
    <KolaToastView
      className="pointer-events-auto"
      message={toast.message}
      title={toast.title}
      type={toast.type}
      onClose={() => onDismiss(toast.id)}
    />
  );
}

const STYLES: Record<KolaToastType, { bar: string; icon: string; path: string; label: string }> = {
  success: { bar: "bg-kola-success", icon: "text-kola-success", path: "M5 12.5l4.5 4.5L19 7.5", label: "Succès" },
  error: { bar: "bg-kola-danger", icon: "text-kola-danger", path: "M7 7l10 10M17 7L7 17", label: "Erreur" },
  info: { bar: "bg-kola-info", icon: "text-kola-info", path: "M12 11v6M12 7.5v.01", label: "Information" },
  warning: { bar: "bg-kola-warning", icon: "text-kola-warning", path: "M12 8v5M12 16.5v.01", label: "Attention" },
};

/** La notification seule, sans animation ni minuterie. */
export function KolaToastView({
  message,
  title,
  type = "success",
  onClose,
  className = "",
}: {
  message: string;
  title?: string;
  type?: KolaToastType;
  onClose?: () => void;
  className?: string;
}) {
  const s = STYLES[type];
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex w-full max-w-[420px] items-start gap-3 overflow-hidden rounded-kola border border-kola-line bg-kola-surface py-3.5 pr-2 pl-0 text-kola-ink shadow-lg ${className}`}
    >
      <span aria-hidden className={`-my-3.5 w-1 self-stretch ${s.bar}`} />
      <svg viewBox="0 0 24 24" className={`mt-0.5 size-5 shrink-0 ${s.icon}`} fill="none" stroke="currentColor" strokeWidth="2.5" aria-label={s.label}>
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path d={s.path} strokeLinecap="round" strokeLinejoin="round" transform="translate(12 12) scale(0.6) translate(-12 -12)" />
      </svg>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <p className={title ? "text-sm text-kola-ink-muted" : ""}>{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Fermer"
          title="Fermer"
          onClick={onClose}
          className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-kola-ink-subtle hover:text-kola-ink"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M7 7l10 10M17 7L7 17" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
