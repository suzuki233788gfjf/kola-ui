import Link from "next/link";
import { KolaMark, Wordmark } from "./Logo";
import { GITHUB_URL } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <KolaMark />
          <Wordmark />
        </Link>
        <nav className="flex flex-wrap items-center gap-7 text-[15px]">
          <Link href="/composants" className="text-ink hover:text-accent">
            Composants
          </Link>
          <Link href="/demarrer" className="text-ink hover:text-accent">
            Démarrer
          </Link>
          <Link href="/blocs" className="flex items-center gap-1.5 text-ink hover:text-accent">
            Blocs
            <span className="rounded-full bg-accent-tint px-2 py-0.5 text-xs font-semibold text-accent">nouveau</span>
          </Link>
          <a href={GITHUB_URL} className="rounded-[10px] border border-line-strong px-4 py-2.5 text-ink hover:border-ink">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
