"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type KolaConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Bouton de confirmation en rouge (suppression, action définitive). */
  destructive?: boolean;
  /** Panneau qui monte du bas de l'écran (pratique sur mobile). */
  sheet?: boolean;
};

/**
 * Demande de confirmation en une ligne.
 *
 * const { confirm, dialog } = useKolaConfirm();
 *
 * async function supprimer() {
 *   if (await confirm({ title: "Supprimer cet article ?", destructive: true })) {
 *     // l'utilisateur a confirmé
 *   }
 * }
 *
 * return <>{dialog}<button onClick={supprimer}>Supprimer</button></>;
 */
export function useKolaConfirm(): {
  confirm: (options: KolaConfirmOptions) => Promise<boolean>;
  dialog: ReactNode;
} {
  const [options, setOptions] = useState<KolaConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((o: KolaConfirmOptions) => {
    resolver.current?.(false);
    setOptions(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const finish = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  }, []);

  return { confirm, dialog: <KolaConfirmDialog options={options} onFinish={finish} /> };
}

function KolaConfirmDialog({ options, onFinish }: { options: KolaConfirmOptions | null; onFinish: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (options && !d.open) d.showModal();
    if (!options && d.open) d.close();
  }, [options]);

  const sheet = options?.sheet;
  return (
    <dialog
      ref={ref}
      aria-label={options?.title}
      onCancel={(e) => {
        e.preventDefault();
        onFinish(false);
      }}
      onClick={(e) => e.target === e.currentTarget && onFinish(false)}
      className={`border border-kola-line bg-kola-surface p-0 text-kola-ink shadow-2xl backdrop:bg-black/40 ${
        sheet ? "mx-0 mt-auto mb-0 w-full max-w-full rounded-t-[24px]" : "m-auto w-[calc(100%-32px)] max-w-[420px] rounded-[20px]"
      }`}
    >
      {options && <KolaConfirmContent {...options} onFinish={onFinish} />}
    </dialog>
  );
}

/** Le contenu seul (titre, message, boutons), si tu veux l'afficher ailleurs. */
export function KolaConfirmContent({
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  destructive = false,
  sheet = false,
  onFinish,
}: KolaConfirmOptions & { onFinish: (ok: boolean) => void }) {
  return (
    <div className={`flex flex-col gap-3 p-6 ${sheet ? "mx-auto max-w-[560px] pb-8" : ""}`}>
      {sheet && <span aria-hidden className="mx-auto -mt-2 mb-2 h-1 w-10 rounded-full bg-kola-line-strong" />}
      <h2 className="text-xl font-bold">{title}</h2>
      {message && <p className="leading-relaxed text-kola-ink-muted">{message}</p>}
      <div className={`mt-3 flex gap-2 ${sheet ? "flex-col-reverse" : "justify-end"}`}>
        <button
          type="button"
          onClick={() => onFinish(false)}
          className="min-h-12 rounded-kola px-5 font-semibold text-kola-ink-muted hover:bg-kola-surface-muted"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          autoFocus
          onClick={() => onFinish(true)}
          className={`min-h-12 rounded-kola px-5 font-semibold hover:brightness-110 ${
            destructive ? "bg-kola-danger text-kola-bg" : "bg-kola-primary text-kola-on-primary"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
