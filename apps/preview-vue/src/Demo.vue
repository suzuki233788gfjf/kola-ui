<script setup lang="ts">
import { h, markRaw, ref } from "vue";
import KolaButton from "@kola/KolaButton.vue";
import KolaTextField from "@kola/KolaTextField.vue";
import KolaPhoneField from "@kola/KolaPhoneField.vue";
import KolaAmountField, { formatAmount } from "@kola/KolaAmountField.vue";
import KolaOtpField from "@kola/KolaOtpField.vue";
import KolaTabs from "@kola/KolaTabs.vue";
import KolaBottomNav from "@kola/KolaBottomNav.vue";
import KolaSearch, { type KolaSearchOption } from "@kola/KolaSearch.vue";
import KolaFileUpload from "@kola/KolaFileUpload.vue";
import KolaEmptyState from "@kola/KolaEmptyState.vue";
import KolaSkeletonList from "@kola/KolaSkeletonList.vue";
import KolaPhoneLogin from "@kola/blocs/KolaPhoneLogin.vue";
import KolaCheckout from "@kola/blocs/KolaCheckout.vue";
import KolaDashboard, { type KolaOrder } from "@kola/blocs/KolaDashboard.vue";
import KolaProductList from "@kola/blocs/KolaProductList.vue";
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

// Recherche
const searchText = ref("");
const searchResult = ref("");
function onCity(o: KolaSearchOption) {
  searchResult.value = `Ville choisie : ${o.label} (${o.subtitle})`;
}
function onSearch(q: string) {
  searchResult.value = q.trim() ? `Recherche lancée : « ${q.trim()} »` : "";
}

// Téléversement (simulation : 1,5 s, échec si le nom contient « echec »)
async function simulateUpload(file: File, progress: (v: number) => void) {
  for (let i = 1; i <= 10; i++) {
    await new Promise((r) => setTimeout(r, 150));
    progress(i / 10);
  }
  if (file.name.toLowerCase().includes("echec")) throw new Error("Échec simulé");
}

// États
const retrying = ref(false);
function retry() {
  retrying.value = true;
  setTimeout(() => (retrying.value = false), 1500);
}

// Blocs (mêmes données de démo que sur le site)
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function verifyDemo(_: string, code: string) {
  await wait(800);
  return code === "123456";
}
const cart = [
  { name: "Riz parfumé 5 kg", price: 4500, quantity: 1 },
  { name: "Huile 1 L", price: 1600, quantity: 2 },
  { name: "Savon de ménage", price: 350, quantity: 3 },
];
const dashOrders: KolaOrder[] = [
  { id: "#1042", customer: "Awa Ngono", total: 6100, status: "pending" },
  { id: "#1041", customer: "Paul Etoa", total: 2100, status: "pending" },
  { id: "#1040", customer: "Brice Mbarga", total: 12500, status: "pending" },
  { id: "#1039", customer: "Chantal Abena", total: 2800, status: "delivered" },
  { id: "#1037", customer: "Serge Tchoua", total: 4500, status: "delivered" },
  { id: "#1035", customer: "Mireille Fouda", total: 1800, status: "delivered" },
];
const dashStats = [
  { label: "Ventes du jour", value: "125 000 FCFA", change: 12.5 },
  { label: "Commandes", value: "18", change: 5 },
  { label: "Panier moyen", value: "6 950 FCFA", change: -3.2 },
];
const productsDemo = [
  { name: "Riz parfumé 5 kg", price: 4500, stock: 7, category: "Épicerie" },
  { name: "Huile 1 L", price: 1600, stock: 42, category: "Épicerie" },
  { name: "Sucre 1 kg", price: 900, stock: 18, category: "Épicerie" },
  { name: "Lait en poudre 400 g", price: 2800, stock: 12, category: "Épicerie" },
  { name: "Savon de ménage", price: 350, stock: 64, category: "Entretien" },
  { name: "Farine 1 kg", price: 700, stock: 4, category: "Épicerie" },
  { name: "Tomate concentrée", price: 250, stock: 80, category: "Épicerie" },
  { name: "Eau de Javel 1 L", price: 600, stock: 9, category: "Entretien" },
];
const productsLoading = ref(p.c === "liste-recherche");
if (p.c === "liste-recherche") setTimeout(() => (productsLoading.value = false), 1200);

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

  <div v-else-if="p.c === 'recherche'" class="flex w-full max-w-[360px] flex-col gap-3 self-start pt-10">
    <KolaSearch
      v-model="searchText"
      :label="p.label ?? 'Ville'"
      :show-label="p.showLabel !== '0'"
      :placeholder="p.placeholder ?? 'Rechercher une ville'"
      :options="cities"
      @update:model-value="searchResult = ''"
      @select="onCity"
      @submit="onSearch"
    />
    <p aria-live="polite" class="min-h-5 text-sm font-semibold text-kola-primary">{{ searchResult }}</p>
  </div>

  <div v-else-if="p.c === 'televersement'" class="w-full max-w-[400px]">
    <KolaFileUpload
      :label="p.label ?? 'Pièce d\'identité'"
      :multiple="p.multiple !== '0'"
      :on-upload="p.upload === '0' ? undefined : simulateUpload"
    />
  </div>

  <div v-else-if="p.c === 'etats-vides'" class="w-full max-w-[400px] rounded-[20px] border border-kola-line bg-kola-surface p-4">
    <KolaSkeletonList v-if="p.loading === '1' || retrying" :rows="4" />
    <KolaEmptyState v-else-if="p.error === '1'" tone="error" title="Pas de connexion" message="Vérifie ta connexion internet puis réessaie.">
      <template #icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.2-1.6M2 9a15 15 0 0 1 4.6-2.8M22 9a15 15 0 0 0-11-3.9M12 20h.01" />
        </svg>
      </template>
      <template v-if="p.action !== '0'" #action><KolaButton label="Réessayer" variant="outline" @click="retry" /></template>
    </KolaEmptyState>
    <KolaEmptyState v-else title="Aucune commande pour le moment" message="Tes commandes apparaîtront ici dès qu'un client achète.">
      <template v-if="p.action !== '0'" #action><KolaButton label="Partager ma boutique" /></template>
    </KolaEmptyState>
  </div>

  <KolaPhoneLogin v-else-if="p.c === 'connexion-telephone'" :on-send-code="() => wait(800)" :on-verify="verifyDemo" />
  <KolaCheckout v-else-if="p.c === 'paiement-commande'" :items="cart" :delivery="1000" :on-pay="simulate" />
  <KolaDashboard v-else-if="p.c === 'tableau-de-bord'" name="Awa" :stats="dashStats" :orders="dashOrders">
    <template #icon-0><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" /></svg></template>
    <template #icon-1><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" /></svg></template>
    <template #icon-2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16l-1.5 10h-13zM8 10l4-6 4 6" /></svg></template>
  </KolaDashboard>
  <KolaProductList v-else-if="p.c === 'liste-recherche'" :products="productsDemo" :loading="productsLoading" />

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
