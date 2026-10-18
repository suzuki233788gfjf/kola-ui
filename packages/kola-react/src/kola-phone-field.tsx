"use client";

import { useState } from "react";
import { KolaTextField, type KolaTextFieldProps } from "./kola-text-field";

export type KolaOperator = "mtn" | "orange";

/** Préfixes : MTN 67, 68, 650–654 · Orange 69, 655–659. */
export function detectOperator(input: string): KolaOperator | null {
  const d = input.replace(/\D/g, "");
  if (d.length < 2) return null;
  const p2 = d.slice(0, 2);
  if (p2 === "67" || p2 === "68") return "mtn";
  if (p2 === "69") return "orange";
  if (p2 === "65" && d.length >= 3) return Number(d[2]) <= 4 ? "mtn" : "orange";
  return null;
}

/** "677123456" → "6 77 12 34 56" */
export function formatPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 9);
  return [d.slice(0, 1), d.slice(1, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

export function validatePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (!d) return "Numéro requis";
  if (!d.startsWith("6")) return "Un numéro mobile commence par 6";
  if (d.length < 9) return "Numéro incomplet (9 chiffres)";
  return null;
}

/** Garde 9 chiffres ; enlève l'indicatif 237 s'il a été collé avec le numéro. */
function digitsOf(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.length > 9 && d.startsWith("237")) d = d.slice(3);
  return d.slice(0, 9);
}

export type KolaPhoneFieldProps = Omit<
  KolaTextFieldProps,
  "label" | "value" | "defaultValue" | "onChange" | "prefix" | "suffix" | "validate"
> & {
  label?: string;
  /** Numéro sans espaces, ex. "677123456". */
  value?: string;
  defaultValue?: string;
  /** Reçoit le numéro sans espaces et l'opérateur détecté. */
  onChange?: (phone: string, operator: KolaOperator | null) => void;
};

/**
 * Champ téléphone Cameroun (+237) : formatage « 6 77 12 34 56 » et détection MTN / Orange.
 *
 * <KolaPhoneField onChange={(numero) => console.log(numero)} /> // "677123456"
 */
export function KolaPhoneField({ label = "Téléphone", value, defaultValue = "", onChange, ...rest }: KolaPhoneFieldProps) {
  const [inner, setInner] = useState(digitsOf(defaultValue));
  const digits = value !== undefined ? digitsOf(value) : inner;
  const operator = detectOperator(digits);

  return (
    <KolaTextField
      label={label}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="6 XX XX XX XX"
      value={formatPhone(digits)}
      onChange={(v) => {
        const d = digitsOf(v);
        setInner(d);
        onChange?.(d, detectOperator(d));
      }}
      validate={validatePhone}
      prefix={<span className="border-r border-kola-line pr-2.5 text-kola-ink-muted">+237</span>}
      suffix={operator && <KolaOperatorBadge operator={operator} />}
      {...rest}
    />
  );
}

export function KolaOperatorBadge({ operator }: { operator: KolaOperator }) {
  const mtn = operator === "mtn";
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-bold text-[#1a1712] ${mtn ? "bg-[#ffcb05]" : "bg-[#ff7900]"}`}
    >
      {mtn ? "MTN" : "Orange"}
    </span>
  );
}
