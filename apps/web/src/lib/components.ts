export type Category = "Formulaires" | "Affichage" | "Retours";

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
  { slug: "selecteur", name: "Sélecteur avec recherche", category: "Formulaires", summary: "Liste déroulante filtrable au clavier.", available: false },
  { slug: "date-picker", name: "Date picker", category: "Formulaires", summary: "Une date ou une période, en français.", available: false },
  { slug: "telephone-237", name: "Téléphone +237", category: "Formulaires", summary: "Formatage automatique et détection MTN / Orange.", available: true, file: "kola_phone_field.dart", requires: ["kola_text_field.dart"] },
  { slug: "montant-fcfa", name: "Montant FCFA", category: "Formulaires", summary: "Séparateur de milliers à la saisie, sans décimales.", available: true, file: "kola_amount_field.dart", requires: ["kola_text_field.dart"] },
  { slug: "carte", name: "Carte", category: "Affichage", summary: "Produit, statistique ou profil.", available: false },
  { slug: "tableau", name: "Tableau de données", category: "Affichage", summary: "Tri, pagination, cartes sur mobile.", available: false },
  { slug: "confirmation", name: "Confirmation", category: "Retours", summary: "Boîte de dialogue ou bottom sheet en une ligne.", available: false },
  { slug: "notifications", name: "Notifications", category: "Retours", summary: "Succès, erreur, info, avertissement.", available: false },
];

export const CATEGORIES: Category[] = ["Formulaires", "Affichage", "Retours"];

export function getComponent(slug: string) {
  return COMPONENTS.find((c) => c.slug === slug);
}
