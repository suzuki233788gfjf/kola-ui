import Link from "next/link";
import { COMPONENTS } from "@/lib/components";

const STEPS = [
  ["01", "Choisis", "Parcours le catalogue et teste chaque composant en direct, avant d'écrire une ligne."],
  ["02", "Personnalise", "Couleur, texte, mode sombre : le code se met à jour pendant que tu ajustes."],
  ["03", "Copie", "Un clic, le fichier est dans ton projet. Tu le modifies comme ton propre code."],
];

const LOCAL = [
  ["Téléphone +237", "Formatage automatique et détection de l'opérateur MTN ou Orange.", false],
  ["Montant FCFA", "Séparateur de milliers à la saisie, sans décimales, valeur numérique propre.", false],
  ["Dates en français", "Semaine qui commence le lundi, mois et jours en français par défaut.", false],
  ["Mobile Money", "Un formulaire de paiement MTN MoMo et Orange Money, prêt à brancher sur ton fournisseur.", false],
] as const;

export default function Home() {
  return (
    <main>
      <section className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 px-6 pt-20 pb-18">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
          <span className="self-start rounded-full bg-accent-tint px-3 py-1.5 text-sm font-medium text-accent">
            Flutter · React · Vue · HTML
          </span>
          <h1 className="font-display text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            Des composants prêts à copier. Rien à installer.
          </h1>
          <p className="max-w-[520px] text-[19px] leading-relaxed text-ink-muted">
            Choisis un composant, ajuste-le à ton projet, copie le code. Il t&apos;appartient : pas de
            dépendance, pas de mise à jour qui casse tout.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/composants" className="rounded-xl bg-accent px-5.5 py-3.5 font-semibold text-white hover:bg-accent-dark">
              Parcourir les composants →
            </Link>
            <Link href="/demarrer" className="rounded-xl border border-line-strong bg-surface px-5.5 py-3.5 font-semibold hover:border-ink">
              Démarrer en 2 minutes
            </Link>
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-5 rounded-[20px] border border-line bg-surface p-8 shadow-[0_24px_48px_-24px_rgba(26,23,18,0.18)]">
          <DemoField label="Téléphone" strong>
            <span className="border-r border-line pr-2.5 font-mono text-[15px] text-ink-muted">+237</span>
            <span className="flex-1 font-mono">6 77 12 34 56</span>
            <span className="rounded-md bg-[#FFCB05] px-2 py-1 text-xs font-semibold">MTN</span>
          </DemoField>
          <DemoField label="Montant">
            <span className="flex-1 font-mono">25 000</span>
            <span className="text-sm font-semibold text-ink-subtle">FCFA</span>
          </DemoField>
          <DemoField label="Période">
            <span className="flex-1">Du 12 au 16 oct. 2026</span>
          </DemoField>
          <span className="flex min-h-13 items-center justify-center rounded-xl bg-accent font-semibold text-white">
            Valider le paiement
          </span>
          <p className="text-center text-[13px] text-ink-subtle">Aperçu des composants Kola UI.</p>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-20">
          <h2 className="font-display text-4xl font-bold tracking-tight">Comment ça marche</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map(([n, title, text]) => (
              <div key={n} className="flex flex-col gap-3 rounded-2xl border border-line p-7">
                <span className="font-mono text-sm font-medium text-accent">{n}</span>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-on-dark">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-22">
          <div className="flex max-w-[640px] flex-col gap-3.5">
            <h2 className="font-display text-4xl font-bold tracking-tight">Pensés pour nos usages</h2>
            <p className="text-lg leading-relaxed text-on-dark-muted">
              Les composants que les grandes bibliothèques oublient, et qu&apos;on recode à chaque projet.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LOCAL.map(([title, text, soon]) => (
              <div key={title} className={`flex flex-col gap-2.5 rounded-2xl border p-6 ${soon ? "border-dashed border-[#5A544A]" : "border-dark-line"}`}>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  {title}
                  {soon && <span className="rounded-full bg-dark-line px-2 py-0.5 text-xs font-medium">bientôt</span>}
                </h3>
                <p className="leading-relaxed text-on-dark-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-9 px-6 py-22">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-bold tracking-tight">Quelques composants</h2>
          <Link href="/composants" className="font-semibold text-accent hover:text-accent-dark">
            Tout voir →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COMPONENTS.slice(0, 6).map((c) => (
            <div key={c.slug} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-6">
              <span className="text-lg font-semibold">{c.name}</span>
              <span className="leading-relaxed text-ink-muted">{c.summary}</span>
              <span className="mt-1.5 self-start rounded-md bg-chip px-2 py-0.5 font-mono text-xs text-ink-muted">
                {c.available ? "Flutter · React · Vue · HTML" : "bientôt"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function DemoField({ label, strong, children }: { label: string; strong?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <div className={`flex min-h-13 items-center gap-2.5 rounded-xl px-3.5 ${strong ? "border-[1.5px] border-accent" : "border border-line-strong"}`}>
        {children}
      </div>
    </div>
  );
}
