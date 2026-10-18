export type Category = "Formulaires" | "Paiement" | "Affichage" | "Retours";

export type KolaComponent = {
  slug: string;
  name: string;
  category: Category;
  summary: string;
  /** true quand le composant existe dans packages/kola_flutter */
  available: boolean;
  /** Fichier Dart du composant, relatif à packages/kola_flutter/lib/src */
  file?: string;
  /** Autres fichiers Kola nécessaires (en plus du thème). */
  requires?: string[];
};

export const COMPONENTS: KolaComponent[] = [
  { slug: "bouton", name: "Bouton", category: "Formulaires", summary: "Principal, secondaire, contour, texte. Chargement et icône.", available: true, file: "kola_button.dart" },
  { slug: "champ-de-texte", name: "Champ de texte", category: "Formulaires", summary: "Label, aide, erreur, validation et mot de passe masquable.", available: true, file: "kola_text_field.dart" },
  { slug: "selecteur", name: "Sélecteur avec recherche", category: "Formulaires", summary: "Liste filtrable, recherche sans accents (« yaounde » trouve Yaoundé).", available: true, file: "kola_select.dart" },
  { slug: "date-picker", name: "Date picker", category: "Formulaires", summary: "Une date ou une période, en français, semaine qui commence le lundi.", available: true, file: "kola_date_picker.dart" },
  { slug: "telephone-237", name: "Téléphone +237", category: "Formulaires", summary: "Formatage automatique et détection MTN / Orange.", available: true, file: "kola_phone_field.dart", requires: ["kola_text_field.dart"] },
  { slug: "montant-fcfa", name: "Montant FCFA", category: "Formulaires", summary: "Séparateur de milliers à la saisie, sans décimales.", available: true, file: "kola_amount_field.dart", requires: ["kola_text_field.dart"] },
  {
    slug: "mobile-money",
    name: "Formulaire Mobile Money",
    category: "Paiement",
    summary: "MTN MoMo et Orange Money : saisie, attente de confirmation, succès, échec.",
    available: true,
    file: "kola_mobile_money_form.dart",
    requires: ["kola_text_field.dart", "kola_phone_field.dart", "kola_amount_field.dart"],
  },
  { slug: "carte", name: "Carte", category: "Affichage", summary: "Carte produit et carte statistique (chiffre clé + évolution).", available: true, file: "kola_card.dart" },
  { slug: "tableau", name: "Tableau de données", category: "Affichage", summary: "Tri, pagination, et cartes automatiques sur petit écran.", available: true, file: "kola_data_table.dart" },
  { slug: "confirmation", name: "Confirmation", category: "Retours", summary: "Boîte de dialogue ou panneau du bas, en une ligne.", available: true, file: "kola_confirm.dart" },
  { slug: "notifications", name: "Notifications", category: "Retours", summary: "Succès, erreur, info, avertissement.", available: true, file: "kola_toast.dart" },
];

export const CATEGORIES: Category[] = ["Formulaires", "Paiement", "Affichage", "Retours"];

export function getComponent(slug: string) {
  return COMPONENTS.find((c) => c.slug === slug);
}
