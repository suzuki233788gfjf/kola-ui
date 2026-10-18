import { readFile } from "node:fs/promises";
import path from "node:path";

const PACKAGES = path.join(process.cwd(), "..", "..", "packages");

/**
 * Lit le vrai fichier Dart d'un composant dans packages/kola_flutter.
 * Le code affiché sur le site est donc toujours celui de la bibliothèque.
 */
export async function getDartSource(file: string): Promise<string> {
  "use cache";
  try {
    return await readFile(path.join(PACKAGES, "kola_flutter", "lib", "src", file), "utf8");
  } catch {
    return `// Fichier introuvable : packages/kola_flutter/lib/src/${file}`;
  }
}

/** Même chose pour la version React, dans packages/kola-react. */
export async function getReactSource(file: string): Promise<string> {
  "use cache";
  try {
    return await readFile(path.join(PACKAGES, "kola-react", "src", file), "utf8");
  } catch {
    return `// Fichier introuvable : packages/kola-react/src/${file}`;
  }
}
