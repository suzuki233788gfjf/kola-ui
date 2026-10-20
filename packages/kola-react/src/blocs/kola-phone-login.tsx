"use client";

import { useState } from "react";
import { KolaButton } from "../kola-button";
import { KolaOtpField } from "../kola-otp-field";
import { KolaPhoneField, formatPhone, validatePhone } from "../kola-phone-field";

export type KolaPhoneLoginProps = {
  /** Envoie le code par SMS. Reçoit le numéro sans espaces (ex. "677123456"). */
  onSendCode: (phone: string) => Promise<void>;
  /** Vérifie le code. Renvoie true si c'est le bon. */
  onVerify: (phone: string, code: string) => Promise<boolean>;
  /** Appelé une fois connecté. */
  onSuccess?: (phone: string) => void;
  title?: string;
  codeLength?: number;
  className?: string;
};

/**
 * Bloc « Connexion par téléphone » : numéro +237, puis code reçu par SMS.
 * Le bloc gère l'écran ; l'envoi du SMS et la vérification passent par TON serveur.
 *
 * <KolaPhoneLogin
 *   onSendCode={async (numero) => { await fetch("/api/sms", { method: "POST", body: numero }); }}
 *   onVerify={async (numero, code) => (await fetch(`/api/verifier?code=${code}`)).ok}
 *   onSuccess={() => router.push("/accueil")}
 * />
 */
export function KolaPhoneLogin({ onSendCode, onVerify, onSuccess, title = "Connexion", codeLength = 6, className = "" }: KolaPhoneLoginProps) {
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = validatePhone(phone) === null;
  const shown = `+237 ${formatPhone(phone)}`;

  const send = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSendCode(phone);
      setCode("");
      setStep("code");
    } catch {
      setError("Impossible d'envoyer le SMS. Réessaie.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      if (await onVerify(phone, value)) {
        setStep("done");
        onSuccess?.(phone);
      } else {
        setCode("");
        setError("Code incorrect. Réessaie.");
      }
    } catch {
      setCode("");
      setError("Vérification impossible. Réessaie.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`w-full max-w-[400px] rounded-[20px] border border-kola-line bg-kola-surface p-6 text-kola-ink sm:p-7 ${className}`}>
      {step === "phone" && (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-kola-ink-subtle">Entre ton numéro : on t&apos;envoie un code par SMS.</p>
          </div>
          <KolaPhoneField
            label="Numéro de téléphone"
            value={phone}
            onChange={(p) => {
              setPhone(p);
              setError(null);
            }}
          />
          {error && (
            <p role="alert" className="text-sm text-kola-danger">
              {error}
            </p>
          )}
          <KolaButton type="submit" label="Recevoir le code" loading={busy} disabled={!valid} expanded />
        </form>
      )}

      {step === "code" && (
        <div className="flex flex-col gap-5">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setStep("phone");
              setError(null);
            }}
            className="flex items-center gap-1.5 self-start text-sm font-semibold text-kola-primary hover:underline disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-4">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Modifier le numéro
          </button>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Vérifie ton numéro</h2>
            <p className="text-kola-ink-subtle">
              Code envoyé au <b className="font-semibold text-kola-ink">{shown}</b>.
            </p>
          </div>
          <KolaOtpField
            length={codeLength}
            value={code}
            autoFocus
            error={error}
            onChange={(c) => {
              setCode(c);
              setError(null);
            }}
            onComplete={verify}
            onResend={() => onSendCode(phone)}
          />
          {busy && (
            <p role="status" className="flex items-center gap-2 text-sm text-kola-ink-subtle">
              <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-kola-primary border-t-transparent" />
              Vérification…
            </p>
          )}
        </div>
      )}

      {step === "done" && (
        <div role="status" className="flex flex-col items-center gap-2 py-4 text-center">
          <span aria-hidden className="mb-2 flex size-16 items-center justify-center rounded-full bg-kola-primary/12 text-kola-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-8">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Bienvenue !</h2>
          <p className="text-kola-ink-subtle">Tu es connecté avec le {shown}.</p>
        </div>
      )}
    </div>
  );
}
