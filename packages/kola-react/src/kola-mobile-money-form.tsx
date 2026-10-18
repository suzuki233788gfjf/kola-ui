"use client";

import { useRef, useState, type ReactNode } from "react";
import { KolaAmountField, formatAmount } from "./kola-amount-field";
import { KolaPhoneField, detectOperator, formatPhone, validatePhone, type KolaOperator } from "./kola-phone-field";

/** Ce que le formulaire envoie quand le client clique sur « Payer ». */
export type KolaMobileMoneyRequest = {
  /** Numéro sans espaces, ex. "677123456". */
  phone: string;
  operator: KolaOperator;
  /** Montant en FCFA. */
  amount: number;
};

/** Lance cette erreur dans onPay pour afficher ton propre message d'échec. */
export class KolaMobileMoneyError extends Error {}

type Step = "form" | "pending" | "success" | "failure";

const OPERATOR_NAME: Record<KolaOperator, string> = { mtn: "MTN MoMo", orange: "Orange Money" };

export type KolaMobileMoneyFormProps = {
  /**
   * Appelé au clic sur « Payer ». La promesse doit se terminer quand le client a
   * confirmé le paiement ; lance une erreur en cas d'échec.
   */
  onPay: (request: KolaMobileMoneyRequest) => Promise<void>;
  /** Montant imposé (ex. prix d'un produit). Sinon, le client le saisit. */
  amount?: number;
  minAmount?: number;
  title?: string;
  className?: string;
};

/**
 * Formulaire de paiement Mobile Money (MTN MoMo, Orange Money).
 * Le composant gère l'interface ; le paiement passe par TON fournisseur
 * (Campay, Notch Pay, CinetPay…), que tu appelles dans onPay.
 *
 * <KolaMobileMoneyForm
 *   onPay={async (demande) => {
 *     await fetch("/api/paiement", { method: "POST", body: JSON.stringify(demande) });
 *     // En cas d'échec : throw new KolaMobileMoneyError("Solde insuffisant");
 *   }}
 * />
 */
