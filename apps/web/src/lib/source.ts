import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Lit le vrai fichier Dart d'un composant dans packages/kola_flutter.
 * Le code affiché sur le site est donc toujours celui de la bibliothèque.
 */
export async function getDartSource(file: string): Promise<string> {
  "use cache";
  const full = path.join(process.cwd(), "..", "..", "packages", "kola_flutter", "lib", "src", file);
  try {
    return await readFile(full, "utf8");
  } catch {
    return `// Fichier introuvable : packages/kola_flutter/lib/src/${file}`;
  }
}
