"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Garde seulement le code : "48 29 13" → "482913",
 * "Votre code Kola : 482913." → "482913".
 */
export function parseOtp(text: string, length: number): string {
  const compact = text.replace(/[\s-]/g, "");
  if (/^\d*$/.test(compact)) return compact.slice(0, length);
  const match = new RegExp(`(^|\\D)(\\d{${length}})(?!\\d)`).exec(text);
  if (match) return match[2];
  return text.replace(/\D/g, "").slice(0, length);
}

/** 75 → "1:15" */
export function formatDelay(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export type KolaOtpFieldProps = {
  label?: string;
  /** Nombre de chiffres (4 ou 6 le plus souvent). */
  length?: number;
  value?: string;
  defaultValue?: string;
  /** Reçoit le code à chaque changement (chiffres seulement). */
  onChange?: (code: string) => void;
  /** Appelé une fois, quand toutes les cases sont remplies. */
  onComplete?: (code: string) => void;
  /** Texte sous les cases, ex. "Envoyé par SMS au 6 77 12 34 56". */
  helper?: string;
  /** Erreur à afficher, ex. "Code incorrect". Les cases passent en rouge. */
  error?: string | null;
  /** Si présent, affiche « Renvoyer le code » après resendDelay secondes. */
  onResend?: () => void | Promise<void>;
  resendDelay?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
};

/**
 * Champ code OTP : les cases pour le code reçu par SMS.
 * Un seul champ invisible derrière les cases : collage, remplissage automatique
 * du SMS et effacement marchent comme dans un champ normal.
 *
 * <KolaOtpField
 *   helper="Envoyé par SMS au 6 77 12 34 56"
 *   onComplete={(code) => verifier(code)}
 *   onResend={() => renvoyerSms()}
 * />
 */
export function KolaOtpField({
  label = "Code de vérification",
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  helper,
  error,
  onResend,
  resendDelay = 60,
  autoFocus,
  disabled,
  id,
  name,
  className = "",
}: KolaOtpFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(() => parseOtp(defaultValue, length));
  const [focused, setFocused] = useState(false);
  const [left, setLeft] = useState(onResend ? resendDelay : 0);
  const [sending, setSending] = useState(false);
  const code = value !== undefined ? parseOtp(value, length) : inner;

  const hasTimer = !!onResend && left > 0;
  useEffect(() => {
    if (!hasTimer) return;
    const timer = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [hasTimer]);

  const update = (next: string) => {
    if (next === code) return;
    setInner(next);
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
  };

  const resend = async () => {
    if (!onResend) return;
    setSending(true);
    try {
      await onResend();
      update("");
      setLeft(resendDelay);
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const message = error ?? helper;
  const descId = message ? `${inputId}-desc` : undefined;
  const active = focused ? Math.min(code.length, length - 1) : -1;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-semibold text-kola-ink">
        {label}
      </label>
      <div className={`relative flex max-w-full gap-2 self-start ${disabled ? "opacity-60" : ""}`}>
        {Array.from({ length }, (_, i) => (
          <div
            key={i}
            aria-hidden
            className={`flex aspect-[6/7] w-12 min-w-0 shrink items-center justify-center rounded-kola border bg-kola-surface text-2xl font-semibold text-kola-ink transition ${
              error
                ? "border-kola-danger ring-1 ring-kola-danger"
                : i === active
                  ? "border-kola-primary ring-1 ring-kola-primary"
                  : "border-kola-line-strong"
            }`}
          >
            {code[i] ??
              (i === active && <span className="h-1/2 w-0.5 rounded-full bg-kola-primary motion-safe:animate-pulse" />)}
          </div>
        ))}
        {/* Le vrai champ, invisible, posé sur les cases. */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          value={code}
          disabled={disabled}
          autoFocus={autoFocus}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={descId}
          onChange={(e) => update(parseOtp(e.target.value, length))}
          onPaste={(e) => {
            // Un collage remplace tout le code au lieu de s'ajouter à la fin.
            e.preventDefault();
            update(parseOtp(e.clipboardData.getData("text"), length));
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSelect={(e) => {
            // Le curseur reste toujours à la fin : on remplit les cases dans l'ordre.
            const el = e.currentTarget;
            const end = el.value.length;
            if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
          }}
          className="absolute inset-0 h-full w-full cursor-text bg-transparent text-base text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
        />
      </div>
      {message && (
        <p id={descId} className={`text-sm ${error ? "text-kola-danger" : "text-kola-ink-subtle"}`}>
          {message}
        </p>
      )}
      {onResend && (
        <p className="mt-1 text-sm text-kola-ink-subtle">
          {left > 0 ? (
            <>
              Renvoyer le code dans <span className="font-mono">{formatDelay(left)}</span>
            </>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={sending || disabled}
              className="font-semibold text-kola-primary hover:underline disabled:opacity-60"
            >
              {sending ? "Envoi…" : "Renvoyer le code"}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
