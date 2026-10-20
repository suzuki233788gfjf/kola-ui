<script setup lang="ts">
import { h, markRaw, ref } from "vue";
import KolaButton from "@kola/KolaButton.vue";
import KolaTextField from "@kola/KolaTextField.vue";
import KolaPhoneField from "@kola/KolaPhoneField.vue";
import KolaAmountField, { formatAmount } from "@kola/KolaAmountField.vue";
import KolaOtpField from "@kola/KolaOtpField.vue";
import KolaTabs from "@kola/KolaTabs.vue";
import KolaBottomNav from "@kola/KolaBottomNav.vue";
import KolaMobileMoneyForm, { KolaMobileMoneyError, type KolaMobileMoneyRequest } from "@kola/KolaMobileMoneyForm.vue";
import KolaDatePicker from "@kola/KolaDatePicker.vue";
import { KolaDateFr, type KolaDateRange } from "@kola/KolaCalendar.vue";
import KolaConfirm from "@kola/KolaConfirm.vue";
import KolaToaster, { useKolaToast, type KolaToastType } from "@kola/KolaToaster.vue";
import KolaToastView from "@kola/KolaToastView.vue";
import KolaSelect from "@kola/KolaSelect.vue";
import KolaCard from "@kola/KolaCard.vue";
import KolaStatCard from "@kola/KolaStatCard.vue";
import KolaDataTable, { type KolaColumn } from "@kola/KolaDataTable.vue";

const props = defineProps<{ p: Record<string, string> }>();
const p = props.p;
const toast = useKolaToast();

// Champs
const email = ref("");
const phone = ref((p.value ?? "").replace(/\D/g, ""));
const amount = ref<number | null>(p.value ? Number(p.value.replace(/\D/g, "")) || null : null);

// Code OTP
const otp = ref("");
const otpDone = ref<string | null>(null);
const noop = async () => {};

// Onglets
const icon = (d: string) =>
  markRaw({ render: () => h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, [h("path", { d })]) });
const showBadges = p.badges !== "0";
const showIcons = p.icons === "1";
const orderTabs = [
  { value: "en-cours", label: "En cours", icon: showIcons ? icon("M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z") : undefined, badge: showBadges ? 3 : 0 },
  { value: "livrees", label: "Livrées", icon: showIcons ? icon("M5 12.5l4.5 4.5L19 7.5") : undefined },
  { value: "annulees", label: "Annulées", icon: showIcons ? icon("M6 6l12 12M18 6L6 18") : undefined },
];
const orders: Record<string, [string, string, string][]> = {
  "en-cours": [
    ["#1042", "Riz parfumé 5 kg + huile 1 L", "6 100 FCFA"],
    ["#1041", "Savon de ménage × 6", "2 100 FCFA"],
    ["#1039", "Lait en poudre 400 g", "2 800 FCFA"],
  ],
  livrees: [["#1035", "Sucre 1 kg × 2", "1 800 FCFA"]],
  annulees: [],
};
const navTabs = [
  { value: "Accueil", label: "Accueil", icon: icon("M3 11l9-7 9 7M5 10v10h14V10") },
  { value: "Commandes", label: "Commandes", icon: icon("M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"), badge: showBadges ? 2 : 0 },
  { value: "Paiements", label: "Paiements", icon: icon("M3 7h18v12H3zM16 13h2M5 7l2-3h10l2 3") },
  { value: "Profil", label: "Profil", icon: icon("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0") },
];
const page = ref("Accueil");

// Mobile Money (simulation : 3 s, échec si le numéro finit par 0)
async function simulate(d: KolaMobileMoneyRequest) {
  await new Promise((r) => setTimeout(r, 3000));
  if (d.phone.endsWith("0")) throw new KolaMobileMoneyError("Solde insuffisant (simulation)");
}

// Date
const period = ref<KolaDateRange | null>(null);
const range = p.range !== "0";

// Confirmation
const confirmer = ref<InstanceType<typeof KolaConfirm> | null>(null);
async function ask() {
  const ok = await confirmer.value!.open({
    title: p.label ?? "Supprimer cet article ?",
    message: "Cette action est définitive.",
    confirmLabel: p.confirm ?? "Supprimer",
    destructive: p.destructive === "1",
    sheet: p.sheet === "1",
  });
  toast(ok ? "Tu as confirmé." : "Tu as annulé.", { type: ok ? "success" : "info" });
}

