"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Framework = "flutter" | "react";

const STORAGE_KEY = "kola-framework";
const FrameworkContext = createContext<{ framework: Framework; setFramework: (f: Framework) => void }>({
  framework: "flutter",
  setFramework: () => {},
});

/** Garde le choix Flutter / React pour tout le site (et d'une visite à l'autre). */
export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [framework, setState] = useState<Framework>("flutter");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique au chargement
      if (saved === "react" || saved === "flutter") setState(saved);
    } catch {}
  }, []);

  function setFramework(f: Framework) {
    setState(f);
    try {
      localStorage.setItem(STORAGE_KEY, f);
    } catch {}
  }

  return <FrameworkContext.Provider value={{ framework, setFramework }}>{children}</FrameworkContext.Provider>;
}

export const useFramework = () => useContext(FrameworkContext);

export function FrameworkTabs() {
  const { framework, setFramework } = useFramework();
  return (
    <div role="group" aria-label="Langage" className="inline-flex gap-1 rounded-xl bg-chip p-1">
      {(
        [
          ["flutter", "Flutter"],
          ["react", "React"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={framework === id}
          onClick={() => setFramework(id)}
          className={`min-h-10 rounded-[9px] px-4 text-sm ${
            framework === id ? "bg-surface font-semibold text-ink shadow-sm" : "text-ink-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Affiche le contenu Flutter ou React selon le choix. Les deux sont préparés côté serveur. */
export function FrameworkView({ flutter, react }: { flutter: ReactNode; react: ReactNode }) {
  const { framework } = useFramework();
  return <>{framework === "react" ? react : flutter}</>;
}
