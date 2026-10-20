"use client";

import { formatAmount } from "../kola-amount-field";
import { KolaMobileMoneyForm, type KolaMobileMoneyRequest } from "../kola-mobile-money-form";

export type KolaCartItem = {
  name: string;
  /** Prix unitaire en FCFA. */
  price: number;
  quantity?: number;
};

export type KolaCheckoutProps = {
  items: KolaCartItem[];
  /** Frais de livraison en FCFA (0 : livraison gratuite). */
  delivery?: number;
  /** Appelle ton fournisseur (Campay, Notch Pay, CinetPay…). Lance une erreur en cas d'échec. */
  onPay: (request: KolaMobileMoneyRequest) => Promise<void>;
  title?: string;
  className?: string;
};

const fcfa = (n: number) => `${formatAmount(n)} FCFA`;

/**
 * Bloc « Paiement de commande » : récapitulatif du panier, puis paiement Mobile Money.
 *
 * <KolaCheckout
 *   items={[{ name: "Riz parfumé 5 kg", price: 4500 }, { name: "Huile 1 L", price: 1600, quantity: 2 }]}
 *   delivery={1000}
 *   onPay={async (demande) => { … }}
 * />
 */
export function KolaCheckout({ items, delivery = 0, onPay, title = "Ta commande", className = "" }: KolaCheckoutProps) {
  const subtotal = items.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0);
  const total = subtotal + delivery;
  const count = items.reduce((s, i) => s + (i.quantity ?? 1), 0);

  return (
    <div className={`flex w-full max-w-[440px] flex-col gap-4 text-kola-ink ${className}`}>
      <section aria-label="Récapitulatif" className="rounded-[20px] border border-kola-line bg-kola-surface p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <span className="text-sm text-kola-ink-subtle">
            {count} article{count > 1 ? "s" : ""}
          </span>
        </div>
        <ul className="mt-3 flex flex-col">
          {items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex items-baseline justify-between gap-3 py-1.5">
              <span className="min-w-0">
                {item.name}
                {(item.quantity ?? 1) > 1 && <span className="text-kola-ink-subtle"> × {item.quantity}</span>}
              </span>
              <span className="shrink-0 tabular-nums">{fcfa(item.price * (item.quantity ?? 1))}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 flex flex-col gap-1.5 border-t border-kola-line pt-3">
          <div className="flex justify-between gap-3">
            <dt className="text-kola-ink-subtle">Sous-total</dt>
            <dd className="tabular-nums">{fcfa(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-kola-ink-subtle">Livraison</dt>
            <dd className="tabular-nums">{delivery ? fcfa(delivery) : "Gratuite"}</dd>
          </div>
          <div className="mt-1 flex justify-between gap-3 text-lg font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{fcfa(total)}</dd>
          </div>
        </dl>
      </section>
      <KolaMobileMoneyForm amount={total} onPay={onPay} />
    </div>
  );
}
