/**
 * Illustrated course cover art, keyed off the category name. Rendered as inline SVG
 * rather than hosted images so covers never 404 and need no external requests.
 */

type Palette = { from: string; to: string; accent: string; soft: string };

const PALETTES: Record<string, Palette> = {
  hardware: { from: '#0F2A4A', to: '#071627', accent: '#F2A33C', soft: '#3E6B96' },
  software: { from: '#3A1734', to: '#150A18', accent: '#E0518A', soft: '#8C4A78' },
  'data science': { from: '#123A38', to: '#06201F', accent: '#4FD1B3', soft: '#2F7D72' },
  default: { from: '#1E2749', to: '#0B0F1F', accent: '#C8102E', soft: '#5A6699' },
};

function paletteFor(category: string): Palette {
  return PALETTES[category.trim().toLowerCase()] ?? PALETTES.default;
}

function Artwork({ category, p }: { category: string; p: Palette }) {
  const key = category.trim().toLowerCase();

  if (key === 'hardware') {
    return (
      <g fill="none" strokeLinecap="round">
        <rect x="118" y="42" width="64" height="64" rx="8" fill={p.soft} opacity="0.35" />
        <rect x="132" y="56" width="36" height="36" rx="4" fill={p.accent} opacity="0.9" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} stroke={p.accent} strokeWidth="2.5" opacity="0.75">
            <line x1={118} y1={56 + i * 13} x2={96} y2={56 + i * 13} />
            <line x1={182} y1={56 + i * 13} x2={204} y2={56 + i * 13} />
          </g>
        ))}
        <circle cx="96" cy="56" r="4" fill={p.accent} />
        <circle cx="204" cy="95" r="4" fill={p.accent} />
        <path d="M40 120 h40 l12 -22 l14 40 l12 -18 h50" stroke={p.soft} strokeWidth="3" opacity="0.6" />
      </g>
    );
  }

  if (key === 'software') {
    return (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="70" y="34" width="160" height="88" rx="10" fill={p.soft} opacity="0.28" />
        <rect x="70" y="34" width="160" height="18" rx="9" fill={p.accent} opacity="0.5" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={84 + i * 13} cy={43} r="3.5" fill="#fff" opacity="0.85" />
        ))}
        <path d="M112 70 l-18 16 l18 16" stroke={p.accent} strokeWidth="4.5" />
        <path d="M188 70 l18 16 l-18 16" stroke={p.accent} strokeWidth="4.5" />
        <line x1="140" y1="104" x2="160" y2="66" stroke="#fff" strokeWidth="4" opacity="0.7" />
      </g>
    );
  }

  if (key === 'data science') {
    return (
      <g fill="none" strokeLinecap="round">
        {[
          { x: 92, h: 34 },
          { x: 120, h: 56 },
          { x: 148, h: 44 },
          { x: 176, h: 72 },
          { x: 204, h: 52 },
        ].map((b, i) => (
          <rect key={i} x={b.x} y={122 - b.h} width="17" height={b.h} rx="4" fill={p.accent} opacity={0.35 + i * 0.13} />
        ))}
        <path d="M92 74 L120 54 L148 62 L176 30 L204 46" stroke="#fff" strokeWidth="3.5" opacity="0.85" />
        {[
          [92, 74],
          [120, 54],
          [148, 62],
          [176, 30],
          [204, 46],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4.5" fill="#fff" />
        ))}
      </g>
    );
  }

  return (
    <g fill="none" strokeLinecap="round">
      <circle cx="150" cy="78" r="42" stroke={p.accent} strokeWidth="3" opacity="0.6" />
      <circle cx="150" cy="78" r="24" fill={p.accent} opacity="0.35" />
      <path d="M60 118 q45 -50 90 -20 t90 -26" stroke={p.soft} strokeWidth="3" opacity="0.55" />
    </g>
  );
}

export function TrackCover({
  category,
  icon,
  className = 'h-32',
}: {
  category: string;
  icon?: string | null;
  className?: string;
}) {
  const p = paletteFor(category);
  const gradId = `cov-${category.replace(/\W+/g, '')}`;

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.from} />
            <stop offset="100%" stopColor={p.to} />
          </linearGradient>
        </defs>
        <rect width="300" height="150" fill={`url(#${gradId})`} />
        <circle cx="255" cy="18" r="60" fill={p.accent} opacity="0.10" />
        <circle cx="35" cy="140" r="48" fill={p.soft} opacity="0.16" />
        <Artwork category={category} p={p} />
      </svg>
      {icon && (
        <span className="absolute left-3 bottom-2 text-2xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110">
          {icon}
        </span>
      )}
    </div>
  );
}
