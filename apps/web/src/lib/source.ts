import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Framework } from "@/lib/frameworks";

const PACKAGES = path.join(process.cwd(), "..", "..", "packages");
const FOLDERS: Record<Framework, string> = {
  flutter: path.join("kola_flutter", "lib", "src"),
  react: path.join("kola-react", "src"),
  vue: path.join("kola-vue", "src"),
  html: path.join("kola-html", "src"),
};

/**
 * Lit le vrai fichier d'un composant dans packages/.
 * Le code affiché sur le site est donc toujours celui de la bibliothèque.
 */
export async function getSource(framework: Framework, file: string): Promise<string> {
  "use cache";
  try {
    return await readFile(path.join(PACKAGES, FOLDERS[framework], file), "utf8");
  } catch {
    return `// Fichier introuvable : packages/${FOLDERS[framework]}/${file}`;
  }
}

export const getDartSource = (file: string) => getSource("flutter", file);
export const getReactSource = (file: string) => getSource("react", file);
