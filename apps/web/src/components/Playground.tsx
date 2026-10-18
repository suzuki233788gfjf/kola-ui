"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { KolaToastProvider } from "@kola/react/kola-toast";
import { PREVIEW_URL } from "@/lib/site";
import { CodeBlock } from "./CodeBlock";
import { useFramework } from "./Framework";

/**
 * Cadre commun : aperçu + panneau d'options + code d'utilisation.
 * Flutter : la vitrine Flutter Web dans un cadre. React : le vrai composant, rendu directement.
 */
export function Playground({
  slug,
  params,
  controls,
  usage,
  react,
  reactUsage,
  color,
  height = 360,
}: {
  slug: string;
  height?: number;
  params: Record<string, string | undefined>;
  controls: ReactNode;
  /** Code Flutter (Dart) à copier. */
  usage: string;
  /** L'aperçu React : le composant lui-même. */
  react: ReactNode;
  /** Code React (JSX) à copier. */
  reactUsage: string;
  color: string;
}) {
  const { framework } = useFramework();
  const isReact = framework === "react";
  const query = new URLSearchParams({ c: slug });
  for (const [k, v] of Object.entries(params)) if (v) query.set(k, v);
  const queryString = query.toString();

  // Aperçu instantané : la vitrine est chargée une seule fois, puis chaque
  // changement d'option lui est envoyé par message, sans recharger Flutter.
  const [initialSrc] = useState(() => `${PREVIEW_URL}?${queryString}`);
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(queryString);
  // On ne charge Flutter que si on l'affiche au moins une fois (inutile pour qui reste sur React).
  const [flutterSeen, setFlutterSeen] = useState(false);
  if (!isReact && !flutterSeen) setFlutterSeen(true);

  // La vitrine annonce « kola-ready » quand elle écoute : on lui renvoie alors l'état actuel.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data === "kola-ready") sendToPreview(frame.current, latest.current);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Chaque changement d'option part tout de suite (perdu sans risque si la vitrine démarre encore :
  // elle le récupérera avec « kola-ready »).
  useEffect(() => {
    latest.current = queryString;
    sendToPreview(frame.current, queryString);
  }, [queryString]);

  const theme =
    color === DEFAULT_COLOR
      ? "theme: KolaTheme.light(),"
      : `theme: KolaTheme.light(primary: const Color(0xFF${color})),`;
  const reactTheme = [
    '@import "tailwindcss";',
    '@import "./components/kola/kola-theme.css";',
    color !== DEFAULT_COLOR && `\n:root {\n  --kola-primary: #${color};\n}`,
  ]
    .filter(Boolean)
    .join("\n");
  const dark = params.dark === "1";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        <section
          aria-label="Aperçu"
          style={{ minHeight: height }}
          className="flex min-w-0 flex-[999_1_560px] flex-col overflow-hidden rounded-[20px] bg-chip"
        >
          {/* La vitrine Flutter reste chargée même cachée : revenir à Flutter est immédiat. */}
          {flutterSeen && (
          <iframe
            ref={frame}
            src={initialSrc}
            title="Aperçu Flutter"
            style={{ minHeight: height }}
            className={`w-full flex-1 border-0 ${isReact ? "hidden" : ""}`}
          />
          )}
          {isReact && (
            <div
              data-kola-theme={dark ? "dark" : "light"}
              style={{ minHeight: height, "--kola-primary": `#${color}` } as CSSProperties}
              className="flex w-full flex-1 items-center justify-center bg-kola-surface-muted p-6"
            >
              <KolaToastProvider>{react}</KolaToastProvider>
            </div>
          )}
        </section>
        <aside
          aria-label="Options"
          className="flex flex-[1_1_280px] flex-col gap-6 rounded-[20px] border border-line bg-surface p-6"
        >
          <h2 className="text-lg font-semibold">Personnaliser</h2>
          {controls}
        </aside>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] font-bold">Utilisation</h2>
        <p className="text-ink-muted">Ce code suit les options choisies. Mets-le dans ton {isReact ? "composant" : "écran"} :</p>
        <CodeBlock filename={isReact ? "Dans ton composant" : "Dans ton écran"} code={isReact ? reactUsage : usage} />
        {isReact ? (
          <>
            <p className="text-ink-muted">
              Et dans ton CSS global (le thème Kola, une seule fois) :
            </p>
            <CodeBlock filename="globals.css" code={reactTheme} />
          </>
        ) : (
          <>
            <p className="text-ink-muted">
              Et dans ton <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-sm">MaterialApp</code> :
            </p>
            <CodeBlock filename="main.dart" code={theme} />
          </>
        )}
      </section>
    </div>
  );
}

function sendToPreview(frame: HTMLIFrameElement | null, query: string) {
  frame?.contentWindow?.postMessage(`kola?${query}`, window.location.origin);
}

export const DEFAULT_COLOR = "1F6B45";

const COLORS = [
  { hex: DEFAULT_COLOR, name: "Vert kola" },
  { hex: "9A3324", name: "Rouge" },
  { hex: "2D4A8A", name: "Bleu" },
  { hex: "7A4E12", name: "Ocre" },
];

export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold">Couleur principale</legend>
      <div className="flex flex-wrap gap-2.5">
        {COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            aria-label={c.name}
            aria-pressed={value === c.hex}
            onClick={() => onChange(c.hex)}
            style={{ backgroundColor: `#${c.hex}` }}
            className={`size-11 rounded-full border-[3px] border-surface outline ${
              value === c.hex ? "outline-2 outline-ink" : "outline-1 outline-line-strong"
            }`}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "text" | "numeric" | "tel";
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        value={value}
        maxLength={30}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-[10px] border border-line-strong px-3"
      />
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 text-sm font-semibold">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-accent" />
    </label>
  );
}

/** Attribut JSX texte : label="Valider" (ou label={"…"} s'il y a des guillemets). */
export const jsxString = (name: string, s: string) =>
  /["{}\\]/.test(s) || s.includes("\n") ? `${name}={${JSON.stringify(s)}}` : `${name}="${s}"`;

/** Échappe une chaîne pour du code Dart entre apostrophes. */
export const dartString = (s: string) => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
