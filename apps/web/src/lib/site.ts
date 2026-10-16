/** Lien du dépôt GitHub (à remplacer par l'adresse publique au lancement). */
export const GITHUB_URL = "https://github.com";

/**
 * Adresse de la vitrine Flutter qui affiche les aperçus.
 * En local : la vitrine lancée avec
 *   flutter run -d web-server --web-port 8080 --release
 * En ligne : on mettra l'adresse publique dans la variable NEXT_PUBLIC_PREVIEW_URL.
 */
export const PREVIEW_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? "http://localhost:8080";
