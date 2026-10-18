"use client";

import { useState } from "react";
import { KolaTextField, type KolaTextFieldProps } from "./kola-text-field";

/** 1250000 → "1 250 000" */
export function formatAmount(value: number): string {
  const s = String(Math.trunc(Math.abs(value)));
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += " ";
    out += s[i];
  }
  return value < 0 ? `-${out}` : out;
}

/** "1 250 000" → 1250000 (null si vide) */
export function parseAmount(text: string): number | null {
  const d = text.replace(/\D/g, "");
  return d ? Number(d) : null;
}

export type KolaAmountFieldProps = Omit<
  KolaTextFieldProps,
  "label" | "value" | "defaultValue" | "onChange" | "suffix" | "validate" | "min" | "max"
> & {
  label?: string;
  /** Montant en FCFA (null = vide). */
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  /** Reçoit le montant en nombre entier (null si le champ est vide). */
  onChange?: (amount: number | null) => void;
};

/**
 * Champ montant en FCFA : séparateur de milliers pendant la saisie, pas de décimales.
 *
 * <KolaAmountField min={100} onChange={(montant) => console.log(montant)} /> // 25000
 */
export function KolaAmountField({
  label = "Montant",
  value,
  defaultValue = null,
  min,
  max,
  onChange,
  ...rest
}: KolaAmountFieldProps) {
  const [inner, setInner] = useState<number | null>(defaultValue);
  const amount = value !== undefined ? value : inner;

  return (
    <KolaTextField
      label={label}
      inputMode="numeric"
      placeholder="0"
      value={amount === null ? "" : formatAmount(amount)}
      onChange={(v) => {
        const digits = v.replace(/\D/g, "");
        if (digits.length > 12) return;
        const next = digits ? Number(digits) : null;
        setInner(next);
        onChange?.(next);
      }}
      validate={() => {
        if (amount === null) return null;
        if (min !== undefined && amount < min) return `Minimum ${formatAmount(min)} FCFA`;
        if (max !== undefined && amount > max) return `Maximum ${formatAmount(max)} FCFA`;
        return null;
      }}
      suffix={<span className="text-sm font-semibold text-kola-ink-subtle">FCFA</span>}
      {...rest}
    />
  );
}
