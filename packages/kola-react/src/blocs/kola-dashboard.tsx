"use client";

import { useState, type ReactNode } from "react";
import { formatAmount } from "../kola-amount-field";
import { KolaStatCard } from "../kola-card";
import { KolaDataTable } from "../kola-data-table";
import { KolaEmptyState } from "../kola-empty-state";
import { KolaTabs } from "../kola-tabs";

export type KolaOrderStatus = "pending" | "delivered" | "cancelled";

export type KolaOrder = {
  /** Numéro affiché, ex. "#1042". */
  id: string;
  customer: string;
  /** Montant en FCFA. */
  total: number;
  status: KolaOrderStatus;
};

export type KolaStat = {
  label: string;
  value: string;
  /** Évolution en %, ex. 12.5 ou -3.2. */
  change?: number;
  icon?: ReactNode;
};

export const ORDER_STATUS_LABELS: Record<KolaOrderStatus, string> = {
  pending: "En cours",
  delivered: "Livrée",
  cancelled: "Annulée",
};

/** 20 octobre 2026 → "mardi 20 octobre" */
export function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

const TABS = [
  { value: "all", label: "Toutes", empty: "Aucune commande pour le moment" },
  { value: "pending", label: "En cours", empty: "Aucune commande en cours" },
  { value: "delivered", label: "Livrées", empty: "Aucune commande livrée" },
  { value: "cancelled", label: "Annulées", empty: "Aucune commande annulée" },
] as const;

export type KolaDashboardProps = {
  name: string;
  stats: KolaStat[];
  orders: KolaOrder[];
  /** Date affichée sous le bonjour (aujourd'hui par défaut). */
  date?: Date;
  onOrderClick?: (order: KolaOrder) => void;
  className?: string;
};

/**
 * Bloc « Tableau de bord boutique » : chiffres clés, puis commandes par statut.
 *
 * <KolaDashboard
 *   name="Awa"
 *   stats={[{ label: "Ventes du jour", value: "125 000 FCFA", change: 12.5 }]}
 *   orders={commandes}
 * />
 */
export function KolaDashboard({ name, stats, orders, date, onOrderClick, className = "" }: KolaDashboardProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const shown = tab === "all" ? orders : orders.filter((o) => o.status === tab);
  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <div className={`@container flex w-full max-w-[960px] flex-col gap-5 text-kola-ink ${className}`}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bonjour, {name}</h2>
        <p className="text-kola-ink-subtle">{formatDay(date ?? new Date())}</p>
      </div>
      <div className="grid gap-4 @min-[640px]:grid-cols-3">
        {stats.map((s) => (
          <KolaStatCard key={s.label} label={s.label} value={s.value} change={s.change} icon={s.icon} />
        ))}
      </div>
      <section aria-label="Commandes" className="flex flex-col gap-4 rounded-[20px] border border-kola-line bg-kola-surface p-5">
        <h3 className="text-xl font-bold tracking-tight">Commandes</h3>
        <KolaTabs
          label="Commandes par statut"
          value={tab}
          onChange={setTab}
          items={TABS.map((t) => ({ value: t.value, label: t.label, badge: t.value === "pending" ? pending : undefined }))}
        >
          {(current) =>
            shown.length === 0 ? (
              <KolaEmptyState title={TABS.find((t) => t.value === current)!.empty} />
            ) : (
              <KolaDataTable
                key={current}
                rows={shown}
                rowsPerPage={5}
                onRowClick={onOrderClick}
                columns={[
                  { label: "N°", cell: (o) => o.id, sortBy: (o) => o.id },
                  { label: "Client", cell: (o) => o.customer, sortBy: (o) => o.customer, flex: 2 },
                  { label: "Montant", cell: (o) => `${formatAmount(o.total)} FCFA`, sortBy: (o) => o.total, numeric: true, flex: 2 },
                  { label: "Statut", cell: (o) => ORDER_STATUS_LABELS[o.status] },
                ]}
              />
            )
          }
        </KolaTabs>
      </section>
    </div>
  );
}
