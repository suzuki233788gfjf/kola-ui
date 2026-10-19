import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPONENTS, THEME_FILE, TARGET_FOLDER, dependencyOrder, getComponent, type KolaComponent } from "@/lib/components";
import { getSource } from "@/lib/source";
import { ComponentPlayground } from "@/components/Playgrounds";
import { CodeBlock } from "@/components/CodeBlock";
import { FrameworkTabs, FrameworkView } from "@/components/Framework";
import { FRAMEWORKS, type Framework } from "@/lib/frameworks";

export function generateStaticParams() {
  return COMPONENTS.filter((c) => c.available).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/composants/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getComponent(slug);
  return { title: c?.name ?? "Composant", description: c?.summary };
}

/** CSS et JS HTML (thème + dépendances + composant), pour l'aperçu HTML. */
async function htmlAssets(slug: string) {
  const files = [THEME_FILE.html, ...dependencyOrder(slug, "html").flatMap((c) => c.files.html)];
  const sources = await Promise.all(files.map(async (f) => [f, await getSource("html", f)] as const));
  return {
    css: sources.filter(([f]) => f.endsWith(".css")).map(([, s]) => s).join("\n"),
    js: sources.filter(([f]) => f.endsWith(".js")).map(([, s]) => s).join("\n;\n"),
  };
}

export default async function ComponentPage({ params }: PageProps<"/composants/[slug]">) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component || !component.available) notFound();

  const [assets, ...sources] = await Promise.all([
    htmlAssets(component.slug),
    ...FRAMEWORKS.map(({ id }) => Promise.all(component.files[id].map(async (f) => ({ file: f, code: await getSource(id, f) })))),
  ]);
  const views = Object.fromEntries(
    FRAMEWORKS.map(({ id }, i) => [id, <SourceSection key={id} framework={id} component={component} files={sources[i]} />]),
  ) as Record<Framework, React.ReactNode>;

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-8 pb-22">
      <div className="flex flex-col gap-3">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink-subtle">
          <Link href="/composants" className="hover:text-ink">Composants</Link> / {component.category} /{" "}
          <span className="text-ink">{component.name}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <h1 className="font-display text-[44px] font-extrabold tracking-tight">{component.name}</h1>
          <FrameworkTabs />
        </div>
        <p className="max-w-[680px] text-[17px] leading-relaxed text-ink-muted">{component.summary}</p>
      </div>

      <ComponentPlayground slug={component.slug} htmlAssets={assets} />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] font-bold">Le composant</h2>
        <FrameworkView {...views} />
      </section>
    </main>
  );
}

function SourceSection({ framework, component, files }: { framework: Framework; component: KolaComponent; files: { file: string; code: string }[] }) {
  const folder = TARGET_FOLDER[framework];
  const deps = (component.requires?.[framework] ?? []).map((s) => getComponent(s)).filter((c): c is KolaComponent => !!c);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-muted">
        {files.length > 1 ? "Copie ces fichiers" : "Copie ce fichier"} dans{" "}
        <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-sm">{folder}</code> de ton projet. Il a besoin du thème Kola
        (voir{" "}
        <Link href="/demarrer" className="text-accent hover:text-accent-dark">
          Démarrer
        </Link>
        ).
      </p>
      {deps.length > 0 && (
        <div className="rounded-xl bg-accent-tint px-4 py-3 text-ink">
          Ce composant utilise aussi :{" "}
          {deps.map((d, i) => (
            <span key={d.slug}>
              {i > 0 && ", "}
              <Link href={`/composants/${d.slug}`} className="font-semibold text-accent hover:text-accent-dark">
                {d.name}
              </Link>
            </span>
          ))}
          . Copie aussi {deps.length > 1 ? "leurs fichiers" : "son fichier"} ({deps.flatMap((d) => d.files[framework]).join(", ")}).
        </div>
      )}
      {files.map((f) => (
        <CodeBlock key={f.file} filename={`${folder}${f.file}`} code={f.code} />
      ))}
    </div>
  );
}
