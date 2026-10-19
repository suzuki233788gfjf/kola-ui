<script lang="ts">
export type KolaColumn<T> = {
  label: string;
  /** Contenu de la cellule. */
  cell: (row: T) => string | number;
  /** Valeur de tri. Sans elle, la colonne n'est pas triable. */
  sortBy?: (row: T) => string | number;
  /** Aligne à droite (montants, quantités). */
  numeric?: boolean;
  /** Largeur relative de la colonne. */
  flex?: number;
};
</script>

<script setup lang="ts" generic="T">
/**
 * Tableau de données : tri, pagination, et cartes automatiques sous 560 px de large.
 *
 * <KolaDataTable
 *   :rows="produits"
 *   :columns="[
 *     { label: 'Produit', cell: (p) => p.nom, sortBy: (p) => p.nom, flex: 2 },
 *     { label: 'Stock', cell: (p) => p.stock, sortBy: (p) => p.stock, numeric: true },
 *   ]"
 *   @row-click="(p) => …"
 * />
 */
import { computed, ref } from "vue";

const props = withDefaults(defineProps<{ columns: KolaColumn<T>[]; rows: T[]; rowsPerPage?: number; emptyText?: string; clickable?: boolean }>(), {
  rowsPerPage: 8,
  emptyText: "Aucune donnée",
  clickable: false,
});
const emit = defineEmits<{ rowClick: [row: T] }>();
const sort = ref<{ index: number; asc: boolean } | null>(null);
const page = ref(0);

const sorted = computed(() => {
  const list = [...props.rows];
  const s = sort.value;
  if (s) {
    const by = props.columns[s.index].sortBy!;
    list.sort((a, b) => {
      const x = by(a), y = by(b);
      const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "fr");
      return s.asc ? r : -r;
    });
  }
  return list;
});
const perPage = computed(() => Math.max(1, props.rowsPerPage));
const pages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage.value)));
const current = computed(() => Math.min(page.value, pages.value - 1));
const visible = computed(() => sorted.value.slice(current.value * perPage.value, current.value * perPage.value + perPage.value));
const total = computed(() => props.columns.reduce((s, c) => s + (c.flex ?? 1), 0));

function toggle(i: number) {
  sort.value = sort.value?.index === i ? { index: i, asc: !sort.value.asc } : { index: i, asc: true };
  page.value = 0;
}
function onKey(e: KeyboardEvent, row: T) {
  if (props.clickable && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    emit("rowClick", row);
  }
}
</script>

<template>
  <div class="@container w-full overflow-hidden rounded-[16px] border border-kola-line bg-kola-surface text-kola-ink">
    <table class="hidden w-full table-fixed border-collapse @min-[560px]:table">
      <colgroup>
        <col v-for="(c, i) in columns" :key="i" :style="{ width: ((c.flex ?? 1) / total) * 100 + '%' }" />
      </colgroup>
      <thead>
        <tr class="border-b border-kola-line bg-kola-surface-muted">
          <th
            v-for="(c, i) in columns"
            :key="i"
            scope="col"
            :aria-sort="sort?.index === i ? (sort.asc ? 'ascending' : 'descending') : undefined"
            :class="['px-4 py-3 text-sm font-semibold text-kola-ink-muted', c.numeric ? 'text-right' : 'text-left']"
          >
            <button v-if="c.sortBy" type="button" :aria-label="`Trier par ${c.label}`" :class="['inline-flex items-center gap-1 rounded hover:text-kola-ink', sort?.index === i && 'text-kola-ink']" @click="toggle(i)">
              {{ c.label }}
              <svg viewBox="0 0 24 24" :class="['size-4', sort?.index !== i && 'opacity-40']" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path v-if="sort?.index === i && !sort.asc" d="M12 5v14M6 13l6 6 6-6" />
                <path v-else-if="sort?.index === i" d="M12 19V5M6 11l6-6 6 6" />
                <path v-else d="M8 9l4-4 4 4M8 15l4 4 4-4" />
              </svg>
            </button>
            <template v-else>{{ c.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, r) in visible"
          :key="r"
          :tabindex="clickable ? 0 : undefined"
          :class="['border-b border-kola-line last:border-0', clickable && 'cursor-pointer hover:bg-kola-surface-muted']"
          @click="clickable && emit('rowClick', row)"
          @keydown="onKey($event, row)"
        >
          <td v-for="(c, i) in columns" :key="i" :class="['truncate px-4 py-3', c.numeric && 'text-right tabular-nums']">{{ c.cell(row) }}</td>
        </tr>
      </tbody>
    </table>

    <ul class="flex flex-col @min-[560px]:hidden">
      <li
        v-for="(row, r) in visible"
        :key="r"
        :tabindex="clickable ? 0 : undefined"
        :class="['flex flex-col gap-1.5 border-b border-kola-line p-4 last:border-0', clickable && 'cursor-pointer hover:bg-kola-surface-muted']"
        @click="clickable && emit('rowClick', row)"
        @keydown="onKey($event, row)"
      >
        <span class="font-semibold">{{ columns[0].cell(row) }}</span>
        <span v-for="(c, i) in columns.slice(1)" :key="i" class="flex justify-between gap-3 text-sm">
          <span class="text-kola-ink-subtle">{{ c.label }}</span>
          <span :class="c.numeric && 'tabular-nums'">{{ c.cell(row) }}</span>
        </span>
      </li>
    </ul>

    <p v-if="rows.length === 0" class="px-4 py-10 text-center text-kola-ink-subtle">{{ emptyText }}</p>

    <div class="flex items-center justify-end gap-2 border-t border-kola-line px-3 py-2 text-sm text-kola-ink-muted">
      <span class="mr-2 tabular-nums">{{ sorted.length === 0 ? 0 : current * perPage + 1 }}–{{ current * perPage + visible.length }} sur {{ sorted.length }}</span>
      <button type="button" aria-label="Page précédente" title="Page précédente" :disabled="current === 0" class="flex size-10 items-center justify-center rounded-full hover:bg-kola-surface-muted disabled:opacity-30" @click="page = current - 1">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <button type="button" aria-label="Page suivante" title="Page suivante" :disabled="current >= pages - 1" class="flex size-10 items-center justify-center rounded-full hover:bg-kola-surface-muted disabled:opacity-30" @click="page = current + 1">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>
  </div>
</template>
