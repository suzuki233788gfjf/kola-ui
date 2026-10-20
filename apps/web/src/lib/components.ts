import type { Framework } from "@/lib/frameworks";

export type Category = "Formulaires" | "Paiement" | "Affichage" | "Navigation" | "Retours";

export type KolaComponent = {
  slug: string;
  name: string;
  category: Category;
  summary: string;
  /** true quand le composant existe dans les 4 langages */
  available: boolean;
  /** Fichiers du composant, par langage (le premier est le fichier principal). */
  files: Record<Framework, string[]>;
  /** Autres composants Kola nécessaires (slugs), par langage. */
  requires?: Partial<Record<Framework, string[]>>;
};

const all = (slugs: string[]) => ({ flutter: slugs, react: slugs, vue: slugs, html: slugs });

export const COMPONENTS: KolaComponent[] = [
  {
    slug: "bouton", name: "Bouton", category: "Formulaires", available: true,
    summary: "Principal, secondaire, contour, texte. Chargement et icône.",
    files: { flutter: ["kola_button.dart"], react: ["kola-button.tsx"], vue: ["KolaButton.vue"], html: ["kola-button.css"] },
  },
  {
    slug: "champ-de-texte", name: "Champ de texte", category: "Formulaires", available: true,
    summary: "Label, aide, erreur, validation et mot de passe masquable.",
    files: { flutter: ["kola_text_field.dart"], react: ["kola-text-field.tsx"], vue: ["KolaTextField.vue"], html: ["kola-text-field.css", "kola-text-field.js"] },
  },
  {
    slug: "selecteur", name: "Sélecteur avec recherche", category: "Formulaires", available: true,
    summary: "Liste filtrable, recherche sans accents (« yaounde » trouve Yaoundé).",
    files: { flutter: ["kola_select.dart"], react: ["kola-select.tsx"], vue: ["KolaSelect.vue"], html: ["kola-select.css", "kola-select.js"] },
    requires: { html: ["champ-de-texte"] },
  },
  {
    slug: "date-picker", name: "Date picker", category: "Formulaires", available: true,
    summary: "Une date ou une période, en français, semaine qui commence le lundi.",
    files: { flutter: ["kola_date_picker.dart"], react: ["kola-date-picker.tsx"], vue: ["KolaDatePicker.vue", "KolaCalendar.vue"], html: ["kola-date-picker.css", "kola-date-picker.js"] },
    requires: { html: ["champ-de-texte", "bouton"] },
  },
  {
    slug: "telephone-237", name: "Téléphone +237", category: "Formulaires", available: true,
    summary: "Formatage automatique et détection MTN / Orange.",
    files: { flutter: ["kola_phone_field.dart"], react: ["kola-phone-field.tsx"], vue: ["KolaPhoneField.vue"], html: ["kola-phone-field.css", "kola-phone-field.js"] },
    requires: all(["champ-de-texte"]),
  },
  {
    slug: "montant-fcfa", name: "Montant FCFA", category: "Formulaires", available: true,
    summary: "Séparateur de milliers à la saisie, sans décimales.",
    files: { flutter: ["kola_amount_field.dart"], react: ["kola-amount-field.tsx"], vue: ["KolaAmountField.vue"], html: ["kola-amount-field.js"] },
    requires: all(["champ-de-texte"]),
  },
  {
    slug: "code-otp", name: "Code OTP", category: "Formulaires", available: true,
    summary: "Les cases du code SMS : collage du SMS entier, compte à rebours pour renvoyer.",
    files: { flutter: ["kola_otp_field.dart"], react: ["kola-otp-field.tsx"], vue: ["KolaOtpField.vue"], html: ["kola-otp-field.css", "kola-otp-field.js"] },
    requires: { html: ["champ-de-texte"] },
  },
  {
    slug: "mobile-money", name: "Formulaire Mobile Money", category: "Paiement", available: true,
    summary: "MTN MoMo et Orange Money : saisie, attente de confirmation, succès, échec.",
    files: { flutter: ["kola_mobile_money_form.dart"], react: ["kola-mobile-money-form.tsx"], vue: ["KolaMobileMoneyForm.vue"], html: ["kola-mobile-money-form.css", "kola-mobile-money-form.js"] },
    requires: { ...all(["champ-de-texte", "telephone-237", "montant-fcfa"]), html: ["champ-de-texte", "telephone-237", "montant-fcfa", "bouton"] },
  },
  {
    slug: "carte", name: "Carte", category: "Affichage", available: true,
    summary: "Carte produit et carte statistique (chiffre clé + évolution).",
    files: { flutter: ["kola_card.dart"], react: ["kola-card.tsx"], vue: ["KolaCard.vue", "KolaStatCard.vue"], html: ["kola-card.css"] },
  },
  {
    slug: "tableau", name: "Tableau de données", category: "Affichage", available: true,
    summary: "Tri, pagination, et cartes automatiques sur petit écran.",
    files: { flutter: ["kola_data_table.dart"], react: ["kola-data-table.tsx"], vue: ["KolaDataTable.vue"], html: ["kola-data-table.css", "kola-data-table.js"] },
  },
  {
    slug: "onglets", name: "Onglets", category: "Navigation", available: true,
    summary: "Onglets en haut de page et barre d'onglets en bas d'une app mobile, avec compteurs.",
    files: { flutter: ["kola_tabs.dart"], react: ["kola-tabs.tsx"], vue: ["KolaTabs.vue", "KolaBottomNav.vue"], html: ["kola-tabs.css", "kola-tabs.js"] },
  },
  {
    slug: "confirmation", name: "Confirmation", category: "Retours", available: true,
    summary: "Boîte de dialogue ou panneau du bas, en une ligne.",
    files: { flutter: ["kola_confirm.dart"], react: ["kola-confirm.tsx"], vue: ["KolaConfirm.vue"], html: ["kola-confirm.css", "kola-confirm.js"] },
    requires: { html: ["bouton"] },
  },
  {
    slug: "notifications", name: "Notifications", category: "Retours", available: true,
    summary: "Succès, erreur, info, avertissement.",
    files: { flutter: ["kola_toast.dart"], react: ["kola-toast.tsx"], vue: ["KolaToaster.vue", "KolaToastView.vue"], html: ["kola-toast.css", "kola-toast.js"] },
    requires: { html: ["bouton"] },
  },
];

/** Le thème à copier une fois, par langage. */
export const THEME_FILE: Record<Framework, string> = {
  flutter: "kola_theme.dart",
  react: "kola-theme.css",
  vue: "kola-theme.css",
  html: "kola-theme.css",
};

/** Dossier conseillé dans le projet de l'utilisateur. */
export const TARGET_FOLDER: Record<Framework, string> = {
  flutter: "lib/kola/",
  react: "components/kola/",
  vue: "components/kola/",
  html: "kola/",
};

export const CATEGORIES: Category[] = ["Formulaires", "Paiement", "Affichage", "Navigation", "Retours"];

export function getComponent(slug: string) {
  return COMPONENTS.find((c) => c.slug === slug);
}

/** Toutes les dépendances (récursives), dans l'ordre où il faut les charger. */
export function dependencyOrder(slug: string, framework: Framework): KolaComponent[] {
  const out: KolaComponent[] = [];
  const visit = (s: string) => {
    const c = getComponent(s);
    if (!c || out.includes(c)) return;
    for (const d of c.requires?.[framework] ?? []) visit(d);
    out.push(c);
  };
  visit(slug);
  return out;
}
