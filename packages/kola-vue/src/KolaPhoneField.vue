<script lang="ts">
export type KolaOperator = "mtn" | "orange";

/** Préfixes : MTN 67, 68, 650–654 · Orange 69, 655–659. */
export function detectOperator(input: string): KolaOperator | null {
  const d = input.replace(/\D/g, "");
  if (d.length < 2) return null;
  const p2 = d.slice(0, 2);
  if (p2 === "67" || p2 === "68") return "mtn";
  if (p2 === "69") return "orange";
  if (p2 === "65" && d.length >= 3) return Number(d[2]) <= 4 ? "mtn" : "orange";
  return null;
}

/** "677123456" → "6 77 12 34 56" */
export function formatPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 9);
  return [d.slice(0, 1), d.slice(1, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

export function validatePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (!d) return "Numéro requis";
  if (!d.startsWith("6")) return "Un numéro mobile commence par 6";
  if (d.length < 9) return "Numéro incomplet (9 chiffres)";
  return null;
}

/** Garde 9 chiffres ; enlève l'indicatif 237 s'il a été collé avec le numéro. */
export function phoneDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.length > 9 && d.startsWith("237")) d = d.slice(3);
  return d.slice(0, 9);
}
</script>

<script setup lang="ts">
/**
 * Champ téléphone Cameroun (+237) : formatage « 6 77 12 34 56 » et détection MTN / Orange.
 *
 * <KolaPhoneField v-model="numero" @operator="(op) => …" />   // numero = "677123456"
 */
import { computed } from "vue";
import KolaTextField from "./KolaTextField.vue";

withDefaults(defineProps<{ label?: string; helper?: string; error?: string | null }>(), { label: "Téléphone" });
const model = defineModel<string>({ default: "" });
const emit = defineEmits<{ operator: [operator: KolaOperator | null] }>();

const operator = computed(() => detectOperator(model.value));
const display = computed({
  get: () => formatPhone(phoneDigits(model.value)),
  set: (v: string) => {
    model.value = phoneDigits(v);
    emit("operator", detectOperator(model.value));
  },
});
</script>

<template>
  <KolaTextField
    v-model="display"
    :label="label"
    :helper="helper"
    :error="error"
    :validate="validatePhone"
    type="tel"
    inputmode="tel"
    autocomplete="tel-national"
    placeholder="6 XX XX XX XX"
  >
    <template #prefix><span class="border-r border-kola-line pr-2.5 text-kola-ink-muted">+237</span></template>
    <template #suffix>
      <span
        v-if="operator"
        :class="['rounded-md px-2 py-1 text-xs font-bold text-[#1a1712]', operator === 'mtn' ? 'bg-[#ffcb05]' : 'bg-[#ff7900]']"
        >{{ operator === "mtn" ? "MTN" : "Orange" }}</span
      >
    </template>
  </KolaTextField>
</template>
