"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type KolaButtonVariant = "primary" | "secondary" | "outline" | "text";

export type KolaButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  variant?: KolaButtonVariant;
  /** Une icône SVG, par exemple <CheckIcon />. */
  icon?: ReactNode;
  /** Affiche un indicateur et bloque les clics. */
  loading?: boolean;
  /** Prend toute la largeur disponible. */
  expanded?: boolean;
};

const VARIANTS: Record<KolaButtonVariant, string> = {
  primary: "bg-kola-primary text-kola-on-primary hover:brightness-110",
  secondary: "bg-kola-primary/12 text-kola-primary hover:bg-kola-primary/20",
  outline: "border border-kola-line-strong text-kola-ink hover:border-kola-primary hover:text-kola-primary",
  text: "text-kola-primary hover:bg-kola-primary/10",
};

/**
 * Bouton Kola UI.
 *
 * <KolaButton label="Valider" onClick={() => {}} />
 * <KolaButton label="Envoi…" loading />
 */
export function KolaButton({
  label,
  variant = "primary",
  icon,
  loading = false,
  expanded = false,
  type = "button",
  className = "",
  onClick,
  ...rest
}: KolaButtonProps) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-kola px-5 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kola-primary disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5 ${
        loading ? "cursor-progress" : ""
      } ${expanded ? "w-full" : ""} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      <span>{label}</span>
    </button>
  );
}
