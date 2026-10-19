/** Les langages de Kola UI. Fichier partagé : utilisable côté serveur ET navigateur. */
export type Framework = "flutter" | "react" | "vue" | "html";

export const FRAMEWORKS: { id: Framework; label: string }[] = [
  { id: "flutter", label: "Flutter" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "html", label: "HTML" },
];
