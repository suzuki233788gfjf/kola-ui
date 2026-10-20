<script lang="ts">
export type KolaCartItem = {
  name: string;
  /** Prix unitaire en FCFA. */
  price: number;
  quantity?: number;
};
</script>

<script setup lang="ts">
/**
 * Bloc « Paiement de commande » : récapitulatif du panier, puis paiement Mobile Money.
 *
 * <KolaCheckout
 *   :items="[{ name: 'Riz parfumé 5 kg', price: 4500 }, { name: 'Huile 1 L', price: 1600, quantity: 2 }]"
 *   :delivery="1000"
 *   :on-pay="payer"
 * />
 */
import { computed } from "vue";
import { formatAmount } from "../KolaAmountField.vue";
import KolaMobileMoneyForm, { type KolaMobileMoneyRequest } from "../KolaMobileMoneyForm.vue";

const props = withDefaults(
  defineProps<{
    items: KolaCartItem[];
    /** Frais de livraison en FCFA (0 : livraison gratuite). */
    delivery?: number;
    /** Appelle ton fournisseur (Campay, Notch Pay, CinetPay…). Lance une erreur en cas d'échec. */
    onPay: (request: KolaMobileMoneyRequest) => Promise<void>;
    title?: string;
  }>(),
  { delivery: 0, title: "Ta commande" },
);

const fcfa = (n: number) => `${formatAmount(n)} FCFA`;
const subtotal = computed(() => props.items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0));
const total = computed(() => subtotal.value + props.delivery);
const count = computed(() => props.items.reduce((s, i) => s + (i.quantity ?? 1), 0));
</script>

<template>
  <div class="flex w-full max-w-[440px] flex-col gap-4 text-kola-ink">
    <section aria-label="Récapitulatif" class="rounded-[20px] border border-kola-line bg-kola-surface p-5">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="text-xl font-bold tracking-tight">{{ title }}</h2>
        <span class="text-sm text-kola-ink-subtle">{{ count }} article{{ count > 1 ? "s" : "" }}</span>
      </div>
      <ul class="mt-3 flex flex-col">
        <li v-for="(item, i) in items" :key="`${item.name}-${i}`" class="flex items-baseline justify-between gap-3 py-1.5">
          <span class="min-w-0">
            {{ item.name }}<span v-if="(item.quantity ?? 1) > 1" class="text-kola-ink-subtle"> × {{ item.quantity }}</span>
          </span>
          <span class="shrink-0 tabular-nums">{{ fcfa(item.price * (item.quantity ?? 1)) }}</span>
        </li>
      </ul>
      <dl class="mt-3 flex flex-col gap-1.5 border-t border-kola-line pt-3">
        <div class="flex justify-between gap-3">
          <dt class="text-kola-ink-subtle">Sous-total</dt>
          <dd class="tabular-nums">{{ fcfa(subtotal) }}</dd>
        </div>
        <div class="flex justify-between gap-3">
          <dt class="text-kola-ink-subtle">Livraison</dt>
          <dd class="tabular-nums">{{ delivery ? fcfa(delivery) : "Gratuite" }}</dd>
        </div>
        <div class="mt-1 flex justify-between gap-3 text-lg font-bold">
          <dt>Total</dt>
          <dd class="tabular-nums">{{ fcfa(total) }}</dd>
        </div>
      </dl>
    </section>
    <KolaMobileMoneyForm :amount="total" :on-pay="onPay" />
  </div>
</template>
