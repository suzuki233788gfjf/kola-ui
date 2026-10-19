<script lang="ts">
/** 12.5 → "+12,5 %" */
export function formatChange(change: number) {
  const abs = Math.abs(change).toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  return `${change > 0 ? "+" : change < 0 ? "-" : ""}${abs} %`;
}
</script>

<script setup lang="ts">
/**
 * Carte statistique : un chiffre clé et son évolution (vert si ça monte, rouge si ça baisse).
 *
 * <KolaStatCard label="Ventes du jour" value="125 000 FCFA" :change="12.5">
 *   <template #icon><MonIcone /></template>
 * </KolaStatCard>
 */
withDefaults(defineProps<{ label: string; value: string; change?: number | null }>(), { change: null });
</script>

<template>
  <div class="flex w-full flex-col gap-3 rounded-[16px] border border-kola-line bg-kola-surface p-5 text-kola-ink">
    <div class="flex items-center justify-between gap-3">
      <span class="text-sm font-medium text-kola-ink-muted">{{ label }}</span>
      <span v-if="$slots.icon" aria-hidden="true" class="flex size-9 items-center justify-center rounded-[10px] bg-kola-primary/12 text-kola-primary [&_svg]:size-5"><slot name="icon" /></span>
    </div>
    <span class="text-[28px] leading-tight font-bold tracking-tight">{{ value }}</span>
    <span v-if="change !== null" :class="['flex items-center gap-1.5 text-sm font-semibold', change >= 0 ? 'text-kola-success' : 'text-kola-danger']">
      <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path :d="change >= 0 ? 'M3 17l6-6 4 4 8-8M15 7h6v6' : 'M3 7l6 6 4-4 8 8M15 17h6v-6'" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ formatChange(change) }}
      <span class="font-normal text-kola-ink-subtle">vs hier</span>
    </span>
  </div>
</template>
