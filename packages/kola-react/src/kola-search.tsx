"use client";

import { useId, useMemo, useRef, useState } from "react";

export type KolaSearchOption<T = string> = {
  label: string;
  /** Petit texte sous le libellé (ex. la région d'une ville). La recherche le lit aussi. */
  subtitle?: string;
  /** Ce que tu veux récupérer quand la suggestion est choisie (un id, un produit…). */
  value?: T;
};

/** Minuscules et sans accents, lettre par lettre (même longueur que le texte). */
export function foldText(text: string): string {
  let out = "";
  for (const ch of text) {
    const lower = ch.toLowerCase();
    const plain = lower.normalize("NFD").replace(/[̀-ͯ]/g, "");
    out += plain.length === 1 ? plain : lower.length === 1 ? lower : ch;
  }
  return out;
}

/**
 * Suggestions qui correspondent à la recherche, les meilleures d'abord :
 * début du libellé, puis début d'un mot, puis n'importe où, puis le sous-titre.
 */
export function filterOptions<T>(options: KolaSearchOption<T>[], query: string, max = 6): KolaSearchOption<T>[] {
  const q = foldText(query.trim());
  if (!q) return [];
  const scored: [number, number, KolaSearchOption<T>][] = [];
  options.forEach((o, i) => {
    const label = foldText(o.label);
    let score: number;
    if (label.startsWith(q)) score = 0;
    else if (label.includes(" " + q) || label.includes("-" + q) || label.includes("'" + q)) score = 1;
    else if (label.includes(q)) score = 2;
    else if (o.subtitle && foldText(o.subtitle).includes(q)) score = 3;
    else return;
    scored.push([score, i, o]);
  });
  return scored
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .slice(0, max)
    .map((s) => s[2]);
}

export type KolaSearchProps<T> = {
  options: KolaSearchOption<T>[];
  /** Label au-dessus du champ. Sans label visible, il sert quand même aux lecteurs d'écran. */
  label?: string;
  showLabel?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (query: string) => void;
  /** Appelé quand une suggestion est choisie. */
  onSelect?: (option: KolaSearchOption<T>) => void;
  /** Appelé avec le texte quand on valide (Entrée) sans choisir de suggestion. */
  onSubmit?: (query: string) => void;
  maxSuggestions?: number;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Champ de recherche avec suggestions (« yaounde » trouve Yaoundé).
 * Flèches haut / bas, Entrée et Échap au clavier.
 *
 * <KolaSearch
 *   placeholder="Rechercher une ville"
 *   options={[{ label: "Douala", subtitle: "Littoral" }, { label: "Yaoundé", subtitle: "Centre" }]}
 *   onSelect={(ville) => console.log(ville.label)}
 *   onSubmit={(texte) => lancerRecherche(texte)}
 * />
 */
export function KolaSearch<T = string>({
  options,
  label = "Rechercher",
  showLabel = false,
  placeholder = "Rechercher…",
  value,
  defaultValue = "",
  onChange,
  onSelect,
  onSubmit,
  maxSuggestions = 6,
  emptyText = "Aucun résultat",
  disabled,
  className = "",
}: KolaSearchProps<T>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const query = value ?? inner;
  const results = useMemo(() => filterOptions(options, query, maxSuggestions), [options, query, maxSuggestions]);
  const shown = open && query.trim() !== "";

  const setQuery = (q: string) => {
    setInner(q);
    onChange?.(q);
  };
  const choose = (o: KolaSearchOption<T>) => {
    setQuery(o.label);
    setOpen(false);
    setActive(-1);
    onSelect?.(o);
  };

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={`${id}-input`} className={showLabel ? "text-sm font-semibold text-kola-ink" : "sr-only"}>
        {label}
      </label>
      <div
        role="search"
        className={`flex min-h-12 items-center gap-2.5 rounded-kola border border-kola-line-strong bg-kola-surface pr-1.5 pl-3.5 transition focus-within:border-kola-primary focus-within:ring-1 focus-within:ring-kola-primary ${disabled ? "opacity-60" : ""}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="size-5 shrink-0 text-kola-ink-subtle">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="search"
          role="combobox"
          autoComplete="off"
          enterKeyHint="search"
          aria-autocomplete="list"
          aria-expanded={shown}
          aria-controls={`${id}-list`}
          aria-activedescendant={shown && active >= 0 ? `${id}-opt-${active}` : undefined}
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              if (results.length) setActive((a) => (a + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              if (results.length) setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
            } else if (e.key === "Enter") {
              if (shown && active >= 0 && results[active]) {
                e.preventDefault();
                choose(results[active]);
              } else {
                setOpen(false);
                onSubmit?.(query);
              }
            } else if (e.key === "Escape" && shown) {
              e.preventDefault();
              setOpen(false);
            }
          }}
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-kola-ink outline-none placeholder:text-kola-ink-subtle [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Effacer"
            title="Effacer"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-kola-ink-subtle hover:text-kola-ink [&_svg]:size-5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>
      <ul
        id={`${id}-list`}
        role="listbox"
        aria-label={label}
        hidden={!shown}
        className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-kola border border-kola-line bg-kola-surface py-1.5 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.25)]"
      >
        {results.length === 0 ? (
          <li className="px-4 py-3 text-sm text-kola-ink-subtle">
            {emptyText} pour « {query.trim()} »
          </li>
        ) : (
          results.map((o, i) => {
            const folded = foldText(o.label);
            const q = foldText(query.trim());
            const start = folded.indexOf(q);
            return (
              <li
                key={`${o.label}-${i}`}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-4 py-2.5 ${i === active ? "bg-kola-surface-muted" : ""}`}
              >
                <span className="block text-kola-ink">
                  {start < 0 ? (
                    o.label
                  ) : (
                    <>
                      {o.label.slice(0, start)}
                      <b className="font-bold">{o.label.slice(start, start + q.length)}</b>
                      {o.label.slice(start + q.length)}
                    </>
                  )}
                </span>
                {o.subtitle && <span className="block text-sm text-kola-ink-subtle">{o.subtitle}</span>}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
