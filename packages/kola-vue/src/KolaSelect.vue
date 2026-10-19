<script lang="ts">
export type KolaSelectOption<T> = { value: T; label: string; subtitle?: string };

/** "Yaoundé" → "yaounde" : la recherche ignore accents et majuscules. */
export function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae").toLowerCase().trim();
}
</script>

<script setup lang="ts" generic="T">
/**
 * Sélecteur avec recherche (« yaounde » trouve Yaoundé).
 *
 * <KolaSelect
 *   v-model="ville"
 *   label="Ville"
 *   :options="[
 *     { value: 'dla', label: 'Douala', subtitle: 'Littoral' },
 *     { value: 'yde', label: 'Yaoundé', subtitle: 'Centre' },
 *   ]"
 * />
 */
import { computed, nextTick, ref, useId, watch } from "vue";

const props = withDefaults(
  defineProps<{ label: string; options: KolaSelectOption<T>[]; placeholder?: string; searchPlaceholder?: string; emptyText?: string }>(),
  { placeholder: "Choisir…", searchPlaceholder: "Rechercher…", emptyText: "Aucun résultat" },
);
const model = defineModel<T | null>({ default: null });
const open = ref(false);
const query = ref("");
const dialog = ref<HTMLDialogElement | null>(null);
const search = ref<HTMLInputElement | null>(null);
const id = useId();

const selected = computed(() => props.options.find((o) => o.value === model.value));
const filtered = computed(() => {
  const q = normalize(query.value);
  return q ? props.options.filter((o) => normalize(o.label).includes(q) || (o.subtitle && normalize(o.subtitle).includes(q))) : props.options;
});
watch(open, async (o) => {
  const d = dialog.value;
  if (!d) return;
  if (o && !d.open) {
    d.showModal();
    await nextTick();
    search.value?.focus();
  }
  if (!o && d.open) d.close();
});
function choose(v: T) {
  model.value = v;
  open.value = false;
}
function onEnter() {
  if (filtered.value.length) choose(filtered.value[0].value);
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span :id="id" class="text-sm font-semibold text-kola-ink">{{ label }}</span>
    <button
      type="button"
      aria-haspopup="dialog"
      :aria-labelledby="`${id} ${id}-value`"
      class="flex min-h-12 items-center justify-between gap-2.5 rounded-kola border border-kola-line-strong bg-kola-surface px-3.5 text-left hover:border-kola-ink-subtle focus-visible:border-kola-primary focus-visible:ring-1 focus-visible:ring-kola-primary focus-visible:outline-none"
      @click="
        query = '';
        open = true;
      "
    >
      <span :id="`${id}-value`" :class="selected ? 'text-kola-ink' : 'text-kola-ink-subtle'">{{ selected?.label ?? placeholder }}</span>
      <svg viewBox="0 0 24 24" class="size-5 text-kola-ink-subtle" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <dialog
      ref="dialog"
      :aria-label="label"
      class="m-auto w-[calc(100%-32px)] max-w-[420px] rounded-[20px] border border-kola-line bg-kola-surface p-0 text-kola-ink shadow-2xl backdrop:bg-black/40"
      @close="open = false"
      @click="$event.target === $event.currentTarget && (open = false)"
    >
      <div v-if="open" class="flex max-h-[min(560px,80vh)] flex-col">
        <div class="flex flex-col gap-3 border-b border-kola-line p-4">
          <p class="text-lg font-bold">{{ label }}</p>
          <input
            ref="search"
            v-model="query"
            type="search"
            :aria-label="searchPlaceholder"
            :placeholder="searchPlaceholder"
            class="min-h-11 rounded-kola border border-kola-line-strong bg-kola-surface px-3 outline-none placeholder:text-kola-ink-subtle focus:border-kola-primary focus:ring-1 focus:ring-kola-primary"
            @keydown.enter.prevent="onEnter"
          />
        </div>
        <ul role="listbox" :aria-label="label" class="overflow-y-auto p-2">
          <li v-if="filtered.length === 0" class="px-3 py-6 text-center text-kola-ink-subtle">{{ emptyText }}</li>
          <li v-for="(o, i) in filtered" :key="i" role="option" :aria-selected="o.value === model">
            <button
              type="button"
              :class="['flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left hover:bg-kola-surface-muted', o.value === model && 'bg-kola-primary/10']"
              @click="choose(o.value)"
            >
              <span class="flex flex-col">
                <span :class="o.value === model && 'font-semibold text-kola-primary'">{{ o.label }}</span>
                <span v-if="o.subtitle" class="text-sm text-kola-ink-subtle">{{ o.subtitle }}</span>
              </span>
              <svg v-if="o.value === model" viewBox="0 0 24 24" class="size-5 text-kola-primary" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </dialog>
  </div>
</template>
