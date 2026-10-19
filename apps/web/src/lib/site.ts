/** Adresse publique du site (pour Google et les aperçus de liens). À changer pour kolaui.dev le moment venu. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kola-ui-five.vercel.app";

export const SITE_DESCRIPTION =
  "Des composants Flutter, React, Vue et HTML prêts à copier, sans installation ni dépendance. Pensés pour nos usages : +237, FCFA, Mobile Money, dates en français.";

/** Image d'aperçu des liens (app/opengraph-image.png), à remettre sur les pages qui ont leurs propres infos de partage. */
export const SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Kola UI : des composants Flutter, React, Vue et HTML prêts à copier, avec Kola la mascotte.",
};

/** Dépôt GitHub de Kola UI. */
export const GITHUB_URL = "https://github.com/suzuki233788gfjf/kola-ui";

/**
 * Adresse de la vitrine Flutter qui affiche les aperçus.
 * Par défaut, la vitrine compilée est servie par le site lui-même, dans public/preview
 * (voir scripts/build-preview.sh). Pour tester une vitrine lancée à part
 * (flutter run … --web-port 8080), mets NEXT_PUBLIC_PREVIEW_URL=http://localhost:8080/
 */
export const PREVIEW_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? "/preview/index.html";
