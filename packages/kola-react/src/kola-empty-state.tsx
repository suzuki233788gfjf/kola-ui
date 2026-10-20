import type { ReactNode } from "react";

export type KolaEmptyStateProps = {
  title: string;
  message?: string;
  /** Icône SVG. Par défaut : une boîte vide. */
  icon?: ReactNode;
  /** Un bouton, par exemple <KolaButton label="Réessayer" />. */
  action?: ReactNode;
  /** "error" : icône rouge, annoncée aux lecteurs d'écran. */
  tone?: "neutral" | "error";
  className?: string;
};

/**
 * Écran vide ou d'erreur : une icône, un titre, un message et une action.
 *
 * <KolaEmptyState
 *   title="Aucune commande pour le moment"
 *   message="Tes commandes apparaîtront ici dès qu'un client achète."
 *   action={<KolaButton label="Partager ma boutique" />}
 * />
 */
export function KolaEmptyState({ title, message, icon, action, tone = "neutral", className = "" }: KolaEmptyStateProps) {
  const error = tone === "error";
  return (
    <div role={error ? "alert" : undefined} className={`flex flex-col items-center px-6 py-8 text-center ${className}`}>
      <span
        aria-hidden
        className={`mb-4 flex size-16 items-center justify-center rounded-full [&_svg]:size-[30px] ${
          error ? "bg-kola-danger/12 text-kola-danger" : "bg-kola-primary/12 text-kola-primary"
        }`}
      >
        {icon ?? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13l2.5-7h13L21 13M3 13v6h18v-6M3 13h5l1.5 2.5h5L16 13h5" />
          </svg>
        )}
      </span>
      <p className="text-lg font-bold text-kola-ink">{title}</p>
      {message && <p className="mt-1.5 max-w-80 leading-relaxed text-kola-ink-subtle">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/**
 * Forme grise qui pulse doucement pendant le chargement. Donne-lui sa taille avec className.
 *
 * <KolaSkeleton className="h-4 w-32" />
 * <KolaSkeleton circle className="size-10" />
 */
export function KolaSkeleton({ circle = false, className = "" }: { circle?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`block bg-kola-line motion-safe:animate-pulse ${circle ? "shrink-0 rounded-full" : "rounded-md"} ${className}`}
    />
  );
}

/**
 * Liste en cours de chargement : rows lignes avec avatar, titre et sous-titre.
 *
 * {chargement ? <KolaSkeletonList rows={4} /> : <MaListe />}
 */
export function KolaSkeletonList({ rows = 3, avatar = true, className = "" }: { rows?: number; avatar?: boolean; className?: string }) {
  return (
    <div role="status" aria-label="Chargement…" aria-busy="true" className={`flex flex-col ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          {avatar && <KolaSkeleton circle className="size-10" />}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <KolaSkeleton className={`h-3.5 ${i % 2 ? "w-[55%]" : "w-[70%]"}`} />
            <KolaSkeleton className={`h-3 ${i % 2 ? "w-[60%]" : "w-[45%]"}`} />
          </div>
          <KolaSkeleton className="h-3.5 w-14" />
        </div>
      ))}
    </div>
  );
}
