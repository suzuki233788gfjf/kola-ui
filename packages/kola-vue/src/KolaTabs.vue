<script lang="ts">
import type { Component } from "vue";

/** Un onglet : une valeur, un libellé, une icône facultative et un compteur facultatif. */
export type KolaTabItem = {
  value: string;
  label: string;
  /** Icône (un composant Vue). Obligatoire pour KolaBottomNav, facultative ici. */
  icon?: Component;
  /** Petit compteur (ex. 3 commandes en cours). Masqué si 0, "99+" au-delà de 99. */
  badge?: number;
};

/** 3 → "3", 120 → "99+" */
export function badgeLabel(count: number): string {
  return count > 99 ? "99+" : String(count);
}
</script>

<script setup lang="ts">
/**
 * Onglets en haut d'une page. Flèches gauche / droite, Début et Fin au clavier.
 *
 * <KolaTabs v-model="onglet" label="Commandes" :items="[
 *   { value: 'en-cours', label: 'En cours', badge: 3 },
 *   { value: 'livrees', label: 'Livrées' },
 * ]">
 *   <template #default="{ value }"><ListeCommandes :statut="value" /></template>
 * </KolaTabs>
 */
import { computed, ref, useId, useSlots } from "vue";

const props = withDefaults(
  defineProps<{
    items: KolaTabItem[];
    /** Soulignés (par défaut) ou pastilles. */
    variant?: "underline" | "pills";
    /** Les onglets se partagent toute la largeur au lieu de défiler. */
    expand?: boolean;
    /** Nom de la liste d'onglets pour les lecteurs d'écran, ex. "Commandes". */
    label?: string;
  }>(),
  { variant: "underline", expand: false },
);
const model = defineModel<string>();
defineSlots<{ default?: (props: { value: string }) => unknown }>();
const slots = useSlots();

const base = useId();
const tabs = ref<HTMLButtonElement[]>([]);
const current = computed(() => model.value ?? props.items[0]?.value);
const index = computed(() => Math.max(0, props.items.findIndex((i) => i.value === current.value)));
const pills = computed(() => props.variant === "pills");

function select(i: number) {
  model.value = props.items[i].value;
}

function onKeydown(e: KeyboardEvent, i: number) {
  const last = props.items.length - 1;
  const next =
    e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
    : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
    : e.key === "Home" ? 0
    : e.key === "End" ? last
    : null;
  if (next === null) return;
  e.preventDefault();
  select(next);
  tabs.value[next]?.focus();
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-4">
    <div
      role="tablist"
      :aria-label="label"
      :class="[
        'flex [scrollbar-width:none]',
        pills
          ? ['gap-1 rounded-[14px] bg-kola-surface-muted p-1', !expand && 'max-w-full self-start overflow-x-auto']
          : ['border-b border-kola-line', !expand && 'overflow-x-auto'],
      ]"
    >
      <button
        v-for="(item, i) in items"
        :key="item.value"
        ref="tabs"
        type="button"
        role="tab"
        :id="`${base}-tab-${i}`"
        :aria-selected="i === index"
        :aria-controls="slots.default ? `${base}-panel` : undefined"
        :tabindex="i === index ? 0 : -1"
        :class="[
          'flex shrink-0 items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap transition outline-none focus-visible:ring-2 focus-visible:ring-kola-primary [&_svg]:size-[18px]',
          expand && 'min-w-0 flex-1',
          pills
            ? ['min-h-10 rounded-[10px]', expand ? 'px-2' : 'px-3.5', i === index ? 'bg-kola-surface text-kola-ink shadow-sm' : 'text-kola-ink-subtle hover:text-kola-ink']
            : ['-mb-px min-h-12 border-b-2', expand ? 'px-2' : 'px-4', i === index ? 'border-kola-primary text-kola-primary' : 'border-transparent text-kola-ink-subtle hover:text-kola-ink'],
        ]"
        @click="select(i)"
        @keydown="onKeydown($event, i)"
      >
        <span v-if="item.icon" aria-hidden="true" class="flex"><component :is="item.icon" /></span>
        <span class="truncate">{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-kola-primary px-1.5 text-[11px] leading-none font-bold text-kola-on-primary"
        >
          {{ badgeLabel(item.badge) }}
        </span>
      </button>
    </div>
    <div
      v-if="slots.default && current !== undefined"
      :id="`${base}-panel`"
      role="tabpanel"
      :aria-labelledby="`${base}-tab-${index}`"
      tabindex="0"
      class="rounded-kola outline-none focus-visible:ring-2 focus-visible:ring-kola-primary"
    >
      <slot :value="current" />
    </div>
  </div>
</template>
