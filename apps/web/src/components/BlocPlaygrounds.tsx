"use client";

import { useEffect, useState, type ReactNode } from "react";
import { KolaPhoneLogin } from "@kola/react/blocs/kola-phone-login";
import { KolaCheckout } from "@kola/react/blocs/kola-checkout";
import { KolaDashboard, type KolaOrder } from "@kola/react/blocs/kola-dashboard";
import { KolaProductList } from "@kola/react/blocs/kola-product-list";
import { KolaMobileMoneyError } from "@kola/react/kola-mobile-money-form";
import { ColorPicker, DEFAULT_COLOR, HtmlAssetsContext, Playground, Toggle } from "./Playground";

const flag = (b: boolean) => (b ? "1" : undefined);
const lines = (...l: (string | null | false | undefined)[]) => l.filter(Boolean).join("\n");
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const Svg = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

/* ---------- Données de démo (les mêmes dans les 4 langages) ---------- */

export const DEMO_CART = [
  { name: "Riz parfumé 5 kg", price: 4500, quantity: 1 },
  { name: "Huile 1 L", price: 1600, quantity: 2 },
  { name: "Savon de ménage", price: 350, quantity: 3 },
];
export const DEMO_ORDERS: KolaOrder[] = [
  { id: "#1042", customer: "Awa Ngono", total: 6100, status: "pending" },
  { id: "#1041", customer: "Paul Etoa", total: 2100, status: "pending" },
  { id: "#1040", customer: "Brice Mbarga", total: 12500, status: "pending" },
  { id: "#1039", customer: "Chantal Abena", total: 2800, status: "delivered" },
  { id: "#1037", customer: "Serge Tchoua", total: 4500, status: "delivered" },
  { id: "#1035", customer: "Mireille Fouda", total: 1800, status: "delivered" },
];
export const DEMO_PRODUCTS = [
  { name: "Riz parfumé 5 kg", price: 4500, stock: 7, category: "Épicerie" },
  { name: "Huile 1 L", price: 1600, stock: 42, category: "Épicerie" },
  { name: "Sucre 1 kg", price: 900, stock: 18, category: "Épicerie" },
  { name: "Lait en poudre 400 g", price: 2800, stock: 12, category: "Épicerie" },
  { name: "Savon de ménage", price: 350, stock: 64, category: "Entretien" },
  { name: "Farine 1 kg", price: 700, stock: 4, category: "Épicerie" },
  { name: "Tomate concentrée", price: 250, stock: 80, category: "Épicerie" },
  { name: "Eau de Javel 1 L", price: 600, stock: 9, category: "Entretien" },
];

/** Simulation de paiement : 3 secondes, échec si le numéro finit par 0. */
async function simulatePay(d: { phone: string }) {
  await wait(3000);
  if (d.phone.endsWith("0")) throw new KolaMobileMoneyError("Solde insuffisant (simulation)");
}

function ProductListDemo() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);
  return <KolaProductList products={DEMO_PRODUCTS} loading={loading} />;
}

/* ---------- Ce que chaque bloc affiche et le code d'utilisation ---------- */

type BlocDemo = {
  height: number;
  mobile: boolean;
  hint: string;
  react: () => ReactNode;
  flutter: string;
  react_: string;
  vue: string;
  /** Dernière ligne du code HTML (après les fichiers à charger). */
  html: string;
};

