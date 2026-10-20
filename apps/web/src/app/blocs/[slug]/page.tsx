import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOCS, BLOC_FOLDER, blocDependencies, getBloc, type KolaBloc } from "@/lib/blocs";
import { THEME_FILE, type KolaComponent } from "@/lib/components";
import { getSource } from "@/lib/source";
import { SHARE_IMAGE } from "@/lib/site";
import { BlocPlayground } from "@/components/BlocPlaygrounds";
import { CodeBlock } from "@/components/CodeBlock";
import { FrameworkTabs, FrameworkView } from "@/components/Framework";
import { FRAMEWORKS, type Framework } from "@/lib/frameworks";

export function generateStaticParams() {
  return BLOCS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blocs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const b = getBloc(slug);
  if (!b) return { title: "Bloc" };
  const description = `${b.summary} En Flutter, React, Vue et HTML, prêt à copier.`;
  return {
    title: b.name,
    description,
    openGraph: { title: `${b.name} · Kola UI`, description, url: `/blocs/${b.slug}`, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", images: [SHARE_IMAGE], title: `${b.name} · Kola UI`, description },
    alternates: { canonical: `/blocs/${b.slug}` },
  };
}

/** Fichiers HTML à charger : thème, composants utilisés, mise en page des blocs. */
function htmlFiles(bloc: KolaBloc) {
  return [THEME_FILE.html, ...blocDependencies(bloc, "html").flatMap((c) => c.files.html), ...bloc.files.html.filter((f) => f.endsWith(".css"))];
}

export default async function BlocPage({ params }: PageProps<"/blocs/[slug]">) {
  const { slug } = await params;
  const bloc = getBloc(slug);
  if (!bloc) notFound();

  const assetFiles = htmlFiles(bloc);
  const assetSources = await Promise.all(assetFiles.map(async (f) => [f, await getSource("html", f)] as const));
  const htmlAssets = {
    css: assetSources.filter(([f]) => f.endsWith(".css")).map(([, s]) => s).join("\n"),
    js: assetSources.filter(([f]) => f.endsWith(".js")).map(([, s]) => s).join("\n;\n"),
  };
  const htmlMain = bloc.files.html.find((f) => f.endsWith(".html"))!;
  const htmlBloc = await getSource("html", htmlMain);
  const htmlIncludes = [
    ...assetFiles.filter((f) => f.endsWith(".css")).map((f) => `<link rel="stylesheet" href="kola/${f}">`),
    ...assetFiles.filter((f) => f.endsWith(".js")).map((f) => `<script src="kola/${f}"></script>`),
  ].join("\n");

  const sources = await Promise.all(
    FRAMEWORKS.map(({ id }) => Promise.all(bloc.files[id].map(async (f) => ({ file: f, code: await getSource(id, f) })))),
  );
  const views = Object.fromEntries(
    FRAMEWORKS.map(({ id }, i) => [id, <BlocSource key={id} framework={id} bloc={bloc} files={sources[i]} />]),
  ) as Record<Framework, React.ReactNode>;

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-8 pb-22">
      <div className="flex flex-col gap-3">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink-subtle">
          <Link href="/blocs" className="hover:text-ink">Blocs</Link> / <span className="text-ink">{bloc.name}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <h1 className="font-display text-[44px] font-extrabold tracking-tight">{bloc.name}</h1>
          <FrameworkTabs />
        </div>
        <p className="max-w-[680px] text-[17px] leading-relaxed text-ink-muted">{bloc.summary}</p>
      </div>

      <BlocPlayground slug={bloc.slug} htmlAssets={htmlAssets} htmlBloc={htmlBloc} htmlIncludes={htmlIncludes} />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] font-bold">Le bloc</h2>
        <FrameworkView {...views} />
      </section>
    </main>
  );
}

function BlocSource({ framework, bloc, files }: { framework: Framework; bloc: KolaBloc; files: { file: string; code: string }[] }) {
  const folder = BLOC_FOLDER[framework];
  const deps = blocDependencies(bloc, framework);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl bg-accent-tint px-4 py-3 text-ink">
        <p>
          <b>1. Les composants.</b> Copie ces composants dans <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm">{folder}</code>{" "}
          (avec le thème Kola, voir{" "}
          <Link href="/demarrer" className="font-semibold text-accent hover:text-accent-dark">
            Démarrer
          </Link>
          ) :
        </p>
        <ul className="flex flex-wrap gap-2">
          {deps.map((d: KolaComponent) => (
            <li key={d.slug}>
              <Link href={`/composants/${d.slug}`} className="inline-block rounded-full border border-accent/30 bg-surface px-3 py-1 text-sm font-semibold text-accent hover:border-accent">
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
        <p>
          <b>2. Le bloc.</b> Copie {files.length > 1 ? "ces fichiers" : "ce fichier"} dans{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm">{folder}blocs/</code>.
          {framework === "html" && " Le fichier .html se colle dans ta page, après les CSS et JS Kola."}
        </p>
      </div>
      {files.map((f) => (
        <CodeBlock key={f.file} filename={`${folder}${f.file}`} code={f.code} />
      ))}
    </div>
  );
}
