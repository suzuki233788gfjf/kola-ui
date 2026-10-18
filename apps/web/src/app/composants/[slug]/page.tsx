import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPONENTS, getComponent, reactFile } from "@/lib/components";
import { getDartSource, getReactSource } from "@/lib/source";
import { ComponentPlayground } from "@/components/Playgrounds";
import { CodeBlock } from "@/components/CodeBlock";
import { FrameworkTabs, FrameworkView } from "@/components/Framework";

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

  const [source, reactSource] = await Promise.all([
    getDartSource(component.file),
    getReactSource(reactFile(component.file)),
  ]);

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-8 pb-22">
      <div className="flex flex-col gap-3">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink-subtle">
          <Link href="/composants" className="hover:text-ink">Composants</Link> / {component.category} /{" "}
          <span className="text-ink">{component.name}</span>
        </nav>
        <div className="flex flex-wrap items-baseline gap-3.5">
          <h1 className="font-display text-[44px] font-extrabold tracking-tight">{component.name}</h1>
          <FrameworkTabs />
        </div>
        <p className="max-w-[680px] text-[17px] leading-relaxed text-ink-muted">{component.summary}</p>
      </div>

      <ComponentPlayground slug={component.slug} />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] font-bold">Le composant</h2>
        <FrameworkView
          flutter={
            <SourceBlock
              folder="lib/kola/"
              file={component.file}
              code={source}
              requires={component.requires ?? []}
              toSlug={(f) => COMPONENTS.find((c) => c.file === f)}
            />
          }
          react={
            <SourceBlock
              folder="components/kola/"
              file={reactFile(component.file)}
              code={reactSource}
              requires={(component.requires ?? []).map(reactFile)}
              toSlug={(f) => COMPONENTS.find((c) => c.file && reactFile(c.file) === f)}
            />
          }
        />
      </section>
    </main>
  );
}

function SourceBlock({
  folder,
  file,
  code,
  requires,
  toSlug,
}: {
  folder: string;
  file: string;
  code: string;
  requires: string[];
  toSlug: (file: string) => { slug: string; name: string } | undefined;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-muted">
        Copie ce fichier dans <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-sm">{folder}</code> de ton
        projet. Il a besoin du thème Kola (voir{" "}
        <Link href="/demarrer" className="text-accent hover:text-accent-dark">
          Démarrer
        </Link>
        ).
      </p>
      {requires.length > 0 && (
        <div className="rounded-xl bg-accent-tint px-4 py-3 text-ink">
          Ce composant utilise aussi :{" "}
          {requires.map((f, i) => {
            const dep = toSlug(f);
            return (
              <span key={f}>
                {i > 0 && ", "}
                {dep ? (
                  <Link href={`/composants/${dep.slug}`} className="font-semibold text-accent hover:text-accent-dark">
                    {dep.name}
                  </Link>
                ) : (
                  <code className="font-mono text-sm">{f}</code>
                )}
              </span>
            );
          })}
          . Copie aussi leurs fichiers dans <code className="font-mono text-sm">{folder}</code>.
        </div>
      )}
      <CodeBlock filename={`${folder}${file}`} code={code} />
    </div>
  );
}
