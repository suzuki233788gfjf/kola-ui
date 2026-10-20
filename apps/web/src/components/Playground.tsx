"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { KolaToastProvider } from "@kola/react/kola-toast";
import { PREVIEW_URL } from "@/lib/site";
import { CodeBlock } from "./CodeBlock";
import { useFramework } from "./Framework";

/** CSS et JS des composants HTML (thème + dépendances), fournis par la page. */
export const HtmlAssetsContext = createContext<{ css: string; js: string }>({ css: "", js: "" });

const VUE_PREVIEW_URL = "/preview-vue/index.html";

/**
 * Cadre commun : aperçu + panneau d'options + code d'utilisation, pour les 4 langages.
 * - Flutter et Vue : une vitrine dans un cadre, mise à jour par message (sans rechargement).
 * - React : le vrai composant, rendu directement.
 * - HTML : le code d'utilisation lui-même, rendu dans un cadre isolé.
 */
export function Playground({
  slug,
  params,
  controls,
  usage,
  react,
  reactUsage,
  vueUsage,
  htmlUsage,
  htmlPreview,
  color,
  height = 360,
  frameWidth,
}: {
  slug: string;
  height?: number;
  /** Largeur de l'aperçu (ex. 390 pour un téléphone). Par défaut : toute la place. */
  frameWidth?: number;
  params: Record<string, string | undefined>;
  controls: ReactNode;
  /** Code Flutter (Dart) à copier. */
  usage: string;
  /** L'aperçu React : le composant lui-même. */
  react: ReactNode;
  /** Code React (JSX) à copier. */
  reactUsage: string;
  /** Code Vue à copier. */
  vueUsage: string;
  /** Code HTML à copier (aussi affiché dans l'aperçu, sauf si htmlPreview est donné). */
  htmlUsage: string;
  /** Variante de l'aperçu HTML (ex. paiement simulé). */
  htmlPreview?: string;
  color: string;
}) {
  const { framework } = useFramework();
  const query = new URLSearchParams({ c: slug });
  for (const [k, v] of Object.entries(params)) if (v) query.set(k, v);
  const queryString = query.toString();
  const dark = params.dark === "1";

  const code = { flutter: usage, react: reactUsage, vue: vueUsage, html: htmlUsage }[framework];
  const where = { flutter: "Dans ton écran", react: "Dans ton composant", vue: "Dans ton composant", html: "Dans ta page" }[framework];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        <section
          aria-label="Aperçu"
          style={{ minHeight: height }}
          className="flex min-w-0 flex-[999_1_560px] flex-col overflow-hidden rounded-[20px] bg-chip"
        >
          <div style={{ maxWidth: frameWidth }} className={`mx-auto flex w-full flex-1 flex-col ${frameWidth ? "border-x border-line-strong" : ""}`}>
            <PreviewFrame base={PREVIEW_URL} title="Aperçu Flutter" query={queryString} visible={framework === "flutter"} height={height} />
            <PreviewFrame base={VUE_PREVIEW_URL} title="Aperçu Vue" query={queryString} visible={framework === "vue"} height={height} />
            {framework === "react" && (
              <div
                data-kola-theme={dark ? "dark" : "light"}
                style={{ minHeight: height, "--kola-primary": `#${color}` } as CSSProperties}
                className="flex w-full flex-1 items-center justify-center bg-kola-surface-muted p-6"
              >
                <KolaToastProvider>{react}</KolaToastProvider>
              </div>
            )}
            {framework === "html" && <HtmlPreview html={htmlPreview ?? htmlUsage} color={color} dark={dark} height={height} />}
          </div>
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
        <p className="text-ink-muted">Ce code suit les options choisies. Copie-le là où tu en as besoin :</p>
        <CodeBlock filename={where} code={code} />
        <ThemeSnippet framework={framework} color={color} />
      </section>
    </div>
  );
}

function ThemeSnippet({ framework, color }: { framework: string; color: string }) {
  const custom = color !== DEFAULT_COLOR;
  if (framework === "flutter")
    return (
      <>
        <p className="text-ink-muted">
          Et dans ton <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-sm">MaterialApp</code> :
        </p>
        <CodeBlock
          filename="main.dart"
          code={custom ? `theme: KolaTheme.light(primary: const Color(0xFF${color})),` : "theme: KolaTheme.light(),"}
        />
      </>
    );
  if (framework === "html")
    return (
      <>
        <p className="text-ink-muted">Et dans le &lt;head&gt; de ta page (le thème Kola, une seule fois) :</p>
        <CodeBlock
          filename="index.html"
          code={[
            '<link rel="stylesheet" href="kola/kola-theme.css">',
            custom && `<style>:root { --kola-primary: #${color}; }</style>`,
          ]
            .filter(Boolean)
            .join("\n")}
        />
      </>
    );
  return (
    <>
      <p className="text-ink-muted">Et dans ton CSS global (le thème Kola, une seule fois) :</p>
      <CodeBlock
        filename={framework === "vue" ? "src/style.css" : "globals.css"}
        code={['@import "tailwindcss";', '@import "./components/kola/kola-theme.css";', custom && `\n:root {\n  --kola-primary: #${color};\n}`]
          .filter(Boolean)
          .join("\n")}
      />
    </>
  );
}

/**
 * Une vitrine (Flutter ou Vue) dans un cadre. Chargée une seule fois, à la première
 * apparition ; ensuite chaque changement d'option lui est envoyé par message.
 */
function PreviewFrame({ base, title, query, visible, height }: { base: string; title: string; query: string; visible: boolean; height: number }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(query);
  const [src, setSrc] = useState<string | null>(null);
  if (visible && !src) setSrc(`${base}?${query}`);

  // La vitrine annonce « kola-ready » quand elle écoute : on lui renvoie alors l'état actuel.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data === "kola-ready") sendToPreview(frame.current, latest.current);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Chaque changement d'option part tout de suite (si la vitrine démarre encore,
  // elle le récupérera avec « kola-ready »).
  useEffect(() => {
    latest.current = query;
    sendToPreview(frame.current, query);
  }, [query]);

  if (!src) return null;
  return (
    <iframe
      ref={frame}
      src={src}
      title={title}
      style={{ minHeight: height }}
      className={`w-full flex-1 border-0 ${visible ? "" : "hidden"}`}
    />
  );
}

/** Aperçu HTML : le code d'utilisation, avec le CSS et le JS Kola, dans un cadre isolé. */
function HtmlPreview({ html, color, dark, height }: { html: string; color: string; dark: boolean; height: number }) {
  const { css, js } = useContext(HtmlAssetsContext);
  const doc = `<!doctype html><html lang="fr" data-kola-theme="${dark ? "dark" : "light"}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>${css}</style>
<style>:root { --kola-primary: #${color}; }
html, body { min-height: 100%; margin: 0; }
body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; box-sizing: border-box;
  background: var(--kola-surface-muted); color: var(--kola-ink); font-family: "IBM Plex Sans", system-ui, sans-serif; }
.kola-demo { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; }
.kola-demo > * { max-width: 100%; }
</style>
<script>${js.replace(/<\/script/gi, "<\\/script")}</script>
</head><body><div class="kola-demo">${html}</div></body></html>`;
  return (
    <iframe
      key={dark ? "d" : "l"}
      srcDoc={doc}
      title="Aperçu HTML"
      sandbox="allow-scripts allow-forms"
      style={{ minHeight: height }}
      className="w-full flex-1 border-0"
    />
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
