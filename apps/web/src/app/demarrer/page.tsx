import type { Metadata } from "next";
import Link from "next/link";
import { getDartSource, getReactSource } from "@/lib/source";
import { CodeBlock } from "@/components/CodeBlock";
import { FrameworkTabs, FrameworkView } from "@/components/Framework";

export const metadata: Metadata = {
  title: "Démarrer",
  description: "Intégrer Kola UI dans un projet Flutter ou React en deux minutes.",
};

export default async function DemarrerPage() {
  const [theme, reactTheme] = await Promise.all([getDartSource("kola_theme.dart"), getReactSource("kola-theme.css")]);

  return (
    <main className="mx-auto flex max-w-[820px] flex-col gap-12 px-6 pt-10 pb-22">
      <div className="flex flex-col gap-3.5">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">Démarrer</h1>
        <p className="text-lg leading-relaxed text-ink-muted">
          Kola UI ne s&apos;installe pas. Tu copies deux choses dans ton projet : le thème une seule fois, puis les
          composants dont tu as besoin.
        </p>
        <div className="mt-2">
          <FrameworkTabs />
        </div>
      </div>

      <FrameworkView
        flutter={
          <div className="flex flex-col gap-12">
            <Step n={1} title="Copier le thème">
              <p>
                Le thème contient les couleurs, les arrondis et le style des boutons et des champs. Tous les composants y
                puisent leurs valeurs.
              </p>
              <CodeBlock filename="lib/kola/kola_theme.dart" code={theme} />
            </Step>

            <Step n={2} title="Brancher le thème">
              <p>Dans ton fichier principal, passe le thème Kola à ton application.</p>
              <CodeBlock
                filename="main.dart"
                code={`MaterialApp(\n  theme: KolaTheme.light(),\n  darkTheme: KolaTheme.dark(),\n  home: const MonEcran(),\n);`}
              />
            </Step>

            <Step n={3} title="Ajouter un composant">
              <p>
                Ouvre un composant dans le catalogue, ajuste-le, puis copie son fichier dans <Path>lib/kola/</Path>.
              </p>
              <CatalogueLink />
            </Step>

            <Step n={4} title="Le modifier">
              <p>
                Le fichier copié est à toi. Change ce que tu veux : couleurs, textes, comportement. Rien ne sera écrasé par
                une mise à jour.
              </p>
            </Step>
          </div>
        }
        react={
          <div className="flex flex-col gap-12">
            <Step n={1} title="Vérifier les prérequis">
              <p>
                Les composants React utilisent <strong className="text-ink">React 18 ou plus</strong> et{" "}
                <strong className="text-ink">Tailwind CSS v4</strong>. Rien d&apos;autre : pas de bibliothèque
                d&apos;icônes, pas de paquet à installer. Ils marchent avec Next.js, Vite ou Remix.
              </p>
            </Step>

            <Step n={2} title="Copier le thème">
              <p>
                Le thème définit les couleurs Kola (<Path>bg-kola-primary</Path>, <Path>text-kola-ink</Path>…), le mode
                sombre et l&apos;arrondi. Copie-le dans <Path>src/components/kola/</Path>.
              </p>
              <CodeBlock filename="src/components/kola/kola-theme.css" code={reactTheme} />
            </Step>

            <Step n={3} title="Brancher le thème">
              <p>Dans ton CSS global, importe-le juste après Tailwind.</p>
              <CodeBlock
                filename="globals.css"
                code={`@import "tailwindcss";\n@import "./components/kola/kola-theme.css";\n\n/* Optionnel : ta couleur */\n:root {\n  --kola-primary: #1f6b45;\n}`}
              />
              <p>
                Pour le mode sombre, ajoute la classe <Path>dark</Path> sur la balise <Path>html</Path>.
              </p>
            </Step>

            <Step n={4} title="Ajouter un composant">
              <p>
                Ouvre un composant dans le catalogue, choisis React, puis copie son fichier dans{" "}
                <Path>src/components/kola/</Path>. Les fichiers commencent par <Path>&quot;use client&quot;</Path> : ils
                marchent tels quels dans Next.js.
              </p>
              <CatalogueLink />
            </Step>

            <Step n={5} title="Le modifier">
              <p>
                Le fichier copié est à toi. Change ce que tu veux : classes, textes, comportement. Rien ne sera écrasé par
                une mise à jour.
              </p>
            </Step>
          </div>
        }
      />
    </main>
  );
}

function Path({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-sm text-ink">{children}</code>;
}

function CatalogueLink() {
  return (
    <Link
      href="/composants"
      className="self-start rounded-[10px] bg-accent px-4.5 py-3 font-semibold text-white hover:bg-accent-dark"
    >
      Ouvrir le catalogue →
    </Link>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 text-ink-muted [&>p]:leading-relaxed">
      <h2 className="flex items-center gap-3 font-display text-[28px] font-bold text-ink">
        <span className="flex size-9 items-center justify-center rounded-full bg-accent font-sans text-[17px] font-semibold text-white">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