// Notifications
const toastType = (["success", "error", "info", "warning"].includes(p.type) ? p.type : "success") as KolaToastType;

// Sélecteur
const city = ref<string | null>(null);
const cities = [
  { value: "dla", label: "Douala", subtitle: "Littoral" },
  { value: "yde", label: "Yaoundé", subtitle: "Centre" },
  { value: "bfm", label: "Bafoussam", subtitle: "Ouest" },
  { value: "bda", label: "Bamenda", subtitle: "Nord-Ouest" },
  { value: "grg", label: "Garoua", subtitle: "Nord" },
  { value: "mrw", label: "Maroua", subtitle: "Extrême-Nord" },
  { value: "ngd", label: "Ngaoundéré", subtitle: "Adamaoua" },
  { value: "btr", label: "Bertoua", subtitle: "Est" },
  { value: "ebw", label: "Ebolowa", subtitle: "Sud" },
  { value: "bea", label: "Buea", subtitle: "Sud-Ouest" },
  { value: "kri", label: "Kribi", subtitle: "Sud" },
  { value: "lmb", label: "Limbé", subtitle: "Sud-Ouest" },
];

// Tableau
type Product = { name: string; stock: number; price: number };
const products: Product[] = [
  { name: "Riz parfumé 5 kg", stock: 7, price: 4500 },
  { name: "Huile 1 L", stock: 42, price: 1600 },
  { name: "Sucre 1 kg", stock: 18, price: 900 },
  { name: "Lait en poudre 400 g", stock: 12, price: 2800 },
  { name: "Savon de ménage", stock: 64, price: 350 },
  { name: "Farine 1 kg", stock: 25, price: 700 },
  { name: "Tomate concentrée", stock: 80, price: 250 },
  { name: "Spaghetti 500 g", stock: 33, price: 450 },
];
const columns: KolaColumn<Product>[] = [
  { label: "Produit", cell: (r) => r.name, sortBy: (r) => r.name, flex: 2 },
  { label: "Stock", cell: (r) => r.stock, sortBy: (r) => r.stock, numeric: true },
  { label: "Prix", cell: (r) => `${formatAmount(r.price)} FCFA`, sortBy: (r) => r.price, numeric: true, flex: 2 },
];
const change = p.change !== undefined && p.change !== "" ? Number(p.change.replace(",", ".")) : 12.5;
const variant = (["primary", "secondary", "outline", "text"].includes(p.variant) ? p.variant : "primary") as "primary";
</script>

