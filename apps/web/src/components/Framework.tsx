"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { FRAMEWORKS, type Framework } from "@/lib/frameworks";

export type { Framework };

const IDS = FRAMEWORKS.map((f) => f.id) as string[];

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
      if (saved && IDS.includes(saved)) setState(saved as Framework);
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
    <div role="group" aria-label="Langage" className="inline-flex flex-wrap gap-1 rounded-xl bg-chip p-1">
      {FRAMEWORKS.map(({ id, label }) => (
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

/** Affiche le contenu du langage choisi. Tous sont préparés côté serveur. */
export function FrameworkView(views: Record<Framework, ReactNode>) {
  const { framework } = useFramework();
  return <>{views[framework]}</>;
}
