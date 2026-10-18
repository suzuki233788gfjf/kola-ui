"use client";

import { useEffect, useId, useRef, useState } from "react";

export type KolaSelectOption<T> = { value: T; label: string; subtitle?: string };

/** "Yaoundé" → "yaounde" : la recherche ignore accents et majuscules. */
export function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae").toLowerCase().trim();
}

export type KolaSelectProps<T> = {
  label: string;
  options: KolaSelectOption<T>[];
  value?: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
};

/**
 * Sélecteur avec recherche (« yaounde » trouve Yaoundé).
 *
 * <KolaSelect
 *   label="Ville"
 *   value={ville}
 *   onChange={setVille}
 *   options={[
 *     { value: "dla", label: "Douala", subtitle: "Littoral" },
 *     { value: "yde", label: "Yaoundé", subtitle: "Centre" },
 *   ]}
 * />
 */
export function KolaSelect<T>({
  label,
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  searchPlaceholder = "Rechercher…",
  emptyText = "Aucun résultat",
  className = "",
}: KolaSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const selected = options.find((o) => o.value === value);
  const q = normalize(query);
  const filtered = q
    ? options.filter((o) => normalize(o.label).includes(q) || (o.subtitle && normalize(o.subtitle).includes(q)))
    : options;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span id={id} className="text-sm font-semibold text-kola-ink">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-labelledby={`${id} ${id}-value`}
        onClick={() => {
          setQuery("");
          setOpen(true);
        }}
        className="flex min-h-12 items-center justify-between gap-2.5 rounded-kola border border-kola-line-strong bg-kola-surface px-3.5 text-left hover:border-kola-ink-subtle focus-visible:border-kola-primary focus-visible:ring-1 focus-visible:ring-kola-primary focus-visible:outline-none"
      >
        <span id={`${id}-value`} className={selected ? "text-kola-ink" : "text-kola-ink-subtle"}>
          {selected?.label ?? placeholder}
        </span>
        <svg viewBox="0 0 24 24" className="size-5 text-kola-ink-subtle" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        aria-label={label}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-auto w-[calc(100%-32px)] max-w-[420px] rounded-[20px] border border-kola-line bg-kola-surface p-0 text-kola-ink shadow-2xl backdrop:bg-black/40"
      >
        {open && (
          <div className="flex max-h-[min(560px,80vh)] flex-col">
            <div className="flex flex-col gap-3 border-b border-kola-line p-4">
              <p className="text-lg font-bold">{label}</p>
              <input
                autoFocus
                type="search"
                value={query}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    e.preventDefault();
                    onChange(filtered[0].value);
                    setOpen(false);
                  }
                }}
                className="min-h-11 rounded-kola border border-kola-line-strong bg-kola-surface px-3 outline-none placeholder:text-kola-ink-subtle focus:border-kola-primary focus:ring-1 focus:ring-kola-primary"
              />
            </div>
            <ul role="listbox" aria-label={label} className="overflow-y-auto p-2">
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-kola-ink-subtle">{emptyText}</li>}
              {filtered.map((o, i) => {
                const active = o.value === value;
                return (
                  <li key={i} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left hover:bg-kola-surface-muted ${
                        active ? "bg-kola-primary/10" : ""
                      }`}
                    >
                      <span className="flex flex-col">
                        <span className={active ? "font-semibold text-kola-primary" : ""}>{o.label}</span>
                        {o.subtitle && <span className="text-sm text-kola-ink-subtle">{o.subtitle}</span>}
                      </span>
                      {active && (
                        <svg viewBox="0 0 24 24" className="size-5 text-kola-primary" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </dialog>
    </div>
  );
}
