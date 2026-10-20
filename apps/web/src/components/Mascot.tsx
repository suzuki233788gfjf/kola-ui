/**
 * Kola, la mascotte, pose « perdu » : il hausse les épaules et cherche du regard.
 * Même dessin que le jeu de composants Figma « Mascotte / Kola » et que la vidéo.
 */
export function LostKola({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {/* bulle « ? » */}
      <span className="kola-bob absolute top-[2%] right-[4%] flex aspect-square w-[22%] items-center justify-center rounded-full border border-line bg-surface font-display text-[clamp(28px,5vw,44px)] font-extrabold text-accent shadow-[0_12px_24px_-12px_rgba(26,23,18,0.25)]">
        ?
      </span>
      <svg viewBox="0 0 200 260" className="block h-auto w-full overflow-visible">
        {/* ombre */}
        <ellipse className="kola-shadow" cx="100" cy="248" rx="70" ry="9" fill="rgba(26,23,18,0.12)" />
        <g className="kola-body">
        {/* bras levés : il hausse les épaules */}
        <path d="M54 142 Q 30 128 22 104" stroke="#164F33" strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="21" cy="101" r="11" fill="#1F6B45" />
        <path d="M146 142 Q 170 128 178 104" stroke="#164F33" strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="179" cy="101" r="11" fill="#1F6B45" />
        {/* pieds */}
        <ellipse cx="78" cy="226" rx="22" ry="11" fill="#164F33" />
        <ellipse cx="122" cy="226" rx="22" ry="11" fill="#164F33" />
        {/* corps : la noix de kola du logo */}
        <g transform="translate(17 52) scale(2.6)">
          <path d="M31 13c13-1 24 9 24 24S45 61 32 61 8 52 8 38 18 14 31 13z" fill="#1F6B45" />
          <path d="M47 28c3 6 3 13 0 19" stroke="#fff" strokeOpacity=".3" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="14" cy="31" rx="2.5" ry="5.5" transform="rotate(20 14 31)" fill="#fff" fillOpacity=".2" />
          <g className="kola-leaf">
            <path d="M32 13c1-7 8-11 16-10-1 7-7 11-16 10z" fill="#4E9E6F" />
            <path d="M33 12c4-3 8-5 12-6" stroke="#1F6B45" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        </g>
        {/* visage */}
        <ellipse cx="70" cy="152" rx="11" ry="7" fill="#F49B8A" opacity=".55" />
        <ellipse cx="130" cy="152" rx="11" ry="7" fill="#F49B8A" opacity=".55" />
        {/* sourcils levés, un peu de travers */}
        <path d="M71 106 Q82 99 93 104" stroke="#0F3A25" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M107 101 Q118 97 129 103" stroke="#0F3A25" strokeWidth="4" strokeLinecap="round" fill="none" />
        <g className="kola-blink">
          <ellipse cx="82" cy="128" rx="13" ry="16" fill="#fff" />
          <circle cx="87" cy="123" r="7.5" fill="#1A1712" />
          <circle cx="90" cy="119" r="2.6" fill="#fff" />
          <ellipse cx="118" cy="128" rx="13" ry="16" fill="#fff" />
          <circle cx="123" cy="123" r="7.5" fill="#1A1712" />
          <circle cx="126" cy="119" r="2.6" fill="#fff" />
        </g>
        {/* bouche « oh » */}
        <ellipse cx="100" cy="161" rx="6.5" ry="7.5" fill="#3B1712" />
        <ellipse cx="100" cy="165" rx="4" ry="2.2" fill="#E8806F" />
        </g>
      </svg>
    </div>
  );
}
