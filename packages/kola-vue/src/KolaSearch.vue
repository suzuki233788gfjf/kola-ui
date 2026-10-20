<script lang="ts">
export type KolaSearchOption = {
  label: string;
  /** Petit texte sous le libellé (ex. la région d'une ville). La recherche le lit aussi. */
  subtitle?: string;
  /** Ce que tu veux récupérer quand la suggestion est choisie (un id, un produit…). */
  value?: unknown;
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
export function filterOptions(options: KolaSearchOption[], query: string, max = 6): KolaSearchOption[] {
  const q = foldText(query.trim());
  if (!q) return [];
  const scored: [number, number, KolaSearchOption][] = [];
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
</script>

<script setup lang="ts">
/**
 * Champ de recherche avec suggestions (« yaounde » trouve Yaoundé).
 * Flèches haut / bas, Entrée et Échap au clavier.
 *
 * <KolaSearch
 *   v-model="texte"
 *   placeholder="Rechercher une ville"
 *   :options="[{ label: 'Douala', subtitle: 'Littoral' }, { label: 'Yaoundé', subtitle: 'Centre' }]"
 *   @select="(ville) => console.log(ville.label)"
 *   @submit="lancerRecherche"
 * />
 */
import { computed, ref, useId } from "vue";

const props = withDefaults(
  defineProps<{
    options: KolaSearchOption[];
    /** Label au-dessus du champ. Sans label visible, il sert quand même aux lecteurs d'écran. */
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    maxSuggestions?: number;
    emptyText?: string;
    disabled?: boolean;
  }>(),
  { label: "Rechercher", showLabel: false, placeholder: "Rechercher…", maxSuggestions: 6, emptyText: "Aucun résultat", disabled: false },
);
const model = defineModel<string>({ default: "" });
const emit = defineEmits<{ select: [option: KolaSearchOption]; submit: [query: string] }>();

const id = useId();
const input = ref<HTMLInputElement | null>(null);
const open = ref(false);
const active = ref(-1);
const results = computed(() => filterOptions(props.options, model.value, props.maxSuggestions));
const shown = computed(() => open.value && model.value.trim() !== "");
const q = computed(() => foldText(model.value.trim()));

function parts(label: string): [string, string, string] {
  const start = q.value ? foldText(label).indexOf(q.value) : -1;
  if (start < 0) return [label, "", ""];
  return [label.slice(0, start), label.slice(start, start + q.value.length), label.slice(start + q.value.length)];
}

function choose(o: KolaSearchOption) {
  model.value = o.label;
  open.value = false;
  active.value = -1;
  emit("select", o);
}

function onInput(e: Event) {
  model.value = (e.target as HTMLInputElement).value;
  open.value = true;
  active.value = -1;
}

function onKeydown(e: KeyboardEvent) {
  const n = results.value.length;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    open.value = true;
    if (n) active.value = (active.value + 1) % n;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (n) active.value = active.value <= 0 ? n - 1 : active.value - 1;
  } else if (e.key === "Enter") {
    if (shown.value && active.value >= 0 && results.value[active.value]) {
      e.preventDefault();
      choose(results.value[active.value]);
    } else {
      open.value = false;
      emit("submit", model.value);
    }
  } else if (e.key === "Escape" && shown.value) {
    e.preventDefault();
    open.value = false;
  }
}

function clear() {
  model.value = "";
  input.value?.focus();
}
</script>

<template>
  <div class="relative flex flex-col gap-1.5">
    <label :for="`${id}-input`" :class="showLabel ? 'text-sm font-semibold text-kola-ink' : 'sr-only'">{{ label }}</label>
    <div
      role="search"
      :class="[
        'flex min-h-12 items-center gap-2.5 rounded-kola border border-kola-line-strong bg-kola-surface pr-1.5 pl-3.5 transition focus-within:border-kola-primary focus-within:ring-1 focus-within:ring-kola-primary',
        disabled && 'opacity-60',
      ]"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" class="size-5 shrink-0 text-kola-ink-subtle">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        :id="`${id}-input`"
        ref="input"
        type="search"
        role="combobox"
        autocomplete="off"
        enterkeyhint="search"
        aria-autocomplete="list"
        :aria-expanded="shown"
        :aria-controls="`${id}-list`"
        :aria-activedescendant="shown && active >= 0 ? `${id}-opt-${active}` : undefined"
        :value="model"
        :disabled="disabled"
        :placeholder="placeholder"
        class="min-w-0 flex-1 bg-transparent py-3 text-base text-kola-ink outline-none placeholder:text-kola-ink-subtle [&::-webkit-search-cancel-button]:hidden"
        @input="onInput"
        @focus="open = true"
        @blur="open = false"
        @keydown="onKeydown"
      />
      <button
        v-if="model"
        type="button"
        aria-label="Effacer"
        title="Effacer"
        class="flex size-9 shrink-0 items-center justify-center rounded-lg text-kola-ink-subtle hover:text-kola-ink [&_svg]:size-5"
        @click="clear"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
    <ul
      :id="`${id}-list`"
      role="listbox"
      :aria-label="label"
      :hidden="!shown"
      class="absolute inset-x-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-kola border border-kola-line bg-kola-surface py-1.5 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.25)]"
    >
      <li v-if="!results.length" class="px-4 py-3 text-sm text-kola-ink-subtle">{{ emptyText }} pour « {{ model.trim() }} »</li>
      <template v-else>
      <li
        v-for="(o, i) in results"
        :id="`${id}-opt-${i}`"
        :key="`${o.label}-${i}`"
        role="option"
        :aria-selected="i === active"
        :class="['cursor-pointer px-4 py-2.5', i === active && 'bg-kola-surface-muted']"
        @mousedown.prevent
        @click="choose(o)"
        @mouseenter="active = i"
      >
        <span class="block text-kola-ink">{{ parts(o.label)[0] }}<b class="font-bold">{{ parts(o.label)[1] }}</b>{{ parts(o.label)[2] }}</span>
        <span v-if="o.subtitle" class="block text-sm text-kola-ink-subtle">{{ o.subtitle }}</span>
      </li>
      </template>
    </ul>
  </div>
</template>
