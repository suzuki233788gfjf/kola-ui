import type { Metadata } from "next";
import Link from "next/link";
import { LostKola } from "@/components/Mascot";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "Cette page n'existe pas ou a été déplacée. Retrouve tous les composants Kola UI dans le catalogue.",
  robots: { index: false },
};

const SUGGESTIONS = [
  ["Téléphone +237", "/composants/telephone-237"],
  ["Formulaire Mobile Money", "/composants/mobile-money"],
  ["Montant FCFA", "/composants/montant-fcfa"],
  ["Date picker", "/composants/date-picker"],
] as const;

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1200px] flex-wrap-reverse items-center justify-center gap-x-16 gap-y-8 px-6 py-16 sm:py-20">
      <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-6">
        <span className="self-start rounded-full bg-accent-tint px-3 py-1.5 font-mono text-sm font-medium text-accent">
          Erreur 404
        </span>
        <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
          Cette page s&apos;est perdue en route.
        </h1>
        <p className="max-w-[500px] text-lg leading-relaxed text-ink-muted">
          L&apos;adresse est peut-être mal écrite, ou la page a changé de place. Kola a cherché partout, sans
          succès. Les composants, eux, sont bien rangés dans le catalogue.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/composants" className="rounded-xl bg-accent px-5.5 py-3.5 font-semibold text-white hover:bg-accent-dark">
            Retour au catalogue →
          </Link>
          <Link href="/" className="rounded-xl border border-line-strong bg-surface px-5.5 py-3.5 font-semibold hover:border-ink">
            Page d&apos;accueil
          </Link>
        </div>
        <nav aria-label="Composants populaires" className="mt-4 flex flex-col gap-3 border-t border-line pt-6">
          <span className="text-sm font-medium text-ink-subtle">Ou va directement à un composant populaire :</span>
          <ul className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="inline-block rounded-full border border-line bg-surface px-3.5 py-2 text-sm hover:border-accent hover:text-accent">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <LostKola className="w-[min(220px,60vw)] flex-none sm:w-[300px]" />
    </main>
  );
}
