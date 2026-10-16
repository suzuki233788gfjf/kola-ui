import type { Metadata } from "next";
import Link from "next/link";
import { getDartSource } from "@/lib/source";
import { CodeBlock } from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Démarrer",
  description: "Intégrer Kola UI dans un projet Flutter en deux minutes.",
};

export default async function DemarrerPage() {
  const theme = await getDartSource("kola_theme.dart");

  return (
    <main className="mx-auto flex max-w-[820px] flex-col gap-12 px-6 pt-10 pb-22">
      <div className="flex flex-col gap-3.5">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">Démarrer</h1>
        <p className="text-lg leading-relaxed text-ink-muted">
          Kola UI ne s&apos;installe pas. Tu copies deux choses dans ton projet Flutter : le thème une seule fois,
          puis les composants dont tu as besoin.
        </p>
      </div>

      <Step n={1} title="Copier le thème">
        <p>Le thème contient les couleurs, les arrondis et le style des boutons et des champs. Tous les composants y puisent leurs valeurs.</p>
        <CodeBlock filename="lib/kola/kola_theme.dart" code={theme} />
      </Step>

      <Step n={2} title="Brancher le thème">
        <p>Dans ton fichier principal, passe le thème Kola à ton application.</p>
        <CodeBlock
          filename="main.dart"
          code={"MaterialApp(\n  theme: KolaTheme.light(),\n  darkTheme: KolaTheme.dark(),\n  home: const MonEcran(),\n);"}
        />
      </Step>

      <Step n={3} title="Ajouter un composant">
        <p>
          Ouvre un composant dans le catalogue, ajuste-le, puis copie son fichier dans{" "}
          <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-sm">lib/kola/</code>.
        </p>
        <Link href="/composants" className="self-start rounded-[10px] bg-accent px-4.5 py-3 font-semibold text-white hover:bg-accent-dark">
          Ouvrir le catalogue →
        </Link>
      </Step>

      <Step n={4} title="Le modifier">
        <p>Le fichier copié est à toi. Change ce que tu veux : couleurs, textes, comportement. Rien ne sera écrasé par une mise à jour.</p>
      </Step>
    </main>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 text-ink-muted [&>p]:leading-relaxed">
      <h2 className="flex items-center gap-3 font-display text-[28px] font-bold text-ink">
        <span className="flex size-9 items-center justify-center rounded-full bg-accent font-sans text-[17px] font-semibold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
