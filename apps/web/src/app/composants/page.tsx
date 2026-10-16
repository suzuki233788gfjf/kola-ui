import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, COMPONENTS } from "@/lib/components";

export const metadata: Metadata = {
  title: "Composants",
  description: "Tous les composants Kola UI, à tester en direct puis copier.",
};

export default function CataloguePage() {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 pt-10 pb-20">
      <div className="flex flex-col gap-2.5">
        <h1 className="font-display text-[44px] font-extrabold tracking-tight">Composants</h1>
        <p className="text-[17px] text-ink-muted">Chaque composant se teste en direct, se personnalise, puis se copie.</p>
      </div>

      {CATEGORIES.map((cat) => (
        <section key={cat} className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold tracking-[0.08em] text-ink-subtle uppercase">{cat}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COMPONENTS.filter((c) => c.category === cat).map((c) =>
              c.available ? (
                <Link
                  key={c.slug}
                  href={`/composants/${c.slug}`}
                  className="flex flex-col gap-2 rounded-2xl border-2 border-accent bg-surface p-6 hover:shadow-[0_12px_24px_-16px_rgba(26,23,18,0.35)]"
                >
                  <span className="text-lg font-semibold">{c.name}</span>
                  <span className="leading-relaxed text-ink-muted">{c.summary}</span>
                  <span className="mt-1.5 self-start rounded-md bg-accent-tint px-2 py-0.5 font-mono text-xs text-accent">Flutter · disponible</span>
                </Link>
              ) : (
                <div key={c.slug} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-6 opacity-80">
                  <span className="text-lg font-semibold">{c.name}</span>
                  <span className="leading-relaxed text-ink-muted">{c.summary}</span>
                  <span className="mt-1.5 self-start rounded-md bg-chip px-2 py-0.5 font-mono text-xs text-ink-muted">bientôt</span>
                </div>
              ),
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
