import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPONENTS, getComponent } from "@/lib/components";
import { getDartSource } from "@/lib/source";
import { ButtonPlayground } from "@/components/ButtonPlayground";
import { CodeBlock } from "@/components/CodeBlock";

export function generateStaticParams() {
  return COMPONENTS.filter((c) => c.available).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/composants/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getComponent(slug);
  return { title: c?.name ?? "Composant", description: c?.summary };
}

export default async function ComponentPage({ params }: PageProps<"/composants/[slug]">) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component || !component.available || !component.file) notFound();

  const source = await getDartSource(component.file);

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-8 pb-22">
      <div className="flex flex-col gap-3">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink-subtle">
          <Link href="/composants" className="hover:text-ink">Composants</Link> / {component.category} /{" "}
          <span className="text-ink">{component.name}</span>
        </nav>
        <div className="flex flex-wrap items-baseline gap-3.5">
          <h1 className="font-display text-[44px] font-extrabold tracking-tight">{component.name}</h1>
          <span className="rounded-md bg-chip px-2 py-1 font-mono text-xs">Flutter</span>
        </div>
        <p className="max-w-[680px] text-[17px] leading-relaxed text-ink-muted">{component.summary}</p>
      </div>

      <ButtonPlayground />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] font-bold">Le composant</h2>
        <p className="text-ink-muted">
          Copie ce fichier dans <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-sm">lib/kola/</code> de ton
          projet. Il n&apos;a besoin que du thème Kola (voir{" "}
          <Link href="/demarrer" className="text-accent hover:text-accent-dark">Démarrer</Link>).
        </p>
        <CodeBlock filename={`lib/kola/${component.file}`} code={source} />
      </section>
    </main>
  );
}