export function KolaMobileMoneyForm({
  onPay,
  amount: fixedAmount,
  minAmount = 100,
  title = "Payer par Mobile Money",
  className = "",
}: KolaMobileMoneyFormProps) {
  const [phone, setPhone] = useState("");
  const [typedAmount, setTypedAmount] = useState<number | null>(null);
  const [operator, setOperator] = useState<KolaOperator | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [formError, setFormError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [failure, setFailure] = useState("");
  const [request, setRequest] = useState<KolaMobileMoneyRequest | null>(null);
  const attempt = useRef(0);

  const amount = fixedAmount ?? typedAmount;

  async function pay() {
    setFormError(null);
    const phoneMessage = validatePhone(phone);
    setPhoneError(phoneMessage);
    if (amount === null || amount < minAmount) {
      setFormError(`Indique un montant d'au moins ${formatAmount(minAmount)} FCFA`);
      return;
    }
    if (phoneMessage) return;
    if (!operator) {
      setFormError("Choisis ton opérateur");
      return;
    }
    const req = { phone, operator, amount };
    const current = ++attempt.current;
    setRequest(req);
    setStep("pending");
    try {
      await onPay(req);
      if (current === attempt.current) setStep("success");
    } catch (e) {
      if (current !== attempt.current) return;
      setFailure(
        e instanceof KolaMobileMoneyError
          ? e.message
          : "Solde insuffisant ou demande refusée. Aucun montant n'a été débité.",
      );
      setStep("failure");
    }
  }

  function backToForm() {
    attempt.current++; // ignore le résultat d'une demande abandonnée
    setStep("form");
  }

  return (
    <div className={`w-full rounded-[20px] border border-kola-line bg-kola-surface p-6 text-kola-ink ${className}`}>
      {step === "form" && (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            pay();
          }}
        >
          <h2 className="text-xl font-bold">{title}</h2>
          <div role="radiogroup" aria-label="Opérateur" className="grid grid-cols-2 gap-2.5">
            {(["mtn", "orange"] as const).map((op) => (
              <button
                key={op}
                type="button"
                role="radio"
                aria-checked={operator === op}
                onClick={() => setOperator(op)}
                className={`flex min-h-14 items-center gap-2.5 rounded-kola border px-3 text-left text-sm font-semibold transition ${
                  operator === op
                    ? "border-kola-primary bg-kola-primary/10 ring-1 ring-kola-primary"
                    : "border-kola-line-strong hover:border-kola-ink-subtle"
                }`}
              >
                <span
                  aria-hidden
                  className={`size-6 shrink-0 rounded-full ${op === "mtn" ? "bg-[#ffcb05]" : "bg-[#ff7900]"}`}
                />
                {OPERATOR_NAME[op]}
              </button>
            ))}
          </div>
          <KolaPhoneField
            value={phone}
            error={phoneError}
            onChange={(p) => {
              setPhone(p);
              setPhoneError(null);
              const detected = detectOperator(p);
              if (detected) setOperator(detected);
            }}
          />
          {fixedAmount === undefined ? (
            <KolaAmountField value={typedAmount} min={minAmount} onChange={setTypedAmount} />
          ) : (
            <div className="flex items-center justify-between rounded-kola bg-kola-surface-muted px-4 py-3">
              <span className="text-sm font-semibold">Montant</span>
              <span className="text-lg font-bold">{formatAmount(fixedAmount)} FCFA</span>
            </div>
          )}
          {formError && (
            <p role="alert" className="text-sm text-kola-danger">
              {formError}
            </p>
          )}
          <button
            type="submit"
            className="min-h-12 rounded-kola bg-kola-primary px-5 font-semibold text-kola-on-primary hover:brightness-110"
          >
            {amount === null ? "Payer" : `Payer ${formatAmount(amount)} FCFA`}
          </button>
          <p className="text-center text-sm text-kola-ink-subtle">
            Tu recevras une demande de confirmation sur ton téléphone.
          </p>
        </form>
      )}

      {step === "pending" && request && (
        <Status
          icon={<span className="size-10 animate-spin rounded-full border-4 border-kola-primary border-t-transparent" />}
          title="Confirme sur ton téléphone"
          message={`Une demande de ${formatAmount(request.amount)} FCFA a été envoyée au ${formatPhone(
            request.phone,
          )}. Valide-la avec ton code secret ${OPERATOR_NAME[request.operator]}.`}
          action={
            <button
              type="button"
              onClick={backToForm}
              className="min-h-12 rounded-kola border border-kola-line-strong px-5 font-semibold hover:border-kola-ink"
            >
              Annuler
            </button>
          }
        />
      )}

      {step === "success" && request && (
        <Status
          icon={<Badge tone="bg-kola-success" path="M5 12.5l4.5 4.5L19 7.5" />}
          title="Paiement reçu"
          message={`${formatAmount(request.amount)} FCFA · ${OPERATOR_NAME[request.operator]} · ${formatPhone(
            request.phone,
          )}`}
          action={
            <button
              type="button"
              onClick={() => {
                setPhone("");
                setTypedAmount(null);
                setOperator(null);
                setStep("form");
              }}
              className="min-h-12 rounded-kola bg-kola-primary/12 px-5 font-semibold text-kola-primary hover:bg-kola-primary/20"
            >
              Nouveau paiement
            </button>
          }
        />
      )}

      {step === "failure" && (
        <Status
          icon={<Badge tone="bg-kola-danger" path="M7 7l10 10M17 7L7 17" />}
          title="Paiement non abouti"
          message={failure}
          action={
            <button
              type="button"
              onClick={backToForm}
              className="min-h-12 rounded-kola bg-kola-primary px-5 font-semibold text-kola-on-primary hover:brightness-110"
            >
              Réessayer
            </button>
          }
        />
      )}
    </div>
  );
}

function Status({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-4 text-center">
      {icon}
      <h2 className="mt-2 text-xl font-bold">{title}</h2>
      <p className="leading-relaxed text-kola-ink-muted">{message}</p>
      <div className="mt-3 flex w-full flex-col">{action}</div>
    </div>
  );
}

function Badge({ tone, path }: { tone: string; path: string }) {
  return (
    <span className={`flex size-14 items-center justify-center rounded-full text-kola-bg ${tone}`}>
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
