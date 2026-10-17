/** Dépôt GitHub de Kola UI. */
export const GITHUB_URL = "https://github.com/suzuki233788gfjf/kola-ui";

/**
 * Adresse de la vitrine Flutter qui affiche les aperçus.
 * Par défaut, la vitrine compilée est servie par le site lui-même, dans public/preview
 * (voir scripts/build-preview.sh). Pour tester une vitrine lancée à part
 * (flutter run … --web-port 8080), mets NEXT_PUBLIC_PREVIEW_URL=http://localhost:8080/
 */
export const PREVIEW_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? "/preview/index.html";
