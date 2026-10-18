"use client";

import type { ReactNode } from "react";

export type KolaCardProps = {
  /** Image ou illustration en haut de la carte. */
  media?: ReactNode;
  mediaHeight?: number;
  /** Petite étiquette sur l'image : « Nouveau », « -20 % »… */
  badge?: string;
  title: string;
  subtitle?: string;
  /** Bas de carte : prix, boutons… */
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
};

/**
 * Carte produit.
 *
 * <KolaCard
 *   media={<img src={url} alt="" className="size-full object-cover" />}
 *   badge="Nouveau"
 *   title="Riz parfumé 5 kg"
 *   subtitle="Épicerie · En stock"
 *   footer={<strong>4 500 FCFA</strong>}
 * />
 */
export function KolaCard({ media, mediaHeight = 140, badge, title, subtitle, footer, onClick, className = "" }: KolaCardProps) {
  const body = (
    <>
      {media !== undefined && (
        <div style={{ height: mediaHeight }} className="relative flex items-center justify-center overflow-hidden bg-kola-surface-muted text-kola-ink-subtle">
          {media}
          {badge && (
            <span className="absolute top-3 left-3 rounded-full bg-kola-primary px-2.5 py-1 text-xs font-semibold text-kola-on-primary">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1 p-4">
        {media === undefined && badge && (
          <span className="mb-1 self-start rounded-full bg-kola-primary/12 px-2.5 py-1 text-xs font-semibold text-kola-primary">{badge}</span>
        )}
        <h3 className="font-semibold text-kola-ink">{title}</h3>
        {subtitle && <p className="text-sm text-kola-ink-subtle">{subtitle}</p>}
        {footer && <div className="mt-2 font-bold text-kola-ink">{footer}</div>}
      </div>
    </>
  );
  const base = `flex w-full flex-col overflow-hidden rounded-[16px] border border-kola-line bg-kola-surface text-left ${className}`;
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${base} transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kola-primary`}
    >
      {body}
    </button>
  ) : (
    <article className={base}>{body}</article>
  );
}

/** "+12,5 %" (null si pas de valeur) */
export function formatChange(change: number) {
  const abs = Math.abs(change).toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  return `${change > 0 ? "+" : change < 0 ? "-" : ""}${abs} %`;
}

export type KolaStatCardProps = {
  label: string;
  value: string;
  /** Évolution en %, ex. 12.5 ou -3. Vert si positive, rouge si négative. */
  change?: number | null;
  icon?: ReactNode;
  className?: string;
};

/**
 * Carte statistique : un chiffre clé et son évolution.
 *
 * <KolaStatCard label="Ventes du jour" value="125 000 FCFA" change={12.5} />
 */
export function KolaStatCard({ label, value, change, icon, className = "" }: KolaStatCardProps) {
  const up = (change ?? 0) >= 0;
  return (
    <div className={`flex w-full flex-col gap-3 rounded-[16px] border border-kola-line bg-kola-surface p-5 text-kola-ink ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-kola-ink-muted">{label}</span>
        {icon && (
          <span aria-hidden className="flex size-9 items-center justify-center rounded-[10px] bg-kola-primary/12 text-kola-primary [&_svg]:size-5">
            {icon}
          </span>
        )}
      </div>
      <span className="text-[28px] leading-tight font-bold tracking-tight">{value}</span>
      {change !== undefined && change !== null && (
        <span className={`flex items-center gap-1.5 text-sm font-semibold ${up ? "text-kola-success" : "text-kola-danger"}`}>
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d={up ? "M3 17l6-6 4 4 8-8M15 7h6v6" : "M3 7l6 6 4-4 8 8M15 17h6v-6"} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {formatChange(change)}
          <span className="font-normal text-kola-ink-subtle">vs hier</span>
        </span>
      )}
    </div>
  );
}
