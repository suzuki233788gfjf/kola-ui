import type { Framework } from "@/lib/frameworks";
import { dependencyOrder, type KolaComponent } from "@/lib/components";

/** Un bloc : un écran entier assemblé avec des composants Kola. */
export type KolaBloc = {
  slug: string;
  name: string;
  summary: string;
  /** Composants utilisés (slugs). Leurs propres dépendances sont ajoutées automatiquement. */
  uses: string[];
  /** Fichiers du bloc, par langage (chemins dans le dossier des composants). */
  files: Record<Framework, string[]>;
};

export const BLOCS: KolaBloc[] = [
  {
    slug: "connexion-telephone",
    name: "Connexion par téléphone",
    summary: "Numéro +237, code reçu par SMS, puis « Bienvenue ». Tu branches ton envoi de SMS et ta vérification.",
    uses: ["telephone-237", "code-otp", "bouton"],
    files: {
      flutter: ["blocs/kola_phone_login.dart"],
      react: ["blocs/kola-phone-login.tsx"],
      vue: ["blocs/KolaPhoneLogin.vue"],
      html: ["blocs/connexion-telephone.html", "blocs/kola-blocs.css"],
    },
  },
  {
    slug: "paiement-commande",
    name: "Paiement de commande",
    summary: "Récapitulatif du panier en FCFA, livraison, total, puis paiement MTN MoMo ou Orange Money.",
    uses: ["mobile-money"],
    files: {
      flutter: ["blocs/kola_checkout.dart"],
      react: ["blocs/kola-checkout.tsx"],
      vue: ["blocs/KolaCheckout.vue"],
      html: ["blocs/paiement-commande.html", "blocs/kola-blocs.css"],
    },
  },
  {
    slug: "tableau-de-bord",
    name: "Tableau de bord boutique",
    summary: "Chiffres clés du jour, puis commandes par statut avec tri, pagination et état vide.",
    uses: ["carte", "onglets", "tableau", "etats-vides", "montant-fcfa"],
    files: {
      flutter: ["blocs/kola_dashboard.dart"],
      react: ["blocs/kola-dashboard.tsx"],
      vue: ["blocs/KolaDashboard.vue"],
      html: ["blocs/tableau-de-bord.html", "blocs/kola-blocs.css"],
    },
  },
  {
    slug: "liste-recherche",
    name: "Liste avec recherche",
    summary: "Recherche sans accents, squelettes pendant le chargement, « aucun résultat » avec bouton pour effacer.",
    uses: ["recherche", "etats-vides", "bouton", "montant-fcfa"],
    files: {
      flutter: ["blocs/kola_product_list.dart"],
      react: ["blocs/kola-product-list.tsx"],
      vue: ["blocs/KolaProductList.vue"],
      html: ["blocs/liste-recherche.html", "blocs/kola-blocs.css"],
    },
  },
];

export function getBloc(slug: string) {
  return BLOCS.find((b) => b.slug === slug);
}

/** Tous les composants à copier pour ce bloc, dans l'ordre où il faut les charger. */
export function blocDependencies(bloc: KolaBloc, framework: Framework): KolaComponent[] {
  const out: KolaComponent[] = [];
  for (const slug of bloc.uses) {
    for (const c of dependencyOrder(slug, framework)) if (!out.includes(c)) out.push(c);
  }
  return out;
}

/** Dossier conseillé pour les blocs, dans le projet de l'utilisateur. */
export const BLOC_FOLDER: Record<Framework, string> = {
  flutter: "lib/kola/",
  react: "components/kola/",
  vue: "components/kola/",
  html: "kola/",
};
