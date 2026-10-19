<script lang="ts">
/** 1250000 → "1 250 000" */
export function formatAmount(value: number): string {
  const s = String(Math.trunc(Math.abs(value)));
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += " ";
    out += s[i];
  }
  return value < 0 ? `-${out}` : out;
}

/** "1 250 000" → 1250000 (null si vide) */
export function parseAmount(text: string): number | null {
  const d = text.replace(/\D/g, "");
  return d ? Number(d) : null;
}
</script>

<script setup lang="ts">
/**
 * Champ montant en FCFA : séparateur de milliers pendant la saisie, pas de décimales.
 *
 * <KolaAmountField v-model="montant" :min="100" />   // montant = 25000 (ou null)
 */
import { computed } from "vue";
import KolaTextField from "./KolaTextField.vue";

const props = withDefaults(defineProps<{ label?: string; helper?: string; error?: string | null; min?: number; max?: number }>(), {
  label: "Montant",
});
const model = defineModel<number | null>({ default: null });

const display = computed({
  get: () => (model.value === null || model.value === undefined ? "" : formatAmount(model.value)),
  set: (v: string) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length > 12) return;
    model.value = digits ? Number(digits) : null;
  },
});
function check(): string | null {
  const a = model.value;
  if (a === null || a === undefined) return null;
  if (props.min !== undefined && a < props.min) return `Minimum ${formatAmount(props.min)} FCFA`;
  if (props.max !== undefined && a > props.max) return `Maximum ${formatAmount(props.max)} FCFA`;
  return null;
}
</script>

<template>
  <KolaTextField v-model="display" :label="label" :helper="helper" :error="error" :validate="check" inputmode="numeric" placeholder="0">
    <template #suffix><span class="text-sm font-semibold text-kola-ink-subtle">FCFA</span></template>
  </KolaTextField>
</template>
