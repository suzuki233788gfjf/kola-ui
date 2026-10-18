"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

export type KolaColumn<T> = {
  label: string;
  /** Contenu de la cellule. */
  cell: (row: T) => ReactNode;
  /** Valeur de tri. Sans elle, la colonne n'est pas triable. */
  sortBy?: (row: T) => string | number;
  /** Aligne à droite (montants, quantités). */
  numeric?: boolean;
  /** Largeur relative de la colonne. */
  flex?: number;
};

export type KolaDataTableProps<T> = {
  columns: KolaColumn<T>[];
  rows: T[];
  rowsPerPage?: number;
  onRowClick?: (row: T) => void;
  emptyText?: string;
  className?: string;
};

/**
 * Tableau de données : tri, pagination, et cartes automatiques quand la place manque
 * (moins de 560 px de large).
 *
 * <KolaDataTable
 *   rows={produits}
 *   columns={[
 *     { label: "Produit", cell: (p) => p.nom, sortBy: (p) => p.nom, flex: 2 },
 *     { label: "Stock", cell: (p) => p.stock, sortBy: (p) => p.stock, numeric: true },
 *   ]}
 * />
 */
export function KolaDataTable<T>({
  columns,
  rows,
  rowsPerPage = 8,
  onRowClick,
  emptyText = "Aucune donnée",
  className = "",
}: KolaDataTableProps<T>) {
  const [sort, setSort] = useState<{ index: number; asc: boolean } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = [...rows];
  if (sort) {
    const by = columns[sort.index].sortBy!;
    sorted.sort((a, b) => {
      const x = by(a);
      const y = by(b);
      const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "fr");
      return sort.asc ? r : -r;
    });
  }

  const perPage = Math.max(1, rowsPerPage);
  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * perPage, current * perPage + perPage);
  const from = sorted.length === 0 ? 0 : current * perPage + 1;
  const to = current * perPage + visible.length;
  const total = columns.reduce((s, c) => s + (c.flex ?? 1), 0);

  function toggle(index: number) {
    setSort((s) => (s?.index === index ? { index, asc: !s.asc } : { index, asc: true }));
    setPage(0);
  }

  const rowProps = (row: T) =>
    onRowClick
      ? {
          tabIndex: 0,
          onClick: () => onRowClick(row),
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onRowClick(row);
            }
          },
        }
      : {};

  return (
    <div className={`@container w-full overflow-hidden rounded-[16px] border border-kola-line bg-kola-surface text-kola-ink ${className}`}>
      {/* Grand écran : tableau */}
      <table className="hidden w-full table-fixed border-collapse @min-[560px]:table">
        <colgroup>
          {columns.map((c, i) => (
            <col key={i} style={{ width: `${((c.flex ?? 1) / total) * 100}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-kola-line bg-kola-surface-muted">
            {columns.map((c, i) => {
              const active = sort?.index === i;
              return (
                <th
                  key={i}
                  scope="col"
                  aria-sort={active ? (sort.asc ? "ascending" : "descending") : undefined}
                  className={`px-4 py-3 text-sm font-semibold text-kola-ink-muted ${c.numeric ? "text-right" : "text-left"}`}
                >
                  {c.sortBy ? (
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      aria-label={`Trier par ${c.label}`}
                      className={`inline-flex items-center gap-1 rounded hover:text-kola-ink ${active ? "text-kola-ink" : ""}`}
                    >
                      {c.label}
                      <SortIcon state={active ? (sort.asc ? "asc" : "desc") : null} />
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, r) => (
            <tr
              key={r}
              {...rowProps(row)}
              className={`border-b border-kola-line last:border-0 ${onRowClick ? "cursor-pointer hover:bg-kola-surface-muted" : ""}`}
            >
              {columns.map((c, i) => (
                <td key={i} className={`truncate px-4 py-3 ${c.numeric ? "text-right tabular-nums" : ""}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Petit écran : cartes */}
      <ul className="flex flex-col @min-[560px]:hidden">
        {visible.map((row, r) => (
          <li
            key={r}
            {...rowProps(row)}
            className={`flex flex-col gap-1.5 border-b border-kola-line p-4 last:border-0 ${onRowClick ? "cursor-pointer hover:bg-kola-surface-muted" : ""}`}
          >
            <span className="font-semibold">{columns[0].cell(row)}</span>
            {columns.slice(1).map((c, i) => (
              <span key={i} className="flex justify-between gap-3 text-sm">
                <span className="text-kola-ink-subtle">{c.label}</span>
                <span className={c.numeric ? "tabular-nums" : ""}>{c.cell(row)}</span>
              </span>
            ))}
          </li>
        ))}
      </ul>

      {rows.length === 0 && <p className="px-4 py-10 text-center text-kola-ink-subtle">{emptyText}</p>}

      <div className="flex items-center justify-end gap-2 border-t border-kola-line px-3 py-2 text-sm text-kola-ink-muted">
        <span className="mr-2 tabular-nums">
          {from}–{to} sur {sorted.length}
        </span>
        <PageButton label="Page précédente" disabled={current === 0} onClick={() => setPage(current - 1)} path="M15 6l-6 6 6 6" />
        <PageButton label="Page suivante" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} path="M9 6l6 6-6 6" />
      </div>
    </div>
  );
}

function SortIcon({ state }: { state: "asc" | "desc" | null }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-4 ${state ? "" : "opacity-40"}`} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      {state === "desc" ? <path d="M12 5v14M6 13l6 6 6-6" /> : state === "asc" ? <path d="M12 19V5M6 11l6-6 6 6" /> : <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />}
    </svg>
  );
}

function PageButton({ label, path, disabled, onClick }: { label: string; path: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full hover:bg-kola-surface-muted disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
