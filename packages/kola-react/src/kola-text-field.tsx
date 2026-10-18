"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

export type KolaTextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "prefix" | "value" | "defaultValue" | "onChange"
> & {
  label: string;
  value?: string;
  defaultValue?: string;
  /** Reçoit le texte saisi. */
  onChange?: (value: string) => void;
  /** Texte d'aide sous le champ. */
  helper?: string;
  /** Erreur imposée de l'extérieur (prioritaire sur validate). */
  error?: string | null;
  /** Vérifie la valeur après le premier passage dans le champ. Renvoie un message ou null. */
  validate?: (value: string) => string | null;
  /** Icône SVG à gauche. */
  prefixIcon?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Mot de passe : texte masqué avec un bouton Afficher / Masquer. */
  obscure?: boolean;
};

/**
 * Champ de texte Kola UI : label, aide, erreur, validation, mot de passe masquable.
 *
 * <KolaTextField
 *   label="E-mail"
 *   placeholder="nom@exemple.cm"
 *   validate={(v) => (v.includes("@") ? null : "Adresse e-mail incomplète")}
 * />
 */
export function KolaTextField({
  label,
  value,
  defaultValue = "",
  onChange,
  helper,
  error,
  validate,
  prefixIcon,
  prefix,
  suffix,
  obscure = false,
  id,
  type = "text",
  className = "",
  disabled,
  onBlur,
  ...rest
}: KolaTextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [inner, setInner] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const [hidden, setHidden] = useState(true);

  const current = value ?? inner;
  const message = error ?? (touched && validate ? validate(current) : null);
  const descId = message || helper ? `${inputId}-desc` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-semibold text-kola-ink">
        {label}
      </label>
      <div
        className={`flex min-h-12 items-center gap-2.5 rounded-kola border bg-kola-surface px-3.5 transition [&_svg]:size-5 ${
          message
            ? "border-kola-danger ring-1 ring-kola-danger"
            : "border-kola-line-strong focus-within:border-kola-primary focus-within:ring-1 focus-within:ring-kola-primary"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {prefixIcon && (
          <span aria-hidden className="flex text-kola-ink-subtle">
            {prefixIcon}
          </span>
        )}
        {prefix}
        <input
          id={inputId}
          value={current}
          disabled={disabled}
          type={obscure && hidden ? "password" : obscure ? "text" : type}
          aria-invalid={message ? true : undefined}
          aria-describedby={descId}
          onChange={(e) => {
            setInner(e.target.value);
            onChange?.(e.target.value);
          }}
          onBlur={(e) => {
            setTouched(true);
            onBlur?.(e);
          }}
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-kola-ink outline-none placeholder:text-kola-ink-subtle"
          {...rest}
        />
        {suffix}
        {obscure && (
          <button
            type="button"
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? "Afficher" : "Masquer"}
            title={hidden ? "Afficher" : "Masquer"}
            className="-mr-1.5 flex size-9 items-center justify-center rounded-lg text-kola-ink-subtle hover:text-kola-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {!hidden && <path d="M3 3l18 18" />}
            </svg>
          </button>
        )}
      </div>
      {(message || helper) && (
        <p id={descId} className={`text-sm ${message ? "text-kola-danger" : "text-kola-ink-subtle"}`}>
          {message ?? helper}
        </p>
      )}
    </div>
  );
}
