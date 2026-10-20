"use client";

import { useState } from "react";
import { formatAmount } from "../kola-amount-field";
import { KolaButton } from "../kola-button";
import { KolaEmptyState, KolaSkeletonList } from "../kola-empty-state";
import { KolaSearch, foldText } from "../kola-search";

export type KolaProduct = {
  name: string;
  /** Prix en FCFA. */
  price: number;
  stock: number;
  category?: string;
};

/** Produits dont le nom (ou la catégorie) contient la recherche, sans accents. */
export function filterProducts<P extends KolaProduct>(products: P[], query: string): P[] {
  const q = foldText(query.trim());
  if (!q) return products;
  return products.filter((p) => foldText(p.name).includes(q) || foldText(p.category ?? "").includes(q));
}

export type KolaProductListProps<P extends KolaProduct> = {
  products: P[];
  /** Affiche des squelettes pendant le chargement. */
  loading?: boolean;
  title?: string;
  /** En dessous de ce stock, le produit est marqué « Stock bas ». */
  lowStock?: number;
  onProductClick?: (product: P) => void;
  className?: string;
};

/**
 * Bloc « Liste avec recherche » : recherche sans accents, chargement, liste vide.
 *
 * <KolaProductList loading={chargement} products={produits} onProductClick={(p) => ouvrir(p)} />
 */
export function KolaProductList<P extends KolaProduct>({
  products,
  loading = false,
  title = "Produits",
  lowStock = 10,
  onProductClick,
  className = "",
}: KolaProductListProps<P>) {
  const [query, setQuery] = useState("");
  const shown = filterProducts(products, query);
  const q = query.trim();

  return (
    <div className={`flex w-full max-w-[520px] flex-col gap-4 text-kola-ink ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {!loading && (
          <span aria-live="polite" className="text-sm text-kola-ink-subtle">
            {shown.length} produit{shown.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <KolaSearch options={[]} label="Rechercher un produit" placeholder="Rechercher un produit" value={query} onChange={setQuery} disabled={loading} />
      {loading ? (
        <KolaSkeletonList rows={5} />
      ) : shown.length === 0 ? (
        <KolaEmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5M8 11h6" />
            </svg>
          }
          title={q ? `Aucun produit pour « ${q} »` : "Aucun produit"}
          message={q ? "Vérifie l'orthographe ou essaie un autre mot." : undefined}
          action={q ? <KolaButton label="Effacer la recherche" variant="outline" onClick={() => setQuery("")} /> : undefined}
        />
      ) : (
        <ul className="flex flex-col divide-y divide-kola-line overflow-hidden rounded-[16px] border border-kola-line bg-kola-surface">
          {shown.map((p) => {
            const content = (
              <>
                <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-kola-primary/12 text-kola-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                    <path d="M4 10h16l-1.5 10h-13zM8 10l4-6 4 6" />
                  </svg>
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold">{p.name}</span>
                  <span className="flex items-center gap-2 text-sm text-kola-ink-subtle">
                    Stock : {p.stock}
                    {p.stock < lowStock && (
                      <span className="rounded-md bg-kola-danger/12 px-1.5 text-xs font-semibold text-kola-danger">Stock bas</span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{formatAmount(p.price)} FCFA</span>
              </>
            );
            return (
              <li key={p.name}>
                {onProductClick ? (
                  <button type="button" onClick={() => onProductClick(p)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-kola-surface-muted">
                    {content}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
