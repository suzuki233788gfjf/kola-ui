<script lang="ts">
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
</script>

<script setup lang="ts">
/**
 * Bloc « Tableau de bord boutique » : chiffres clés, puis commandes par statut.
 *
 * <KolaDashboard name="Awa" :stats="chiffres" :orders="commandes" @order-click="ouvrir" />
 * Icône d'un chiffre clé : <template #icon-0><MonIcone /></template> (0, 1, 2… selon la position)
 */
import { computed, ref } from "vue";
import { formatAmount } from "../KolaAmountField.vue";
import KolaStatCard from "../KolaStatCard.vue";
import KolaDataTable, { type KolaColumn } from "../KolaDataTable.vue";
import KolaEmptyState from "../KolaEmptyState.vue";
import KolaTabs from "../KolaTabs.vue";

const props = defineProps<{
  name: string;
  stats: KolaStat[];
  orders: KolaOrder[];
  /** Date affichée sous le bonjour (aujourd'hui par défaut). */
  date?: Date;
}>();
const emit = defineEmits<{ orderClick: [order: KolaOrder] }>();

const TABS = [
  { value: "all", label: "Toutes", empty: "Aucune commande pour le moment" },
  { value: "pending", label: "En cours", empty: "Aucune commande en cours" },
  { value: "delivered", label: "Livrées", empty: "Aucune commande livrée" },
  { value: "cancelled", label: "Annulées", empty: "Aucune commande annulée" },
];
const tab = ref("all");
const pending = computed(() => props.orders.filter((o) => o.status === "pending").length);
const items = computed(() => TABS.map((t) => ({ value: t.value, label: t.label, badge: t.value === "pending" ? pending.value : undefined })));
const shown = computed(() => (tab.value === "all" ? props.orders : props.orders.filter((o) => o.status === tab.value)));
const day = computed(() => formatDay(props.date ?? new Date()));
const columns: KolaColumn<KolaOrder>[] = [
  { label: "N°", cell: (o) => o.id, sortBy: (o) => o.id },
  { label: "Client", cell: (o) => o.customer, sortBy: (o) => o.customer, flex: 2 },
  { label: "Montant", cell: (o) => `${formatAmount(o.total)} FCFA`, sortBy: (o) => o.total, numeric: true, flex: 2 },
  { label: "Statut", cell: (o) => ORDER_STATUS_LABELS[o.status] },
];
</script>

<template>
  <div class="@container flex w-full max-w-[960px] flex-col gap-5 text-kola-ink">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Bonjour, {{ name }}</h2>
      <p class="text-kola-ink-subtle">{{ day }}</p>
    </div>
    <div class="grid gap-4 @min-[640px]:grid-cols-3">
      <KolaStatCard v-for="(s, i) in stats" :key="s.label" :label="s.label" :value="s.value" :change="s.change ?? null">
        <template v-if="$slots[`icon-${i}`]" #icon><slot :name="`icon-${i}`" /></template>
      </KolaStatCard>
    </div>
    <section aria-label="Commandes" class="flex flex-col gap-4 rounded-[20px] border border-kola-line bg-kola-surface p-5">
      <h3 class="text-xl font-bold tracking-tight">Commandes</h3>
      <KolaTabs v-model="tab" label="Commandes par statut" :items="items">
        <template #default="{ value }">
          <KolaEmptyState v-if="!shown.length" :title="TABS.find((t) => t.value === value)!.empty" />
          <KolaDataTable v-else :key="value" :rows="shown" :columns="columns" :rows-per-page="5" clickable @row-click="emit('orderClick', $event)" />
        </template>
      </KolaTabs>
    </section>
  </div>
</template>
