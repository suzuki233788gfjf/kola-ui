"use client";

import { useState } from "react";
import { PREVIEW_URL } from "@/lib/site";
import { CodeBlock } from "./CodeBlock";

const VARIANTS = [
  { id: "primary", label: "Principal" },
  { id: "secondary", label: "Secondaire" },
  { id: "outline", label: "Contour" },
  { id: "text", label: "Texte" },
] as const;

const COLORS = [
  { hex: "1F6B45", name: "Vert kola" },
  { hex: "9A3324", name: "Rouge" },
  { hex: "2D4A8A", name: "Bleu" },
  { hex: "7A4E12", name: "Ocre" },
];

type Variant = (typeof VARIANTS)[number]["id"];

export function ButtonPlayground() {
  const [variant, setVariant] = useState<Variant>("primary");
  const [color, setColor] = useState(COLORS[0].hex);
  const [label, setLabel] = useState("Valider");
  const [icon, setIcon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  const query = new URLSearchParams({ variant, color, label });
  if (icon) query.set("icon", "1");
  if (loading) query.set("loading", "1");
  if (dark) query.set("dark", "1");
  const previewSrc = `${PREVIEW_URL}?${query.toString()}`;

  const usage = [
    "KolaButton(",
    `  label: '${label.replace(/'/g, "\\'")}',`,
    variant !== "primary" ? `  variant: KolaButtonVariant.${variant},` : null,
    icon ? "  icon: Icons.check," : null,
    loading ? "  loading: true," : null,
    "  onPressed: () {},",
    ")",
  ]
    .filter(Boolean)
    .join("\n");

  const theme =
    color === COLORS[0].hex
      ? "theme: KolaTheme.light(),"
      : `theme: KolaTheme.light(primary: const Color(0xFF${color})),`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        <section aria-label="Aperçu" className="flex min-h-[360px] min-w-0 flex-[999_1_560px] flex-col overflow-hidden rounded-[20px] bg-chip">
          <iframe key={previewSrc} src={previewSrc} title="Aperçu du bouton Kola" className="min-h-[360px] w-full flex-1 border-0" />
        </section>

        <aside aria-label="Options" className="flex flex-[1_1_280px] flex-col gap-6 rounded-[20px] border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">Personnaliser</h2>

          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold">Variante</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-chip p-1">
              {VARIANTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={variant === v.id}
                  onClick={() => setVariant(v.id)}
                  className={`min-h-10 rounded-[9px] text-sm ${variant === v.id ? "bg-surface font-semibold text-ink" : "text-ink-muted"}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold">Couleur principale</legend>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  aria-label={c.name}
                  aria-pressed={color === c.hex}
                  onClick={() => setColor(c.hex)}
                  style={{ backgroundColor: `#${c.hex}` }}
                  className={`size-11 rounded-full border-[3px] border-surface outline ${color === c.hex ? "outline-2 outline-ink" : "outline-1 outline-line-strong"}`}
                />
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="label" className="text-sm font-semibold">Texte du bouton</label>
            <input
              id="label"
              value={label}
              maxLength={30}
              onChange={(e) => setLabel(e.target.value)}
              className="min-h-11 rounded-[10px] border border-line-strong px-3"
            />
          </div>

          <Toggle label="Icône" checked={icon} onChange={setIcon} />
          <Toggle label="Chargement" checked={loading} onChange={setLoading} />
          <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 text-sm font-semibold">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-accent" />
    </label>
  );
}
