<script lang="ts">
import { foldText } from "../KolaSearch.vue";

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
</script>

<script setup lang="ts">
/**
 * Bloc « Liste avec recherche » : recherche sans accents, chargement, liste vide.
 *
 * <KolaProductList :loading="chargement" :products="produits" @product-click="ouvrir" />
 */
import { computed, ref } from "vue";
import { formatAmount } from "../KolaAmountField.vue";
import KolaButton from "../KolaButton.vue";
import KolaEmptyState from "../KolaEmptyState.vue";
import KolaSearch from "../KolaSearch.vue";
import KolaSkeletonList from "../KolaSkeletonList.vue";

const props = withDefaults(
  defineProps<{
    products: KolaProduct[];
    /** Affiche des squelettes pendant le chargement. */
    loading?: boolean;
    title?: string;
    /** En dessous de ce stock, le produit est marqué « Stock bas ». */
    lowStock?: number;
  }>(),
  { loading: false, title: "Produits", lowStock: 10 },
);
const emit = defineEmits<{ productClick: [product: KolaProduct] }>();

const query = ref("");
const shown = computed(() => filterProducts(props.products, query.value));
const q = computed(() => query.value.trim());
</script>

<template>
  <div class="flex w-full max-w-[520px] flex-col gap-4 text-kola-ink">
    <div class="flex items-baseline justify-between gap-3">
      <h2 class="text-2xl font-bold tracking-tight">{{ title }}</h2>
      <span v-if="!loading" aria-live="polite" class="text-sm text-kola-ink-subtle">{{ shown.length }} produit{{ shown.length > 1 ? "s" : "" }}</span>
    </div>
    <KolaSearch v-model="query" :options="[]" label="Rechercher un produit" placeholder="Rechercher un produit" :disabled="loading" />
    <KolaSkeletonList v-if="loading" :rows="5" />
    <KolaEmptyState
      v-else-if="!shown.length"
      :title="q ? `Aucun produit pour « ${q} »` : 'Aucun produit'"
      :message="q ? 'Vérifie l\'orthographe ou essaie un autre mot.' : undefined"
    >
      <template #icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5M8 11h6" />
        </svg>
      </template>
      <template v-if="q" #action><KolaButton label="Effacer la recherche" variant="outline" @click="query = ''" /></template>
    </KolaEmptyState>
    <ul v-else class="flex flex-col divide-y divide-kola-line overflow-hidden rounded-[16px] border border-kola-line bg-kola-surface">
      <li v-for="p in shown" :key="p.name">
        <button type="button" class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-kola-surface-muted" @click="emit('productClick', p)">
          <span aria-hidden="true" class="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-kola-primary/12 text-kola-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5">
              <path d="M4 10h16l-1.5 10h-13zM8 10l4-6 4 6" />
            </svg>
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="truncate font-semibold">{{ p.name }}</span>
            <span class="flex items-center gap-2 text-sm text-kola-ink-subtle">
              Stock : {{ p.stock }}
              <span v-if="p.stock < lowStock" class="rounded-md bg-kola-danger/12 px-1.5 text-xs font-semibold text-kola-danger">Stock bas</span>
            </span>
          </span>
          <span class="shrink-0 font-semibold tabular-nums">{{ formatAmount(p.price) }} FCFA</span>
        </button>
      </li>
    </ul>
  </div>
</template>