<template>
  <KolaToaster />

  <KolaTextField
    v-if="p.c === 'champ-de-texte'"
    v-model="email"
    class="w-full max-w-[340px]"
    :label="p.label ?? 'E-mail'"
    :placeholder="p.password === '1' ? undefined : 'nom@exemple.cm'"
    :helper="p.helper"
    :obscure="p.password === '1'"
    :error="p.error === '1' ? 'Adresse e-mail incomplète' : null"
  >
    <template v-if="p.icon === '1'" #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path :d="p.password === '1' ? 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3' : 'M3 6h18v12H3zM3 7l9 6 9-6'" />
      </svg>
    </template>
  </KolaTextField>

  <KolaPhoneField v-else-if="p.c === 'telephone-237'" v-model="phone" class="w-full max-w-[340px]" :label="p.label ?? 'Téléphone'" />

  <KolaAmountField v-else-if="p.c === 'montant-fcfa'" v-model="amount" class="w-full max-w-[340px]" :label="p.label ?? 'Montant'" :min="100" />

  <div v-else-if="p.c === 'code-otp'" class="flex w-full max-w-[360px] flex-col gap-4">
    <KolaOtpField
      v-model="otp"
      :label="p.label ?? 'Code de vérification'"
      :length="p.length === '4' ? 4 : 6"
      helper="Envoyé par SMS au 6 77 12 34 56"
      :error="p.error === '1' ? 'Code incorrect. Il te reste 2 essais.' : null"
      :on-resend="p.resend === '0' ? undefined : noop"
      @update:model-value="otpDone = null"
      @complete="otpDone = $event"
    />
    <p aria-live="polite" class="min-h-5 text-sm font-semibold text-kola-primary">{{ otpDone ? `✓ Code ${otpDone} saisi` : "" }}</p>
  </div>

  <div
    v-else-if="p.c === 'onglets' && p.nav === 'bottom'"
    class="flex h-[300px] w-full max-w-[360px] flex-col overflow-hidden rounded-[20px] border border-kola-line bg-kola-bg"
  >
    <div class="flex flex-1 items-center justify-center font-semibold text-kola-ink">{{ page }}</div>
    <KolaBottomNav v-model="page" :items="navTabs" />
  </div>

  <KolaTabs
    v-else-if="p.c === 'onglets'"
    class="w-full max-w-[420px]"
    label="Commandes"
    :variant="p.variant === 'pills' ? 'pills' : 'underline'"
    :expand="p.expand === '1'"
    :items="orderTabs"
  >
    <template #default="{ value }">
      <p v-if="!orders[value].length" class="py-6 text-center text-sm text-kola-ink-subtle">Aucune commande annulée.</p>
      <ul v-else class="flex flex-col divide-y divide-kola-line rounded-kola border border-kola-line bg-kola-surface">
        <li v-for="[n, what, price] in orders[value]" :key="n" class="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <span class="min-w-0"><span class="font-mono text-kola-ink-subtle">{{ n }}</span> <span class="text-kola-ink">{{ what }}</span></span>
          <span class="shrink-0 font-semibold text-kola-ink">{{ price }}</span>
        </li>
      </ul>
    </template>
  </KolaTabs>

  <div v-else-if="p.c === 'mobile-money'" class="w-full max-w-[400px]">
    <KolaMobileMoneyForm :title="p.title ?? 'Payer par Mobile Money'" :amount="p.amount ? Number(p.amount) : undefined" :on-pay="simulate" />
  </div>

  <div v-else-if="p.c === 'date-picker'" class="flex w-full max-w-[340px] flex-col gap-3">
    <KolaDatePicker v-model="period" :label="range ? 'Période' : 'Date de livraison'" :range="range" />
    <p class="text-sm text-kola-ink-subtle">
      {{ period ? `Sélection : ${range ? KolaDateFr.range(period.start, period.end) : KolaDateFr.date(period.start)}` : "Clique sur le champ pour ouvrir le calendrier." }}
    </p>
  </div>

  <template v-else-if="p.c === 'confirmation'">
    <KolaConfirm ref="confirmer" />
    <KolaButton label="Supprimer l'article" :variant="p.destructive === '1' ? 'outline' : 'primary'" @click="ask" />
  </template>

  <div v-else-if="p.c === 'notifications'" class="flex w-full max-w-[380px] flex-col gap-6">
    <KolaToastView :type="toastType" :title="p.title" :message="p.message ?? 'Paiement reçu : 25 000 FCFA'" />
    <KolaButton label="Afficher en vrai" variant="secondary" @click="toast(p.message ?? 'Paiement reçu : 25 000 FCFA', { type: toastType, title: p.title })" />
  </div>

  <KolaSelect v-else-if="p.c === 'selecteur'" v-model="city" class="w-full max-w-[340px]" :label="p.label ?? 'Ville'" :options="cities" />

  <div v-else-if="p.c === 'carte' && p.variant === 'stat'" class="w-full max-w-[300px]">
    <KolaStatCard :label="p.label ?? 'Ventes du jour'" :value="p.value ?? '125 000 FCFA'" :change="Number.isFinite(change) ? change : null">
      <template #icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" /></svg>
      </template>
    </KolaStatCard>
  </div>

  <div v-else-if="p.c === 'carte'" class="w-full max-w-[280px]">
    <KolaCard :badge="p.badge" :title="p.label ?? 'Riz parfumé 5 kg'" subtitle="Épicerie · En stock" :footer="p.footer ?? '4 500 FCFA'" clickable>
      <template #media>
        <svg viewBox="0 0 24 24" class="size-12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16l-1.5 10h-13zM8 10l4-6 4 6" /></svg>
      </template>
    </KolaCard>
  </div>

  <div v-else-if="p.c === 'tableau'" :style="{ width: p.mobile === '1' ? '360px' : '640px' }" class="max-w-full">
    <KolaDataTable :rows="products" :columns="columns" :rows-per-page="Number(p.rows) || 5" />
  </div>

  <KolaButton v-else :label="p.label ?? 'Valider'" :variant="variant" :loading="p.loading === '1'">
    <template v-if="p.icon === '1'" #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </template>
  </KolaButton>
</template>
