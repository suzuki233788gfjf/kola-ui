<script lang="ts">
import type { KolaOperator } from "./KolaPhoneField.vue";

/** Ce que le formulaire envoie quand le client clique sur « Payer ». */
export type KolaMobileMoneyRequest = { phone: string; operator: KolaOperator; amount: number };

/** Lance cette erreur dans onPay pour afficher ton propre message d'échec. */
export class KolaMobileMoneyError extends Error {}
</script>

<script setup lang="ts">
/**
 * Formulaire de paiement Mobile Money (MTN MoMo, Orange Money).
 * Le composant gère l'interface ; le paiement passe par TON fournisseur
 * (Campay, Notch Pay, CinetPay…), que tu appelles dans onPay.
 *
 * <KolaMobileMoneyForm :on-pay="payer" />
 *
 * async function payer(demande) {
 *   await fetch("/api/paiement", { method: "POST", body: JSON.stringify(demande) });
 *   // En cas d'échec : throw new KolaMobileMoneyError("Solde insuffisant");
 * }
 */
import { computed, ref } from "vue";
import KolaPhoneField, { detectOperator, formatPhone, validatePhone } from "./KolaPhoneField.vue";
import KolaAmountField, { formatAmount } from "./KolaAmountField.vue";

const props = withDefaults(
  defineProps<{
    onPay: (request: KolaMobileMoneyRequest) => Promise<void>;
    /** Montant imposé (ex. prix d'un produit). Sinon, le client le saisit. */
    amount?: number;
    minAmount?: number;
    title?: string;
  }>(),
  { minAmount: 100, title: "Payer par Mobile Money" },
);

const NAMES: Record<KolaOperator, string> = { mtn: "MTN MoMo", orange: "Orange Money" };
const phone = ref("");
const typed = ref<number | null>(null);
const operator = ref<KolaOperator | null>(null);
const step = ref<"form" | "pending" | "success" | "failure">("form");
const formError = ref<string | null>(null);
const phoneError = ref<string | null>(null);
const failure = ref("");
const request = ref<KolaMobileMoneyRequest | null>(null);
let attempt = 0;

const total = computed(() => props.amount ?? typed.value);

function onPhone(p: string) {
  phone.value = p;
  phoneError.value = null;
  const d = detectOperator(p);
  if (d) operator.value = d;
}

async function pay() {
  formError.value = null;
  phoneError.value = validatePhone(phone.value);
  const a = total.value;
  if (a === null || a === undefined || a < props.minAmount) {
    formError.value = `Indique un montant d'au moins ${formatAmount(props.minAmount)} FCFA`;
    return;
  }
  if (phoneError.value) return;
  if (!operator.value) {
    formError.value = "Choisis ton opérateur";
    return;
  }
  const req = { phone: phone.value, operator: operator.value, amount: a };
  const current = ++attempt;
  request.value = req;
  step.value = "pending";
  try {
    await props.onPay(req);
    if (current === attempt) step.value = "success";
  } catch (e) {
    if (current !== attempt) return;
    failure.value =
      e instanceof KolaMobileMoneyError ? e.message : "Solde insuffisant ou demande refusée. Aucun montant n'a été débité.";
    step.value = "failure";
  }
}

function backToForm() {
  attempt++; // ignore le résultat d'une demande abandonnée
  step.value = "form";
}
function restart() {
  phone.value = "";
  typed.value = null;
  operator.value = null;
  step.value = "form";
}
</script>

