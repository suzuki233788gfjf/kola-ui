import type { Metadata } from "next";
import Link from "next/link";
import { BLOCS } from "@/lib/blocs";
import { getComponent } from "@/lib/components";
import { SHARE_IMAGE } from "@/lib/site";

const DESCRIPTION = "Des écrans entiers prêts à copier : connexion par SMS, paiement Mobile Money, tableau de bord, liste avec recherche.";

export const metadata: Metadata = {
  title: "Blocs",
  description: DESCRIPTION,
  openGraph: { title: "Blocs · Kola UI", description: DESCRIPTION, url: "/blocs", images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE], title: "Blocs · Kola UI", description: DESCRIPTION },
  alternates: { canonical: "/blocs" },
};

export default function BlocsPage() {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pt-10 pb-20">
      <div className="flex max-w-[720px] flex-col gap-2.5">
        <h1 className="font-display text-[44px] font-extrabold tracking-tight">Blocs</h1>
        <p className="text-[17px] leading-relaxed text-ink-muted">
          Des écrans entiers, assemblés avec les composants Kola. Tu copies le bloc et les composants qu&apos;il utilise, tu
          branches ton serveur, et l&apos;écran est prêt. En Flutter, React, Vue et HTML.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {BLOCS.map((b) => (
          <Link
            key={b.slug}
            href={`/blocs/${b.slug}`}
            className="flex flex-col gap-3 rounded-2xl border-2 border-accent bg-surface p-6 hover:shadow-[0_12px_24px_-16px_rgba(26,23,18,0.35)]"
          >
            <span className="text-xl font-semibold">{b.name}</span>
            <span className="leading-relaxed text-ink-muted">{b.summary}</span>
            <span className="flex flex-wrap items-center gap-1.5 text-sm text-ink-subtle">
              Utilise :
              {b.uses
                .map((s) => getComponent(s)?.name)
                .filter(Boolean)
                .map((n) => (
                  <span key={n} className="rounded-md bg-chip px-2 py-0.5 text-ink">
                    {n}
                  </span>
                ))}
            </span>
            <span className="mt-1 self-start rounded-md bg-accent-tint px-2 py-0.5 font-mono text-xs text-accent">Flutter · React · Vue · HTML</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
