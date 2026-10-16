/** Noix de kola avec sa feuille — même dessin que le composant Figma « Logo / Kola mark ». */
export function KolaMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M31 13c13-1 24 9 24 24S45 61 32 61 8 52 8 38 18 14 31 13z" fill="#1F6B45" />
      <path d="M32 15c-6 9 5 18 0 28-3 6 0 12 0 16" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M43 25c4 6 4 14 0 21" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="19" cy="31" rx="3" ry="6.5" transform="rotate(20 19 31)" fill="#FFFFFF" fillOpacity="0.22" />
      <path d="M32 13c1-7 8-11 16-10-1 7-7 11-16 10z" fill="#4E9E6F" />
      <path d="M33 12c4-3 8-5 12-6" stroke="#1F6B45" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="font-display text-[22px] font-extrabold tracking-tight">
      kola <span className="text-accent">ui</span>
    </span>
  );
}