const DEMOS: Record<string, BlocDemo> = {
  "connexion-telephone": {
    height: 560,
    mobile: true,
    hint: "Démo : tape un numéro (ex. 677 12 34 56), puis le code 123456. Un autre code affiche l'erreur.",
    react: () => (
      <KolaPhoneLogin
        onSendCode={() => wait(800)}
        onVerify={async (_, code) => {
          await wait(800);
          return code === "123456";
        }}
      />
    ),
    flutter: lines(
      "KolaPhoneLogin(",
      "  onSendCode: (numero) async {",
      "    // Demande à ton serveur d'envoyer un SMS au +237 numero.",
      "  },",
      "  onVerify: (numero, code) async {",
      "    // Demande à ton serveur si le code est bon.",
      "    return true;",
      "  },",
      "  onSuccess: (numero) {",
      "    // Va à l'écran d'accueil.",
      "  },",
      ")",
    ),
    react_: lines(
      "<KolaPhoneLogin",
      "  onSendCode={async (numero) => {",
      "    // Demande à ton serveur d'envoyer un SMS au +237 numero.",
      "  }}",
      "  onVerify={async (numero, code) => {",
      "    // Demande à ton serveur si le code est bon.",
      "    return true;",
      "  }}",
      '  onSuccess={() => router.push("/accueil")}',
      "/>",
    ),
    vue: lines(
      '<KolaPhoneLogin :on-send-code="envoyerSms" :on-verify="verifierCode" @success="allerAccueil" />',
      "<!-- async function envoyerSms(numero) { … }",
      "     async function verifierCode(numero, code) { return true; } -->",
    ),
    html: "<!-- Dans le <body> : colle le contenu de kola/blocs/connexion-telephone.html,\n     puis remplace envoyerCode() et verifierCode() par les appels à ton serveur. -->",
  },
  "paiement-commande": {
    height: 720,
    mobile: true,
    hint: "Démo : le paiement attend 3 secondes. Un numéro qui finit par 0 simule un échec.",
    react: () => <KolaCheckout items={DEMO_CART} delivery={1000} onPay={simulatePay} />,
    flutter: lines(
      "KolaCheckout(",
      "  items: const [",
      "    KolaCartItem(name: 'Riz parfumé 5 kg', price: 4500),",
      "    KolaCartItem(name: 'Huile 1 L', price: 1600, quantity: 2),",
      "  ],",
      "  delivery: 1000,",
      "  onPay: (demande) async {",
      "    // Appelle ton fournisseur (Campay, Notch Pay, CinetPay…).",
      "  },",
      ")",
    ),
    react_: lines(
      "<KolaCheckout",
      "  items={[",
      '    { name: "Riz parfumé 5 kg", price: 4500 },',
      '    { name: "Huile 1 L", price: 1600, quantity: 2 },',
      "  ]}",
      "  delivery={1000}",
      "  onPay={async (demande) => {",
      "    // Appelle ton fournisseur (Campay, Notch Pay, CinetPay…).",
      "  }}",
      "/>",
    ),
    vue: lines('<KolaCheckout :items="panier" :delivery="1000" :on-pay="payer" />', "<!-- panier = [{ name: 'Riz parfumé 5 kg', price: 4500 }, …] -->"),
    html: "<!-- Dans le <body> : colle le contenu de kola/blocs/paiement-commande.html,\n     puis remplace le panier et payer() par les tiens. -->",
  },
  "tableau-de-bord": {
    height: 760,
    mobile: false,
    hint: "Change d'onglet : « Annulées » montre l'état vide. Clique sur Client ou Montant pour trier.",
    react: () => (
      <KolaDashboard
        name="Awa"
        stats={[
          { label: "Ventes du jour", value: "125 000 FCFA", change: 12.5, icon: <Svg d="M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" /> },
          { label: "Commandes", value: "18", change: 5, icon: <Svg d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" /> },
          { label: "Panier moyen", value: "6 950 FCFA", change: -3.2, icon: <Svg d="M4 10h16l-1.5 10h-13zM8 10l4-6 4 6" /> },
        ]}
        orders={DEMO_ORDERS}
      />
    ),
    flutter: lines(
      "KolaDashboard(",
      "  name: 'Awa',",
      "  stats: const [",
      "    KolaStat(label: 'Ventes du jour', value: '125 000 FCFA', change: 12.5),",
      "    KolaStat(label: 'Commandes', value: '18', change: 5),",
      "  ],",
      "  orders: commandes, // List<KolaOrder>",
      ")",
    ),
    react_: lines(
      "<KolaDashboard",
      '  name="Awa"',
      "  stats={[",
      '    { label: "Ventes du jour", value: "125 000 FCFA", change: 12.5 },',
      '    { label: "Commandes", value: "18", change: 5 },',
      "  ]}",
      '  orders={commandes} // [{ id: "#1042", customer: "Awa Ngono", total: 6100, status: "pending" }, …]',
      "/>",
    ),
    vue: lines('<KolaDashboard name="Awa" :stats="chiffres" :orders="commandes" @order-click="ouvrir" />'),
    html: "<!-- Dans le <body> : colle le contenu de kola/blocs/tableau-de-bord.html,\n     puis remplace les données d'exemple par les tiennes. -->",
  },
  "liste-recherche": {
    height: 680,
    mobile: true,
    hint: "Essaie « riz », « entretien » ou « epicerie » (sans accent), puis un mot qui n'existe pas.",
    react: () => <ProductListDemo />,
    flutter: lines("KolaProductList(", "  loading: chargement,", "  products: produits, // List<KolaProduct>", "  onTap: (produit) => ouvrirFiche(produit),", ")"),
    react_: lines(
      "<KolaProductList",
      "  loading={chargement}",
      '  products={produits} // [{ name: "Riz parfumé 5 kg", price: 4500, stock: 7, category: "Épicerie" }, …]',
      "  onProductClick={(p) => ouvrir(p)}",
      "/>",
    ),
    vue: '<KolaProductList :loading="chargement" :products="produits" @product-click="ouvrir" />',
    html: "<!-- Dans le <body> : colle le contenu de kola/blocs/liste-recherche.html,\n     puis remplace chargerProduits() par le chargement de tes produits. -->",
  },
};

/** Affiche un bloc : aperçu en direct, options et code d'utilisation. */
export function BlocPlayground({
  slug,
  htmlAssets,
  htmlBloc,
  htmlIncludes,
}: {
  slug: string;
  htmlAssets: { css: string; js: string };
  /** Le fichier HTML du bloc (avec sa démo). */
  htmlBloc: string;
  /** Les <link> et <script> à mettre dans le <head>. */
  htmlIncludes: string;
}) {
  const demo = DEMOS[slug];
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [dark, setDark] = useState(false);
  const [mobile, setMobile] = useState(demo?.mobile ?? true);
  const [run, setRun] = useState(0);
  if (!demo) return null;

  return (
    <HtmlAssetsContext.Provider value={htmlAssets}>
      <Playground
        slug={slug}
        color={color}
        height={demo.height}
        frameWidth={mobile ? 390 : undefined}
        usage={demo.flutter}
        reactUsage={demo.react_}
        vueUsage={demo.vue}
        htmlUsage={lines("<!-- Dans le <head> : le thème, les composants utilisés et la mise en page des blocs -->", htmlIncludes, "", demo.html)}
        htmlPreview={`<!-- démo ${run} -->\n${htmlBloc}`}
        react={<div key={run} className="flex w-full justify-center">{demo.react()}</div>}
        params={{ color, dark: flag(dark), run: run ? String(run) : undefined }}
        controls={
          <>
            <ColorPicker value={color} onChange={setColor} />
            <Toggle label="Vue téléphone (390 px)" checked={mobile} onChange={setMobile} />
            <Toggle label="Mode sombre" checked={dark} onChange={setDark} />
            <p className="text-sm leading-relaxed text-ink-muted">{demo.hint}</p>
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              className="self-start rounded-[10px] border border-line-strong px-4 py-2.5 text-sm font-semibold hover:border-ink"
            >
              Recommencer la démo
            </button>
          </>
        }
      />
    </HtmlAssetsContext.Provider>
  );
}
