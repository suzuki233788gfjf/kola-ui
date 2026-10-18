"use client";

import { PREVIEW_URL } from "@/lib/site";
import { CodeBlock } from "./CodeBlock";

/** Cadre commun : aperçu (vitrine Flutter) + panneau d'options + code d'utilisation. */
export function Playground({
  slug,
  params,
  controls,
  usage,
  color,
  height = 360,
}: {
  slug: string;
  height?: number;
  params: Record<string, string | undefined>;
  controls: React.ReactNode;
  usage: string;
  color: string;
}) {
  const query = new URLSearchParams({ c: slug });
  for (const [k, v] of Object.entries(params)) if (v) query.set(k, v);
  const previewSrc = `${PREVIEW_URL}?${query.toString()}`;

  const theme =
    color === DEFAULT_COLOR
      ? "theme: KolaTheme.light(),"
      : `theme: KolaTheme.light(primary: const Color(0xFF${color})),`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        <section
          aria-label="Aperçu"
          style={{ minHeight: height }}
          className="flex min-w-0 flex-[999_1_560px] flex-col overflow-hidden rounded-[20px] bg-chip"
        >
          <iframe
            key={previewSrc}
            src={previewSrc}
            title="Aperçu"
            style={{ minHeight: height }}
            className="w-full flex-1 border-0"
          />
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
        <p className="text-ink-muted">Ce code suit les options choisies. Mets-le dans ton écran :</p>
        <CodeBlock filename="Dans ton écran" code={usage} />
        <p className="text-ink-muted">
          Et dans ton <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-sm">MaterialApp</code> :
        </p>
        <CodeBlock filename="main.dart" code={theme} />
      </section>
    </div>
  );
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

/** Échappe une chaîne pour du code Dart entre apostrophes. */
export const dartString = (s: string) => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