<template>
  <div class="w-full rounded-[20px] border border-kola-line bg-kola-surface p-6 text-kola-ink">
    <form v-if="step === 'form'" novalidate class="flex flex-col gap-5" @submit.prevent="pay">
      <h2 class="text-xl font-bold">{{ title }}</h2>
      <div role="radiogroup" aria-label="Opérateur" class="grid grid-cols-2 gap-2.5">
        <button
          v-for="op in ['mtn', 'orange'] as const"
          :key="op"
          type="button"
          role="radio"
          :aria-checked="operator === op"
          :class="[
            'flex min-h-14 items-center gap-2.5 rounded-kola border px-3 text-left text-sm font-semibold transition',
            operator === op
              ? 'border-kola-primary bg-kola-primary/10 ring-1 ring-kola-primary'
              : 'border-kola-line-strong hover:border-kola-ink-subtle',
          ]"
          @click="operator = op"
        >
          <span aria-hidden="true" :class="['size-6 shrink-0 rounded-full', op === 'mtn' ? 'bg-[#ffcb05]' : 'bg-[#ff7900]']" />
          {{ NAMES[op] }}
        </button>
      </div>
      <KolaPhoneField :model-value="phone" :error="phoneError" @update:model-value="onPhone" />
      <KolaAmountField v-if="amount === undefined" v-model="typed" :min="minAmount" />
      <div v-else class="flex items-center justify-between rounded-kola bg-kola-surface-muted px-4 py-3">
        <span class="text-sm font-semibold">Montant</span>
        <span class="text-lg font-bold">{{ formatAmount(amount) }} FCFA</span>
      </div>
      <p v-if="formError" role="alert" class="text-sm text-kola-danger">{{ formError }}</p>
      <button type="submit" class="min-h-12 rounded-kola bg-kola-primary px-5 font-semibold text-kola-on-primary hover:brightness-110">
        {{ total === null || total === undefined ? "Payer" : `Payer ${formatAmount(total)} FCFA` }}
      </button>
      <p class="text-center text-sm text-kola-ink-subtle">Tu recevras une demande de confirmation sur ton téléphone.</p>
    </form>

    <div v-else role="status" class="flex flex-col items-center gap-3 py-4 text-center">
      <template v-if="step === 'pending' && request">
        <span class="size-10 animate-spin rounded-full border-4 border-kola-primary border-t-transparent" />
        <h2 class="mt-2 text-xl font-bold">Confirme sur ton téléphone</h2>
        <p class="leading-relaxed text-kola-ink-muted">
          Une demande de {{ formatAmount(request.amount) }} FCFA a été envoyée au {{ formatPhone(request.phone) }}. Valide-la avec
          ton code secret {{ NAMES[request.operator] }}.
        </p>
        <button type="button" class="mt-3 min-h-12 w-full rounded-kola border border-kola-line-strong px-5 font-semibold hover:border-kola-ink" @click="backToForm">
          Annuler
        </button>
      </template>
      <template v-else-if="step === 'success' && request">
        <span class="flex size-14 items-center justify-center rounded-full bg-kola-success text-kola-bg">
          <svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <h2 class="mt-2 text-xl font-bold">Paiement reçu</h2>
        <p class="leading-relaxed text-kola-ink-muted">
          {{ formatAmount(request.amount) }} FCFA · {{ NAMES[request.operator] }} · {{ formatPhone(request.phone) }}
        </p>
        <button type="button" class="mt-3 min-h-12 w-full rounded-kola bg-kola-primary/12 px-5 font-semibold text-kola-primary hover:bg-kola-primary/20" @click="restart">
          Nouveau paiement
        </button>
      </template>
      <template v-else>
        <span class="flex size-14 items-center justify-center rounded-full bg-kola-danger text-kola-bg">
          <svg viewBox="0 0 24 24" class="size-7" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M7 7l10 10M17 7L7 17" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <h2 class="mt-2 text-xl font-bold">Paiement non abouti</h2>
        <p class="leading-relaxed text-kola-ink-muted">{{ failure }}</p>
        <button type="button" class="mt-3 min-h-12 w-full rounded-kola bg-kola-primary px-5 font-semibold text-kola-on-primary hover:brightness-110" @click="backToForm">
          Réessayer
        </button>
      </template>
    </div>
  </div>
</template>
