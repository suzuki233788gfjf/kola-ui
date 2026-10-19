import type { Metadata } from "next";
import Link from "next/link";
import { getSource } from "@/lib/source";
import { CodeBlock } from "@/components/CodeBlock";
import { SHARE_IMAGE } from "@/lib/site";
import { FrameworkTabs, FrameworkView } from "@/components/Framework";

export const metadata: Metadata = {
  title: "Démarrer",
  description: "Intégrer Kola UI dans un projet Flutter, React, Vue ou HTML en deux minutes.",
  openGraph: { title: "Démarrer · Kola UI", description: "Intégrer Kola UI dans un projet Flutter, React, Vue ou HTML en deux minutes.", url: "/demarrer", images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE], title: "Démarrer · Kola UI", description: "Intégrer Kola UI dans un projet Flutter, React, Vue ou HTML en deux minutes." },
  alternates: { canonical: "/demarrer" },
};

export default async function DemarrerPage() {
  const [theme, reactTheme, vueTheme, htmlTheme] = await Promise.all([
    getSource("flutter", "kola_theme.dart"),
    getSource("react", "kola-theme.css"),
    getSource("vue", "kola-theme.css"),
    getSource("html", "kola-theme.css"),
  ]);

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
        vue={
          <div className="flex flex-col gap-12">
            <Step n={1} title="Vérifier les prérequis">
              <p>
                Les composants Vue utilisent <strong className="text-ink">Vue 3.5 ou plus</strong> et{" "}
                <strong className="text-ink">Tailwind CSS v4</strong>, comme un projet Vite ou Laravel + Inertia classique. Rien
                d&apos;autre à installer.
              </p>
            </Step>

            <Step n={2} title="Copier le thème">
              <p>
                Le thème définit les couleurs Kola, le mode sombre et l&apos;arrondi. Copie-le dans{" "}
                <Path>src/components/kola/</Path>.
              </p>
              <CodeBlock filename="src/components/kola/kola-theme.css" code={vueTheme} />
            </Step>

            <Step n={3} title="Brancher le thème">
              <p>Dans ton CSS principal, importe-le juste après Tailwind.</p>
              <CodeBlock
                filename="src/style.css"
                code={`@import "tailwindcss";\n@import "./components/kola/kola-theme.css";\n\n/* Optionnel : ta couleur */\n:root {\n  --kola-primary: #1f6b45;\n}`}
              />
            </Step>

            <Step n={4} title="Ajouter un composant">
              <p>
                Ouvre un composant dans le catalogue, choisis Vue, puis copie son fichier <Path>.vue</Path> dans{" "}
                <Path>src/components/kola/</Path>. Il s&apos;utilise avec <Path>v-model</Path>, comme un champ normal.
              </p>
              <CatalogueLink />
            </Step>

            <Step n={5} title="Le modifier">
              <p>Le fichier copié est à toi. Change ce que tu veux : classes, textes, comportement.</p>
            </Step>
          </div>
        }
        html={
          <div className="flex flex-col gap-12">
            <Step n={1} title="Rien à installer">
              <p>
                La version HTML, c&apos;est du <strong className="text-ink">HTML, du CSS et un peu de JavaScript</strong>, sans
                bibliothèque. Elle marche partout : Laravel (Blade), PHP, Django, WordPress, ou une simple page.
              </p>
            </Step>

            <Step n={2} title="Copier le thème">
              <p>
                Copie ce fichier dans un dossier <Path>kola/</Path> de ton site (par exemple <Path>public/kola/</Path> avec
                Laravel).
              </p>
              <CodeBlock filename="kola/kola-theme.css" code={htmlTheme} />
            </Step>

            <Step n={3} title="Le charger dans ta page">
              <p>Dans le &lt;head&gt;, avant les fichiers des composants :</p>
              <CodeBlock
                filename="index.html"
                code={`<link rel="stylesheet" href="kola/kola-theme.css">\n\n<!-- Optionnel : ta couleur -->\n<style>:root { --kola-primary: #1f6b45; }</style>`}
              />
              <p>
                Pour le mode sombre : <Path>&lt;html data-kola-theme=&quot;dark&quot;&gt;</Path>.
              </p>
            </Step>

            <Step n={4} title="Ajouter un composant">
              <p>
                Ouvre un composant, choisis HTML, copie son <Path>.css</Path> (et son <Path>.js</Path> s&apos;il en a un) dans{" "}
                <Path>kola/</Path>, puis colle le code HTML dans ta page :
              </p>
              <CodeBlock
                filename="index.html"
                code={`<link rel="stylesheet" href="kola/kola-phone-field.css">\n<script src="kola/kola-phone-field.js" defer></script>`}
              />
              <CatalogueLink />
            </Step>

            <Step n={5} title="Le modifier">
              <p>Les fichiers copiés sont à toi. Change ce que tu veux : couleurs, textes, comportement.</p>
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
