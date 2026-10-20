"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/** Un onglet : une valeur, un libellé, une icône facultative et un compteur facultatif. */
export type KolaTabItem<T extends string = string> = {
  value: T;
  label: string;
  /** Icône SVG. Obligatoire pour KolaBottomNav, facultative pour KolaTabs. */
  icon?: ReactNode;
  /** Petit compteur (ex. 3 commandes en cours). Masqué si 0, "99+" au-delà de 99. */
  badge?: number;
};

/** 3 → "3", 120 → "99+" */
export function badgeLabel(count: number): string {
  return count > 99 ? "99+" : String(count);
}

/** Petit compteur rond : 3, 12, 99+. */
export function KolaBadge({ count, className = "" }: { count?: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-kola-primary px-1.5 text-[11px] leading-none font-bold text-kola-on-primary ${className}`}
    >
      {badgeLabel(count)}
    </span>
  );
}

export type KolaTabsProps<T extends string> = {
  items: KolaTabItem<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** Soulignés (par défaut) ou pastilles. */
  variant?: "underline" | "pills";
  /** Les onglets se partagent toute la largeur au lieu de défiler. */
  expand?: boolean;
  /** Nom de la liste d'onglets pour les lecteurs d'écran, ex. "Commandes". */
  label?: string;
  /** Contenu de l'onglet choisi. */
  children?: (value: T) => ReactNode;
  className?: string;
};

/**
 * Onglets en haut d'une page. Flèches gauche / droite, Début et Fin au clavier.
 *
 * <KolaTabs
 *   label="Commandes"
 *   items={[
 *     { value: "en-cours", label: "En cours", badge: 3 },
 *     { value: "livrees", label: "Livrées" },
 *   ]}
 * >
 *   {(onglet) => <ListeCommandes statut={onglet} />}
 * </KolaTabs>
 */
export function KolaTabs<T extends string>({
  items,
  value,
  defaultValue,
  onChange,
  variant = "underline",
  expand = false,
  label,
  children,
  className = "",
}: KolaTabsProps<T>) {
  const base = useId();
  const [inner, setInner] = useState<T | undefined>(defaultValue ?? items[0]?.value);
  const current = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, items.findIndex((i) => i.value === current));
  const pills = variant === "pills";

  const select = (next: T) => {
    setInner(next);
    if (next !== current) onChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const last = items.length - 1;
    const next =
      e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    select(items[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={`flex min-w-0 flex-col gap-4 ${className}`}>
      <div
        role="tablist"
        aria-label={label}
        className={`flex [scrollbar-width:none] ${
          pills
            ? `gap-1 rounded-[14px] bg-kola-surface-muted p-1 ${expand ? "" : "max-w-full self-start overflow-x-auto"}`
            : `border-b border-kola-line ${expand ? "" : "overflow-x-auto"}`
        }`}
      >
        {items.map((item, i) => {
          const selected = i === index;
          return (
            <button
              key={item.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-selected={selected}
              aria-controls={children ? `${base}-panel` : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex shrink-0 items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap transition outline-none focus-visible:ring-2 focus-visible:ring-kola-primary [&_svg]:size-[18px] ${
                expand ? "min-w-0 flex-1" : ""
              } ${
                pills
                  ? `min-h-10 rounded-[10px] ${expand ? "px-2" : "px-3.5"} ${selected ? "bg-kola-surface text-kola-ink shadow-sm" : "text-kola-ink-subtle hover:text-kola-ink"}`
                  : `-mb-px min-h-12 border-b-2 ${expand ? "px-2" : "px-4"} ${selected ? "border-kola-primary text-kola-primary" : "border-transparent text-kola-ink-subtle hover:text-kola-ink"}`
              }`}
            >
              {item.icon && (
                <span aria-hidden className="flex">
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
              <KolaBadge count={item.badge} />
            </button>
          );
        })}
      </div>
      {children && current !== undefined && (
        <div
          role="tabpanel"
          id={`${base}-panel`}
          aria-labelledby={`${base}-tab-${index}`}
          tabIndex={0}
          className="rounded-kola outline-none focus-visible:ring-2 focus-visible:ring-kola-primary"
        >
          {children(current)}
        </div>
      )}
    </div>
  );
}

export type KolaBottomNavItem<T extends string = string> = KolaTabItem<T> & {
  /** Lien de la page : l'onglet devient un lien <a>. */
  href?: string;
};

export type KolaBottomNavProps<T extends string> = {
  items: KolaBottomNavItem<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** Nom de la barre pour les lecteurs d'écran. */
  label?: string;
  /** Collée en bas de l'écran (position fixed). */
  fixed?: boolean;
  className?: string;
};

/**
 * Barre d'onglets en bas d'une app mobile (3 à 5 onglets, avec icône).
 *
 * <KolaBottomNav
 *   fixed
 *   value={page}
 *   onChange={setPage}
 *   items={[
 *     { value: "accueil", label: "Accueil", icon: <IconeAccueil /> },
 *     { value: "commandes", label: "Commandes", icon: <IconeRecu />, badge: 2 },
 *   ]}
 * />
 */
export function KolaBottomNav<T extends string>({
  items,
  value,
  defaultValue,
  onChange,
  label = "Navigation principale",
  fixed = false,
  className = "",
}: KolaBottomNavProps<T>) {
  const [inner, setInner] = useState<T | undefined>(defaultValue ?? items[0]?.value);
  const current = value ?? inner;

  return (
    <nav
      aria-label={label}
      className={`border-t border-kola-line bg-kola-surface pb-[env(safe-area-inset-bottom)] ${fixed ? "fixed inset-x-0 bottom-0 z-40" : ""} ${className}`}
    >
      <ul className="mx-auto flex h-[68px] max-w-lg">
        {items.map((item) => {
          const selected = item.value === current;
          const content = (
            <>
              <span
                className={`relative flex h-[30px] w-14 items-center justify-center rounded-full transition [&_svg]:size-[22px] ${
                  selected ? "bg-kola-primary/12 text-kola-primary" : "text-kola-ink-subtle"
                }`}
              >
                <span aria-hidden className="flex">
                  {item.icon}
                </span>
                <KolaBadge count={item.badge} className="absolute -top-1 right-1.5" />
              </span>
              <span className={`max-w-full truncate px-1 text-xs ${selected ? "font-semibold text-kola-primary" : "font-medium text-kola-ink-subtle"}`}>
                {item.label}
              </span>
            </>
          );
          const props = {
            "aria-current": selected ? ("page" as const) : undefined,
            onClick: () => {
              setInner(item.value);
              if (!selected) onChange?.(item.value);
            },
            className:
              "flex h-full w-full flex-col items-center justify-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-kola-primary focus-visible:ring-inset",
          };
          return (
            <li key={item.value} className="min-w-0 flex-1">
              {item.href ? (
                <a href={item.href} {...props}>
                  {content}
                </a>
              ) : (
                <button type="button" {...props}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
