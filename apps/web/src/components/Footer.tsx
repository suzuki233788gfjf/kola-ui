import Link from "next/link";
import { GITHUB_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-6 py-8 text-sm text-ink-subtle">
        <span>
          <strong className="text-ink">kola ui</strong> · composants libres à copier
        </span>
        <span className="flex gap-6">
          <Link href="/demarrer" className="hover:text-ink">
            Documentation
          </Link>
          <a href={GITHUB_URL} className="hover:text-ink">
            GitHub
          </a>
        </span>
      </div>
    </footer>
  );
}
