"use client";

import { useState } from "react";
import { KolaButton } from "@kola/react/kola-button";
import { KolaTextField } from "@kola/react/kola-text-field";
import { KolaPhoneField } from "@kola/react/kola-phone-field";
import { KolaAmountField, formatAmount } from "@kola/react/kola-amount-field";
import { KolaMobileMoneyForm, KolaMobileMoneyError } from "@kola/react/kola-mobile-money-form";
import { KolaDatePicker, KolaDateFr, type KolaDateRange } from "@kola/react/kola-date-picker";
import { useKolaConfirm } from "@kola/react/kola-confirm";
import { KolaToastView, useKolaToast, type KolaToastType } from "@kola/react/kola-toast";
import { KolaSelect } from "@kola/react/kola-select";
import { KolaCard, KolaStatCard, formatChange } from "@kola/react/kola-card";
import { KolaDataTable } from "@kola/react/kola-data-table";
import { ColorPicker, DEFAULT_COLOR, HtmlAssetsContext, Playground, TextInput, Toggle, dartString, jsxString } from "./Playground";

const flag = (b: boolean) => (b ? "1" : undefined);
const lines = (...l: (string | null | false | undefined)[]) => l.filter(Boolean).join("\n");

/* Petites icônes pour les aperçus React (dans ton projet, utilise tes propres icônes). */
const Svg = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
/** Échappe un texte pour du HTML. */
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Attribut texte d'un template Vue. */
const vAttr = (name: string, value: string) => `${name}="${esc(value)}"`;
/** Chaîne JS sûre dans un <script> HTML. */
const js = (t: string) => JSON.stringify(t).replace(/</g, "\\u003c");
const box = (width: number, html: string) => `<div style="width:${width}px;max-width:100%">\n${html}\n</div>`;
const SVG = (d: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const CHECK_SVG = SVG("M5 12.5l4.5 4.5L19 7.5");
const MAIL_SVG = SVG("M3 6h18v12H3zM3 7l9 6 9-6");
const LOCK_SVG = SVG("M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3");
const BASKET_SVG = SVG("M4 10h16l-1.5 10h-13zM8 10l4-6 4 6");
const MONEY_SVG = SVG("M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z");

const CheckIcon = () => <Svg d="M5 12.5l4.5 4.5L19 7.5" />;
const MailIcon = () => <Svg d="M3 6h18v12H3zM3 7l9 6 9-6" />;
const LockIcon = () => <Svg d="M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3" />;
const BasketIcon = () => <Svg d="M4 10h16l-1.5 10h-13zM8 10l4-6 4 6" />;
const MoneyIcon = () => <Svg d="M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />;

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
  const reactUsage = lines(
    "<KolaButton",
    `  ${jsxString("label", label)}`,
    variant !== "primary" && `  variant="${variant}"`,
    icon && "  icon={<CheckIcon />} // ton icône SVG",
    loading && "  loading",
    "  onClick={() => {}}",
    "/>",
  );

  const vueUsage = lines(
    "<KolaButton",
    `  ${vAttr("label", label)}`,
    variant !== "primary" && `  variant="${variant}"`,
    loading && "  loading",
    '  @click="valider"',
    icon ? ">\n  <template #icon><CheckIcon /></template>\n</KolaButton>" : "/>",
  );
  const htmlUsage = lines(
    `<button type="button" class="kola-btn kola-btn--${variant}${loading ? " is-loading" : ""}">`,
    loading ? '  <span class="kola-spinner" aria-hidden="true"></span>' : icon && `  ${CHECK_SVG}`,
    `  ${esc(label)}`,
    "</button>",
  );
  const htmlPreview = undefined;

  return (
    <Playground
      slug="bouton"
      color={color}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={<KolaButton label={label} variant={variant} icon={icon ? <CheckIcon /> : undefined} loading={loading} />}
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
  const reactUsage = lines(
    "<KolaTextField",
    `  ${jsxString("label", label)}`,
    !password && '  placeholder="nom@exemple.cm"',
    helper && `  ${jsxString("helper", helper)}`,
    icon && `  prefixIcon={<${password ? "LockIcon" : "MailIcon"} />}`,
    password && "  obscure",
    error && '  validate={(v) => (v.includes("@") ? null : "Adresse e-mail incomplète")}',
    "  onChange={(valeur) => {}}",
    "/>",
  );

  const vueUsage = lines(
    "<KolaTextField",
    '  v-model="email"',
    `  ${vAttr("label", label)}`,
    !password && '  placeholder="nom@exemple.cm"',
    helper && `  ${vAttr("helper", helper)}`,
    password && "  obscure",
    error && `  :validate="(v) => (v.includes('@') ? null : 'Adresse e-mail incomplète')"`,
    icon ? `>\n  <template #icon><${password ? "LockIcon" : "MailIcon"} /></template>\n</KolaTextField>` : "/>",
  );
  const htmlUsage = lines(
    `<div class="kola-field${error ? " is-invalid" : ""}">`,
    `  <label class="kola-field__label" for="email">${esc(label)}</label>`,
    '  <div class="kola-field__box">',
    icon && `    ${password ? LOCK_SVG : MAIL_SVG}`,
    `    <input class="kola-field__input" id="email" name="email" type="${password ? "password" : "email"}"${password ? " data-kola-toggle" : ' placeholder="nom@exemple.cm"'} required data-error="${password ? "Mot de passe requis" : "Adresse e-mail incomplète"}">`,
    "  </div>",
    error ? '  <p class="kola-field__help">Adresse e-mail incomplète</p>' : helper && `  <p class="kola-field__help">${esc(helper)}</p>`,
    "</div>",
  );
  const htmlPreview = box(340, htmlUsage);

  return (
    <Playground
      slug="champ-de-texte"
      color={color}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={
        <KolaTextField
          className="w-full max-w-[340px]"
          label={label}
          placeholder={password ? undefined : "nom@exemple.cm"}
          helper={helper || undefined}
          prefixIcon={icon ? password ? <LockIcon /> : <MailIcon /> : undefined}
          obscure={password}
          error={error ? "Adresse e-mail incomplète" : null}
        />
      }
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
  const reactUsage = lines(
    "<KolaPhoneField",
    label !== "Téléphone" && `  ${jsxString("label", label)}`,
    "  onChange={(numero, operateur) => {",
    '    // numero = "677123456", operateur = "mtn" | "orange" | null',
    "  }}",
    "/>",
  );

  const digits = value.replace(/\D/g, "");
  const vueUsage = lines(
    `<KolaPhoneField v-model="numero"${label !== "Téléphone" ? " " + vAttr("label", label) : ""} />`,
    '<!-- numero = "677123456" (sans espaces) -->',
  );
  const htmlUsage = lines(
    '<div class="kola-field" data-kola-phone>',
    `  <label class="kola-field__label" for="tel">${esc(label)}</label>`,
    '  <div class="kola-field__box">',
    '    <span class="kola-field__prefix">+237</span>',
    `    <input class="kola-field__input" id="tel" name="telephone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="6 XX XX XX XX"${digits ? ` value="${digits}"` : ""}>`,
    "  </div>",
    "</div>",
  );
  const htmlPreview = box(340, htmlUsage);

  return (
    <Playground
      slug="telephone-237"
      color={color}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={<KolaPhoneField key={value} className="w-full max-w-[340px]" label={label} defaultValue={value} />}
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
  const sample = Number(value.replace(/\D/g, "")) || null;
  const reactUsage = lines(
    "<KolaAmountField",
    label !== "Montant" && `  ${jsxString("label", label)}`,
    "  min={100}",
    "  onChange={(montant) => {",
    "    // montant = 25000 (un nombre, ou null si vide)",
    "  }}",
    "/>",
  );

  const vueUsage = lines(
    `<KolaAmountField v-model="montant"${label !== "Montant" ? " " + vAttr("label", label) : ""} :min="100" />`,
    "<!-- montant = 25000 (un nombre, ou null si vide) -->",
  );
  const htmlUsage = lines(
    '<div class="kola-field" data-kola-amount data-min="100">',
    `  <label class="kola-field__label" for="montant">${esc(label)}</label>`,
    '  <div class="kola-field__box">',
    `    <input class="kola-field__input" id="montant" name="montant" placeholder="0"${sample ? ` value="${sample}"` : ""}>`,
    '    <span class="kola-field__suffix">FCFA</span>',
    "  </div>",
    "</div>",
  );
  const htmlPreview = box(340, htmlUsage);

  return (
    <Playground
      slug="montant-fcfa"
      color={color}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={<KolaAmountField key={value} className="w-full max-w-[340px]" label={label} min={100} defaultValue={sample} />}
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

/** Simulation : 3 secondes d'attente, échec si le numéro finit par 0. */
async function simulatePayment(demande: { phone: string }) {
  await new Promise((r) => setTimeout(r, 3000));
  if (demande.phone.endsWith("0")) throw new KolaMobileMoneyError("Solde insuffisant (simulation)");
}

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
  const reactUsage = lines(
    "<KolaMobileMoneyForm",
    title !== "Payer par Mobile Money" && `  ${jsxString("title", title)}`,
    fixed && amountValue && `  amount={${amountValue}}`,
    "  onPay={async (demande) => {",
    '    // demande.phone    → "677123456"',
    '    // demande.operator → "mtn" ou "orange"',
    "    // demande.amount   → 25000",
    "    //",
    "    // Appelle ici ton fournisseur de paiement (Campay, Notch Pay, CinetPay…)",
    "    // depuis ton serveur, et attends que le client confirme sur son téléphone.",
    "    // En cas d'échec :",
    '    // throw new KolaMobileMoneyError("Solde insuffisant");',
    "  }}",
    "/>",
  );

  const vueUsage = lines(
    "<KolaMobileMoneyForm",
    title !== "Payer par Mobile Money" && `  ${vAttr("title", title)}`,
    fixed && amountValue && `  :amount="${amountValue}"`,
    '  :on-pay="payer"',
    "/>",
    "",
    '<script setup lang="ts">',
    'import KolaMobileMoneyForm, { KolaMobileMoneyError } from "./kola/KolaMobileMoneyForm.vue";',
    "",
    "async function payer(demande) {",
    '  // demande.phone → "677123456", demande.operator → "mtn" ou "orange", demande.amount → 25000',
    "  // Appelle ici ton serveur, qui parle à ton fournisseur (Campay, Notch Pay, CinetPay…).",
    '  // En cas d\'échec : throw new KolaMobileMoneyError("Solde insuffisant");',
    "}",
    "</script>",
  );
  const htmlUsage = lines(
    '<div id="paiement"></div>',
    "<script>",
    '  KolaMobileMoney(document.getElementById("paiement"), {',
    title !== "Payer par Mobile Money" && `    title: ${js(title)},`,
    fixed && amountValue && `    amount: ${amountValue},`,
    "    onPay: async (demande) => {",
    '      // demande.phone → "677123456", demande.operator → "mtn" ou "orange", demande.amount → 25000',
    "      // Appelle ici ton serveur, qui parle à ton fournisseur (Campay, Notch Pay, CinetPay…).",
    '      // En cas d\'échec : throw new KolaMobileMoneyError("Solde insuffisant");',
    "    },",
    "  });",
    "</script>",
  );
  const htmlPreview = `<div id="paiement" style="width:400px;max-width:100%"></div>
<script>
KolaMobileMoney(document.getElementById("paiement"), {
  title: ${js(title)},${fixed && amountValue ? ` amount: ${amountValue},` : ""}
  onPay: async (d) => {
    await new Promise((r) => setTimeout(r, 3000));
    if (d.phone.endsWith("0")) throw new KolaMobileMoneyError("Solde insuffisant (simulation)");
  },
});
</script>`;

  return (
    <Playground
      slug="mobile-money"
      color={color}
      height={640}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={
        <KolaMobileMoneyForm
          key={`${fixed}-${amountValue}`}
          className="max-w-[400px]"
          title={title}
          amount={fixed && amountValue ? Number(amountValue) : undefined}
          onPay={simulatePayment}
        />
      }
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
  const reactUsage = range
    ? lines(
        "<KolaDatePicker",
        '  label="Période"',
        "  range",
        "  onChange={({ start, end }) => {",
        "    console.log(KolaDateFr.range(start, end)); // \"Du 12 au 16 oct. 2026\"",
        "  }}",
        "/>",
      )
    : lines(
        "<KolaDatePicker",
        '  label="Date de livraison"',
        "  onChange={({ start }) => {",
        "    console.log(KolaDateFr.date(start)); // \"12 oct. 2026\"",
        "  }}",
        "/>",
      );

  const vueUsage = range
    ? lines('<KolaDatePicker v-model="periode" label="Période" range />', "<!-- periode = { start: Date, end: Date } -->")
    : lines('<KolaDatePicker v-model="livraison" label="Date de livraison" />', "<!-- livraison = { start: Date, end: Date } (start = end) -->");
  const htmlUsage = lines(
    range
      ? '<div data-kola-date data-label="Période" data-range data-name="periode"></div>'
      : '<div data-kola-date data-label="Date de livraison" data-name="livraison"></div>',
    "",
    "<!-- Dans ton formulaire, le champ caché vaut " + (range ? '"2026-10-12/2026-10-16"' : '"2026-10-12"') + ". -->",
    "<script>",
    '  document.addEventListener("kola-change", (e) => {',
    range ? "    console.log(KolaDateFr.range(e.detail.start, e.detail.end)); // \"Du 12 au 16 oct. 2026\"" : "    console.log(KolaDateFr.date(e.detail.start)); // \"12 oct. 2026\"",
    "  });",
    "</script>",
  );
  const htmlPreview = `<div style="width:340px;max-width:100%;display:flex;flex-direction:column;gap:12px">
${range ? '<div data-kola-date data-label="Période" data-range></div>' : '<div data-kola-date data-label="Date de livraison"></div>'}
<p id="resultat" style="margin:0;font-size:14px;color:var(--kola-ink-subtle)">Clique sur le champ pour ouvrir le calendrier.</p>
</div>
<script>
document.addEventListener("kola-change", (e) => {
  document.getElementById("resultat").textContent = "Sélection : " + ${range ? "KolaDateFr.range(e.detail.start, e.detail.end)" : "KolaDateFr.date(e.detail.start)"};
});
</script>`;

  return (
    <Playground
      slug="date-picker"
      color={color}
      height={560}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={<DatePickerDemo key={String(range)} range={range} />}
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

function DatePickerDemo({ range }: { range: boolean }) {
  const [value, setValue] = useState<KolaDateRange | null>(null);
  return (
    <div className="flex w-full max-w-[340px] flex-col gap-3">
      <KolaDatePicker label={range ? "Période" : "Date de livraison"} range={range} value={value} onChange={setValue} />
      <p className="text-sm text-kola-ink-subtle">
        {value
          ? `Sélection : ${range ? KolaDateFr.range(value.start, value.end) : KolaDateFr.date(value.start)}`
          : "Clique sur le champ pour ouvrir le calendrier."}
      </p>
    </div>
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
  const reactUsage = lines(
    "const { confirm, dialog } = useKolaConfirm();",
    "",
    "async function supprimer() {",
    "  const ok = await confirm({",
    `    title: ${JSON.stringify(title)},`,
    '    message: "Cette action est définitive.",',
    `    confirmLabel: ${JSON.stringify(confirm)},`,
    destructive && "    destructive: true,",
    sheet && "    sheet: true,",
    "  });",
    "  if (ok) {",
    "    // l'utilisateur a confirmé",
    "  }",
    "}",
    "",
    "return (",
    "  <>",
    "    {dialog}",
    '    <KolaButton label="Supprimer l\'article" onClick={supprimer} />',
    "  </>",
    ");",
  );

  const confirmOptions = (indent: string) =>
    [
      `${indent}title: ${js(title)},`,
      `${indent}message: "Cette action est définitive.",`,
      `${indent}confirmLabel: ${js(confirm)},`,
      destructive && `${indent}destructive: true,`,
      sheet && `${indent}sheet: true,`,
    ].filter(Boolean) as string[];
  const vueUsage = lines(
    '<KolaConfirm ref="confirmer" />',
    '<KolaButton label="Supprimer l\'article" @click="supprimer" />',
    "",
    '<script setup lang="ts">',
    'import { ref } from "vue";',
    "",
    "const confirmer = ref();",
    "",
    "async function supprimer() {",
    "  const ok = await confirmer.value.open({",
    ...confirmOptions("    "),
    "  });",
    "  if (ok) {",
    "    // l'utilisateur a confirmé",
    "  }",
    "}",
    "</script>",
  );
  const htmlUsage = lines(
    `<button type="button" class="kola-btn kola-btn--${destructive ? "outline" : "primary"}" id="supprimer">Supprimer l'article</button>`,
    "<script>",
    '  document.getElementById("supprimer").addEventListener("click", async () => {',
    "    const ok = await kolaConfirm({",
    ...confirmOptions("      "),
    "    });",
    "    if (ok) {",
    "      // l'utilisateur a confirmé",
    "    }",
    "  });",
    "</script>",
  );
  const htmlPreview = htmlUsage
    .replace('<script>', '<p id="resultat" style="margin:0;font-size:14px;color:var(--kola-ink-subtle)">Clique sur le bouton pour ouvrir la confirmation.</p>\n<script>')
    .replace("    if (ok) {\n      // l'utilisateur a confirmé\n    }", '    document.getElementById("resultat").textContent = ok ? "Tu as confirmé." : "Tu as annulé.";');

  return (
    <Playground
      slug="confirmation"
      color={color}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={<ConfirmDemo title={title} confirmLabel={confirm} destructive={destructive} sheet={sheet} />}
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

function ConfirmDemo(props: { title: string; confirmLabel: string; destructive: boolean; sheet: boolean }) {
  const { confirm, dialog } = useKolaConfirm();
  const toast = useKolaToast();
  return (
    <>
      {dialog}
      <KolaButton
        label="Supprimer l'article"
        variant={props.destructive ? "outline" : "primary"}
        onClick={async () => {
          const ok = await confirm({ ...props, message: "Cette action est définitive." });
          toast(ok ? "Tu as confirmé." : "Tu as annulé.", { type: ok ? "success" : "info" });
        }}
      />
    </>
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
  const reactUsage = lines(
    "// Une fois, autour de ton application :",
    "// <KolaToastProvider><App /></KolaToastProvider>",
    "",
    "const toast = useKolaToast();",
    "",
    `toast(${JSON.stringify(message)}, {`,
    `  type: "${type}",`,
    title && `  title: ${JSON.stringify(title)},`,
    "});",
  );

  const toastOptions = `{ type: "${type}"${title ? `, title: ${js(title)}` : ""} }`;
  const vueUsage = lines(
    "<!-- Une fois, dans App.vue : <KolaToaster /> -->",
    "",
    '<script setup lang="ts">',
    'import { useKolaToast } from "./kola/KolaToaster.vue";',
    "",
    "const toast = useKolaToast();",
    `toast(${js(message)}, ${toastOptions});`,
    "</script>",
  );
  const htmlUsage = lines("<script>", `  kolaToast(${js(message)}, ${toastOptions});`, "</script>");
  const htmlPreview = `<div id="vue" style="width:380px;max-width:100%"></div>
<button type="button" class="kola-btn kola-btn--secondary" id="afficher" style="width:380px;max-width:100%">Afficher en vrai</button>
<script>
document.getElementById("vue").append(KolaToast.view(${js(message)}, ${toastOptions}));
document.getElementById("afficher").addEventListener("click", () => kolaToast(${js(message)}, ${toastOptions}));
</script>`;

  return (
    <Playground
      slug="notifications"
      color={color}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={<ToastDemo type={type} title={title || undefined} message={message} />}
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


function ToastDemo({ type, title, message }: { type: KolaToastType; title?: string; message: string }) {
  const toast = useKolaToast();
  return (
    <div className="flex w-full max-w-[380px] flex-col gap-6">
      <KolaToastView type={type} title={title} message={message} />
      <KolaButton label="Afficher en vrai" variant="secondary" onClick={() => toast(message, { type, title })} />
    </div>
  );
}

/* ---------- Sélecteur ---------- */

const CITIES = [
  { value: "dla", label: "Douala", subtitle: "Littoral" },
  { value: "yde", label: "Yaoundé", subtitle: "Centre" },
  { value: "bfm", label: "Bafoussam", subtitle: "Ouest" },
  { value: "bda", label: "Bamenda", subtitle: "Nord-Ouest" },
  { value: "grg", label: "Garoua", subtitle: "Nord" },
  { value: "mrw", label: "Maroua", subtitle: "Extrême-Nord" },
  { value: "ngd", label: "Ngaoundéré", subtitle: "Adamaoua" },
  { value: "btr", label: "Bertoua", subtitle: "Est" },
  { value: "ebw", label: "Ebolowa", subtitle: "Sud" },
  { value: "bea", label: "Buea", subtitle: "Sud-Ouest" },
  { value: "kri", label: "Kribi", subtitle: "Sud" },
  { value: "lmb", label: "Limbé", subtitle: "Sud-Ouest" },
];

function SelectDemo({ label }: { label: string }) {
  const [city, setCity] = useState<string | null>(null);
  return <KolaSelect className="w-full max-w-[340px]" label={label} options={CITIES} value={city} onChange={setCity} />;
}

function SelectPlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [label, setLabel] = useState("Ville");
  const [dark, setDark] = useState(false);

  const usage = lines(
    "KolaSelect<String>(",
    `  label: ${dartString(label)},`,
    "  value: ville,",
    "  options: const [",
    "    KolaSelectOption('dla', 'Douala', subtitle: 'Littoral'),",
    "    KolaSelectOption('yde', 'Yaoundé', subtitle: 'Centre'),",
    "    KolaSelectOption('bfm', 'Bafoussam', subtitle: 'Ouest'),",
    "  ],",
    "  onChanged: (v) => setState(() => ville = v),",
    ")",
  );
  const reactUsage = lines(
    "const [ville, setVille] = useState<string | null>(null);",
    "",
    "<KolaSelect",
    `  ${jsxString("label", label)}`,
    "  value={ville}",
    "  onChange={setVille}",
    "  options={[",
    '    { value: "dla", label: "Douala", subtitle: "Littoral" },',
    '    { value: "yde", label: "Yaoundé", subtitle: "Centre" },',
    '    { value: "bfm", label: "Bafoussam", subtitle: "Ouest" },',
    "  ]}",
    "/>",
  );

  const vueUsage = lines(
    "<KolaSelect",
    '  v-model="ville"',
    `  ${vAttr("label", label)}`,
    '  :options="[',
    "    { value: 'dla', label: 'Douala', subtitle: 'Littoral' },",
    "    { value: 'yde', label: 'Yaoundé', subtitle: 'Centre' },",
    "    { value: 'bfm', label: 'Bafoussam', subtitle: 'Ouest' },",
    '  ]"',
    "/>",
  );
  const htmlSelect = (cities: typeof CITIES) =>
    lines(
      '<div class="kola-field">',
      `  <label class="kola-field__label" for="ville">${esc(label)}</label>`,
      '  <select id="ville" name="ville" data-kola-select>',
      '    <option value="">Choisir…</option>',
      ...cities.map((c) => `    <option value="${c.value}" data-subtitle="${esc(c.subtitle)}">${esc(c.label)}</option>`),
      "  </select>",
      "</div>",
    );
  const htmlUsage = htmlSelect(CITIES.slice(0, 3));
  const htmlPreview = box(340, htmlSelect(CITIES));

  return (
    <Playground
      slug="selecteur"
      color={color}
      height={420}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={<SelectDemo label={label} />}
      params={{ color, label, dark: flag(dark) }}
      controls={
        <>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="label" label="Label" value={label} onChange={setLabel} />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
          <p className="text-sm leading-relaxed text-ink-muted">
            Ouvre le sélecteur dans l&apos;aperçu et tape <code className="font-mono">yaounde</code> : les accents sont
            ignorés.
          </p>
        </>
      }
    />
  );
}

/* ---------- Carte ---------- */

function CardPlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [variant, setVariant] = useState<"product" | "stat">("product");
  const [title, setTitle] = useState("Riz parfumé 5 kg");
  const [badge, setBadge] = useState("Nouveau");
  const [footer, setFooter] = useState("4 500 FCFA");
  const [statLabel, setStatLabel] = useState("Ventes du jour");
  const [statValue, setStatValue] = useState("125 000 FCFA");
  const [change, setChange] = useState("12.5");
  const [dark, setDark] = useState(false);

  const usage =
    variant === "product"
      ? lines(
          "KolaCard(",
          "  media: Image.network(urlImage, fit: BoxFit.cover),",
          badge && `  badge: ${dartString(badge)},`,
          `  title: ${dartString(title)},`,
          "  subtitle: 'Épicerie · En stock',",
          `  footer: Text(${dartString(footer)}),`,
          "  onTap: () {},",
          ")",
        )
      : lines(
          "KolaStatCard(",
          `  label: ${dartString(statLabel)},`,
          `  value: ${dartString(statValue)},`,
          change && `  change: ${Number(change) || 0},`,
          "  icon: Icons.payments_outlined,",
          ")",
        );

  const changeValue = Number(change.replace(",", "."));
  const reactUsage =
    variant === "product"
      ? lines(
          "<KolaCard",
          '  media={<img src={urlImage} alt="" className="size-full object-cover" />}',
          badge && `  ${jsxString("badge", badge)}`,
          `  ${jsxString("title", title)}`,
          '  subtitle="Épicerie · En stock"',
          `  footer={${JSON.stringify(footer)}}`,
          "  onClick={() => {}}",
          "/>",
        )
      : lines(
          "<KolaStatCard",
          `  ${jsxString("label", statLabel)}`,
          `  ${jsxString("value", statValue)}`,
          change && `  change={${Number.isFinite(changeValue) ? changeValue : 0}}`,
          "  icon={<MoneyIcon />} // ton icône SVG",
          "/>",
        );
  const reactPreview =
    variant === "product" ? (
      <KolaCard
        className="max-w-[280px]"
        media={
          <span className="[&_svg]:size-12">
            <BasketIcon />
          </span>
        }
        badge={badge || undefined}
        title={title}
        subtitle="Épicerie · En stock"
        footer={footer}
        onClick={() => {}}
      />
    ) : (
      <KolaStatCard
        className="max-w-[300px]"
        label={statLabel}
        value={statValue}
        change={change && Number.isFinite(changeValue) ? changeValue : null}
        icon={<MoneyIcon />}
      />
    );

  const params =
    variant === "product"
      ? { color, label: title, badge: badge || undefined, footer, dark: flag(dark) }
      : { color, variant: "stat", label: statLabel, value: statValue, change, dark: flag(dark) };

  const up = (Number.isFinite(changeValue) ? changeValue : 0) >= 0;
  const vueUsage =
    variant === "product"
      ? lines(
          "<KolaCard",
          badge && `  ${vAttr("badge", badge)}`,
          `  ${vAttr("title", title)}`,
          '  subtitle="Épicerie · En stock"',
          `  ${vAttr("footer", footer)}`,
          "  clickable",
          '  @click="ouvrir"',
          ">",
          '  <template #media><img :src="urlImage" alt="" class="size-full object-cover" /></template>',
          "</KolaCard>",
        )
      : lines(
          "<KolaStatCard",
          `  ${vAttr("label", statLabel)}`,
          `  ${vAttr("value", statValue)}`,
          change && `  :change="${Number.isFinite(changeValue) ? changeValue : 0}"`,
          ">",
          "  <template #icon><MoneyIcon /></template>",
          "</KolaStatCard>",
        );
  const productHtml = (media: string) =>
    lines(
      '<a class="kola-card" href="/produits/riz">',
      '  <div class="kola-card__media">',
      `    ${media}`,
      badge && `    <span class="kola-card__badge">${esc(badge)}</span>`,
      "  </div>",
      '  <div class="kola-card__body">',
      `    <h3 class="kola-card__title">${esc(title)}</h3>`,
      '    <p class="kola-card__subtitle">Épicerie · En stock</p>',
      `    <div class="kola-card__footer">${esc(footer)}</div>`,
      "  </div>",
      "</a>",
    );
  const statHtml = lines(
    '<div class="kola-stat">',
    '  <div class="kola-stat__head">',
    `    <span class="kola-stat__label">${esc(statLabel)}</span>`,
    `    <span class="kola-stat__icon">${MONEY_SVG}</span>`,
    "  </div>",
    `  <span class="kola-stat__value">${esc(statValue)}</span>`,
    change &&
      Number.isFinite(changeValue) &&
      `  <span class="kola-stat__change kola-stat__change--${up ? "up" : "down"}">${SVG(up ? "M3 17l6-6 4 4 8-8M15 7h6v6" : "M3 7l6 6 4-4 8 8M15 17h6v-6")} ${formatChange(changeValue)} <small>vs hier</small></span>`,
    "</div>",
  );
  const htmlUsage = variant === "product" ? productHtml('<img src="riz.jpg" alt="">') : statHtml;
  const htmlPreview = variant === "product" ? box(280, productHtml(BASKET_SVG).replace('href="/produits/riz"', 'href="#"')) : box(300, statHtml);

  return (
    <Playground
      slug="carte"
      color={color}
      height={420}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={reactPreview}
      params={params}
      controls={
        <>
          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold">Type</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-chip p-1">
              {(
                [
                  ["product", "Produit"],
                  ["stat", "Statistique"],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={variant === v}
                  onClick={() => setVariant(v)}
                  className={`min-h-10 rounded-[9px] text-sm ${
                    variant === v ? "bg-surface font-semibold text-ink" : "text-ink-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </fieldset>
          <ColorPicker value={color} onChange={setColor} />
          {variant === "product" ? (
            <>
              <TextInput id="title" label="Titre" value={title} onChange={setTitle} />
              <TextInput id="badge" label="Badge (optionnel)" value={badge} onChange={setBadge} />
              <TextInput id="footer" label="Prix" value={footer} onChange={setFooter} />
            </>
          ) : (
            <>
              <TextInput id="statLabel" label="Libellé" value={statLabel} onChange={setStatLabel} />
              <TextInput id="statValue" label="Valeur" value={statValue} onChange={setStatValue} />
              <TextInput id="change" label="Évolution (%)" value={change} onChange={setChange} />
            </>
          )}
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
        </>
      }
    />
  );
}

/* ---------- Tableau ---------- */

const PRODUCTS = [
  { name: "Riz parfumé 5 kg", stock: 7, price: 4500 },
  { name: "Huile 1 L", stock: 42, price: 1600 },
  { name: "Sucre 1 kg", stock: 18, price: 900 },
  { name: "Lait en poudre 400 g", stock: 12, price: 2800 },
  { name: "Savon de ménage", stock: 64, price: 350 },
  { name: "Farine 1 kg", stock: 25, price: 700 },
  { name: "Tomate concentrée", stock: 80, price: 250 },
  { name: "Spaghetti 500 g", stock: 33, price: 450 },
];

function TablePlayground() {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [mobile, setMobile] = useState(false);
  const [rows, setRows] = useState("5");
  const [dark, setDark] = useState(false);

  const usage = lines(
    "KolaDataTable<Produit>(",
    "  rows: produits,",
    rows !== "8" && `  rowsPerPage: ${Number(rows) || 5},`,
    "  columns: [",
    "    KolaColumn(label: 'Produit', cell: (p) => p.nom, sortBy: (p) => p.nom, flex: 2),",
    "    KolaColumn(label: 'Stock', cell: (p) => '${p.stock}', sortBy: (p) => p.stock, numeric: true),",
    "    KolaColumn(",
    "      label: 'Prix',",
    "      cell: (p) => '${KolaAmountField.format(p.prix)} FCFA',",
    "      sortBy: (p) => p.prix,",
    "      numeric: true,",
    "    ),",
    "  ],",
    ")",
  );
  const perPage = Number(rows) || 5;
  const reactUsage = lines(
    "<KolaDataTable",
    "  rows={produits}",
    perPage !== 8 && `  rowsPerPage={${perPage}}`,
    "  columns={[",
    '    { label: "Produit", cell: (p) => p.nom, sortBy: (p) => p.nom, flex: 2 },',
    '    { label: "Stock", cell: (p) => p.stock, sortBy: (p) => p.stock, numeric: true },',
    "    {",
    '      label: "Prix",',
    "      cell: (p) => `${formatAmount(p.prix)} FCFA`,",
    "      sortBy: (p) => p.prix,",
    "      numeric: true,",
    "      flex: 2,",
    "    },",
    "  ]}",
    "/>",
  );

  const vueUsage = lines(
    "<KolaDataTable",
    '  :rows="produits"',
    perPage !== 8 && `  :rows-per-page="${perPage}"`,
    '  :columns="[',
    "    { label: 'Produit', cell: (p) => p.nom, sortBy: (p) => p.nom, flex: 2 },",
    "    { label: 'Stock', cell: (p) => p.stock, sortBy: (p) => p.stock, numeric: true },",
    "    { label: 'Prix', cell: (p) => `${formatAmount(p.prix)} FCFA`, sortBy: (p) => p.prix, numeric: true, flex: 2 },",
    '  ]"',
    "/>",
  );
  const htmlTable = (rows: typeof PRODUCTS, more: boolean) =>
    lines(
      `<table class="kola-table" data-kola-table data-rows-per-page="${perPage}">`,
      "  <thead><tr>",
      "    <th data-sort>Produit</th>",
      '    <th data-sort="number" class="is-num">Stock</th>',
      '    <th data-sort="number" class="is-num">Prix</th>',
      "  </tr></thead>",
      "  <tbody>",
      ...rows.map((r) => `    <tr><td>${esc(r.name)}</td><td>${r.stock}</td><td data-value="${r.price}">${formatAmount(r.price)} FCFA</td></tr>`),
      more && "    <!-- … une ligne <tr> par produit -->",
      "  </tbody>",
      "</table>",
    );
  const htmlUsage = htmlTable(PRODUCTS.slice(0, 3), true);
  const htmlPreview = box(mobile ? 360 : 640, htmlTable(PRODUCTS, false));

  return (
    <Playground
      slug="tableau"
      color={color}
      height={mobile ? 640 : 480}
      usage={usage}
      reactUsage={reactUsage}
      vueUsage={vueUsage}
      htmlUsage={htmlUsage}
      htmlPreview={htmlPreview}
      react={
        <div style={{ width: mobile ? 360 : 640 }} className="max-w-full">
          <KolaDataTable
            key={perPage}
            rows={PRODUCTS}
            rowsPerPage={perPage}
            columns={[
              { label: "Produit", cell: (p) => p.name, sortBy: (p) => p.name, flex: 2 },
              { label: "Stock", cell: (p) => p.stock, sortBy: (p) => p.stock, numeric: true },
              { label: "Prix", cell: (p) => `${formatAmount(p.price)} FCFA`, sortBy: (p) => p.price, numeric: true, flex: 2 },
            ]}
          />
        </div>
      }
      params={{ color, rows, mobile: flag(mobile), dark: flag(dark) }}
      controls={
        <>
          <ColorPicker value={color} onChange={setColor} />
          <TextInput id="rows" label="Lignes par page" value={rows} onChange={setRows} inputMode="numeric" />
          <Toggle label="Vue mobile (cartes)" checked={mobile} onChange={setMobile} />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
          <p className="text-sm leading-relaxed text-ink-muted">Clique sur « Stock » ou « Prix » dans l&apos;aperçu pour trier.</p>
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
  selecteur: SelectPlayground,
  carte: CardPlayground,
  tableau: TablePlayground,
};

/** Affiche le playground d'un composant. Rendu côté navigateur : la page serveur
 *  ne peut pas lire l'objet PLAYGROUNDS directement. */
export function ComponentPlayground({ slug, htmlAssets }: { slug: string; htmlAssets: { css: string; js: string } }) {
  const Selected = PLAYGROUNDS[slug];
  return Selected ? (
    <HtmlAssetsContext.Provider value={htmlAssets}>
      <Selected />
    </HtmlAssetsContext.Provider>
  ) : null;
}
