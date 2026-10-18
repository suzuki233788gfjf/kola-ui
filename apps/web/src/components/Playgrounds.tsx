"use client";

import { useState } from "react";
import { ColorPicker, DEFAULT_COLOR, Playground, TextInput, Toggle, dartString } from "./Playground";

const flag = (b: boolean) => (b ? "1" : undefined);
const lines = (...l: (string | null | false)[]) => l.filter(Boolean).join("\n");

/* ---------- Bouton ---------- */

const VARIANTS = [
  { id: "primary", label: "Principal" },
  { id: "secondary", label: "Secondaire" },
  { id: "outline", label: "Contour" },
  { id: "text", label: "Texte" },
] as const;
type Variant = (typeof VARIANTS)[number]["id"];

function ButtonPlayground() {
  const [variant, setVariant] = useState<Variant>("primary");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [label, setLabel] = useState("Valider");
  const [icon, setIcon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  const usage = lines(
    "KolaButton(",
    `  label: ${dartString(label)},`,
    variant !== "primary" && `  variant: KolaButtonVariant.${variant},`,
    icon && "  icon: Icons.check,",
    loading && "  loading: true,",
    "  onPressed: () {},",
    ")",
  );

  return (
    <Playground
      slug="bouton"
      color={color}
      usage={usage}
      params={{ variant, color, label, icon: flag(icon), loading: flag(loading), dark: flag(dark) }}
      controls={
        <>
          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold">Variante</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-chip p-1">
              {VARIANTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={variant === v.id}
                  onClick={() => setVariant(v.id)}
                  className={`min-h-10 rounded-[9px] text-sm ${
                    variant === v.id ? "bg-surface font-semibold text-ink" : "text-ink-muted"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </fieldset>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="label" label="Texte du bouton" value={label} onChange={setLabel} />
          <Toggle label="Icône" checked={icon} onChange={setIcon} />
          <Toggle label="Chargement" checked={loading} onChange={setLoading} />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
        </>
      }
    />
  );
}

/* ---------- Champ de texte ---------- */

function TextFieldPlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [label, setLabel] = useState("E-mail");
  const [helper, setHelper] = useState("");
  const [icon, setIcon] = useState(true);
  const [password, setPassword] = useState(false);
  const [error, setError] = useState(false);
  const [dark, setDark] = useState(false);

  const usage = lines(
    "KolaTextField(",
    `  label: ${dartString(label)},`,
    !password && "  hint: 'nom@exemple.cm',",
    helper && `  helper: ${dartString(helper)},`,
    icon && `  prefixIcon: Icons.${password ? "lock_outline" : "mail_outline"},`,
    password && "  obscure: true,",
    error
      ? "  validator: (v) => (v ?? '').contains('@') ? null : 'Adresse e-mail incomplète',"
      : null,
    ")",
  );

  return (
    <Playground
      slug="champ-de-texte"
      color={color}
      usage={usage}
      params={{
        color,
        label,
        helper: helper || undefined,
        icon: flag(icon),
        password: flag(password),
        error: flag(error),
        dark: flag(dark),
      }}
      controls={
        <>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="label" label="Label" value={label} onChange={setLabel} />
          <TextInput id="helper" label="Texte d'aide (optionnel)" value={helper} onChange={setHelper} />
          <Toggle label="Icône" checked={icon} onChange={setIcon} />
          <Toggle label="Mot de passe" checked={password} onChange={setPassword} />
          <Toggle label="Afficher une erreur" checked={error} onChange={setError} />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
        </>
      }
    />
  );
}

/* ---------- Téléphone +237 ---------- */

function PhonePlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [label, setLabel] = useState("Téléphone");
  const [value, setValue] = useState("677123456");
  const [dark, setDark] = useState(false);

  const usage = lines(
    "KolaPhoneField(",
    label !== "Téléphone" && `  label: ${dartString(label)},`,
    "  onChanged: (numero) {",
    "    // numero = '677123456' (sans espaces)",
    "  },",
    ")",
  );

  return (
    <Playground
      slug="telephone-237"
      color={color}
      usage={usage}
      params={{ color, label, value: value.replace(/\D/g, "") || undefined, dark: flag(dark) }}
      controls={
        <>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="label" label="Label" value={label} onChange={setLabel} />
          <TextInput id="value" label="Numéro d'exemple" value={value} onChange={setValue} inputMode="tel" />
          <p className="text-sm leading-relaxed text-ink-muted">
            Essaie <code className="font-mono">699…</code> pour Orange, <code className="font-mono">677…</code> pour MTN.
            Tu peux aussi taper directement dans l&apos;aperçu.
          </p>
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
        </>
      }
    />
  );
}

/* ---------- Montant FCFA ---------- */

function AmountPlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [label, setLabel] = useState("Montant");
  const [value, setValue] = useState("25000");
  const [dark, setDark] = useState(false);

  const usage = lines(
    "KolaAmountField(",
    label !== "Montant" && `  label: ${dartString(label)},`,
    "  min: 100,",
    "  onChanged: (montant) {",
    "    // montant = 25000 (un int, sans espaces)",
    "  },",
    ")",
  );

  return (
    <Playground
      slug="montant-fcfa"
      color={color}
      usage={usage}
      params={{ color, label, value: value.replace(/\D/g, "") || undefined, dark: flag(dark) }}
      controls={
        <>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="label" label="Label" value={label} onChange={setLabel} />
          <TextInput id="value" label="Montant d'exemple" value={value} onChange={setValue} inputMode="numeric" />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
        </>
      }
    />
  );
}


/* ---------- Mobile Money ---------- */

function MobileMoneyPlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [title, setTitle] = useState("Payer par Mobile Money");
  const [fixed, setFixed] = useState(false);
  const [amount, setAmount] = useState("5000");
  const [dark, setDark] = useState(false);
  const amountValue = amount.replace(/\D/g, "");

  const usage = lines(
    "KolaMobileMoneyForm(",
    title !== "Payer par Mobile Money" && `  title: ${dartString(title)},`,
    fixed && amountValue && `  amount: ${amountValue},`,
    "  onPay: (demande) async {",
    "    // demande.phone    → '677123456'",
    "    // demande.operator → KolaOperator.mtn ou KolaOperator.orange",
    "    // demande.amount   → 25000",
    "    //",
    "    // Appelle ici ton fournisseur de paiement (Campay, Notch Pay, CinetPay…)",
    "    // et attends que le client confirme sur son téléphone.",
    "    // En cas d'échec :",
    "    // throw const KolaMobileMoneyException('Solde insuffisant');",
    "  },",
    ")",
  );

  return (
    <Playground
      slug="mobile-money"
      color={color}
      height={640}
      usage={usage}
      params={{
        color,
        title,
        amount: fixed ? amountValue || undefined : undefined,
        dark: flag(dark),
      }}
      controls={
        <>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="title" label="Titre" value={title} onChange={setTitle} />
          <Toggle label="Montant imposé" checked={fixed} onChange={setFixed} />
          {fixed && (
            <TextInput id="amount" label="Montant (FCFA)" value={amount} onChange={setAmount} inputMode="numeric" />
          )}
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
          <p className="text-sm leading-relaxed text-ink-muted">
            L&apos;aperçu simule le paiement : 3 secondes d&apos;attente, puis succès. Un numéro qui finit par{" "}
            <code className="font-mono">0</code> simule un échec.
          </p>
        </>
      }
    />
  );
}


/* ---------- Date picker ---------- */

function DatePickerPlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [range, setRange] = useState(true);
  const [dark, setDark] = useState(false);

  const usage = range
    ? lines(
        "final periode = await KolaDatePicker.showRange(context);",
        "if (periode != null) {",
        "  print('Du ${periode.start} au ${periode.end}');",
        "}",
      )
    : lines(
        "final date = await KolaDatePicker.show(context);",
        "if (date != null) {",
        "  print(KolaDateFr.date(date)); // '12 oct. 2026'",
        "}",
      );

  return (
    <Playground
      slug="date-picker"
      color={color}
      height={560}
      usage={usage}
      params={{ color, range: range ? "1" : "0", dark: flag(dark) }}
      controls={
        <>
          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold">Mode</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-chip p-1">
              {[
                [false, "Une date"],
                [true, "Période"],
              ].map(([v, l]) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={range === v}
                  onClick={() => setRange(v as boolean)}
                  className={`min-h-10 rounded-[9px] text-sm ${
                    range === v ? "bg-surface font-semibold text-ink" : "text-ink-muted"
                  }`}
                >
                  {l as string}
                </button>
              ))}
            </div>
          </fieldset>
          <ColorPicker value={color} onChange={setColor} />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
          <p className="text-sm leading-relaxed text-ink-muted">
            Choisis des dates dans l&apos;aperçu puis clique sur « Valider ».
          </p>
        </>
      }
    />
  );
}

/* ---------- Confirmation ---------- */

function ConfirmPlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [title, setTitle] = useState("Supprimer cet article ?");
  const [confirm, setConfirm] = useState("Supprimer");
  const [destructive, setDestructive] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [dark, setDark] = useState(false);

  const usage = lines(
    "final ok = await KolaConfirm.show(",
    "  context,",
    `  title: ${dartString(title)},`,
    "  message: 'Cette action est définitive.',",
    `  confirmLabel: ${dartString(confirm)},`,
    destructive && "  destructive: true,",
    sheet && "  sheet: true,",
    ");",
    "if (ok) {",
    "  // l'utilisateur a confirmé",
    "}",
  );

  return (
    <Playground
      slug="confirmation"
      color={color}
      usage={usage}
      params={{
        color,
        label: title,
        confirm,
        destructive: flag(destructive),
        sheet: flag(sheet),
        dark: flag(dark),
      }}
      controls={
        <>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="title" label="Question" value={title} onChange={setTitle} />
          <TextInput id="confirm" label="Bouton de confirmation" value={confirm} onChange={setConfirm} />
          <Toggle label="Action dangereuse (rouge)" checked={destructive} onChange={setDestructive} />
          <Toggle label="Panneau du bas (mobile)" checked={sheet} onChange={setSheet} />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
          <p className="text-sm leading-relaxed text-ink-muted">Clique sur le bouton de l&apos;aperçu pour l&apos;ouvrir.</p>
        </>
      }
    />
  );
}

/* ---------- Notifications ---------- */

const TOAST_TYPES = [
  { id: "success", label: "Succès" },
  { id: "error", label: "Erreur" },
  { id: "info", label: "Info" },
  { id: "warning", label: "Alerte" },
] as const;
type ToastType = (typeof TOAST_TYPES)[number]["id"];

function ToastPlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [type, setType] = useState<ToastType>("success");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("Paiement reçu : 25 000 FCFA");
  const [dark, setDark] = useState(false);

  const usage = lines(
    "KolaToast.show(",
    "  context,",
    `  ${dartString(message)},`,
    title && `  title: ${dartString(title)},`,
    `  type: KolaToastType.${type},`,
    ");",
  );

  return (
    <Playground
      slug="notifications"
      color={color}
      usage={usage}
      params={{ color, type, title: title || undefined, message, dark: flag(dark) }}
      controls={
        <>
          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold">Type</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-chip p-1">
              {TOAST_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={type === t.id}
                  onClick={() => setType(t.id)}
                  className={`min-h-10 rounded-[9px] text-sm ${
                    type === t.id ? "bg-surface font-semibold text-ink" : "text-ink-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="title" label="Titre (optionnel)" value={title} onChange={setTitle} />
          <TextInput id="message" label="Message" value={message} onChange={setMessage} />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
        </>
      }
    />
  );
}

export const PLAYGROUNDS: Record<string, () => React.JSX.Element> = {
  bouton: ButtonPlayground,
  "champ-de-texte": TextFieldPlayground,
  "telephone-237": PhonePlayground,
  "montant-fcfa": AmountPlayground,
  "mobile-money": MobileMoneyPlayground,
  "date-picker": DatePickerPlayground,
  confirmation: ConfirmPlayground,
  notifications: ToastPlayground,
};
