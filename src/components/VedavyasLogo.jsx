import { useId } from 'react';

/**
 * Scalable, crisp vector crest for VEDAVYAS E.M SCHOOL, GUNTAKAL.
 * Uses pure inline SVG + CSS so it never blurs or lags at any resolution (including print).
 */
export function VedavyasLogo({ className = 'w-10 h-10', alt = 'Vedavyas E.M School Logo' }) {
  const uid = useId().replace(/:/g, '');
  const topArcId = `vvs-top-arc-${uid}`;
  const ribbonArcId = `vvs-ribbon-arc-${uid}`;
  const bottomArcId = `vvs-bottom-arc-${uid}`;
  const clipInnerId = `vvs-inner-clip-${uid}`;
  const sunGradId = `vvs-sun-grad-${uid}`;
  const flameGradId = `vvs-flame-grad-${uid}`;
  const ribbonGradId = `vvs-ribbon-grad-${uid}`;

  // Radiating sunbeam angles
  const beamAngles = Array.from({ length: 24 }, (_, i) => i * 15);

  // Left & right laurel leaf pairs along the outer navy ring
  const leafAngles = [196, 206, 216, 226, 236, 246];

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={alt}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Inner circle clip for sunbeams and tree */}
        <clipPath id={clipInnerId}>
          <circle cx="100" cy="96" r="62" />
        </clipPath>

        {/* Radial glow for inner circle */}
        <radialGradient id={sunGradId} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="55%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#ffffff" />
        </radialGradient>

        {/* Flame gradient */}
        <linearGradient id={flameGradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Ribbon gradient */}
        <linearGradient id={ribbonGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="20%" stopColor="#b91c1c" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="80%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>

        {/* Top text path */}
        <path id={topArcId} d="M 22,98 A 78,78 0 0,1 178,98" />
        {/* Ribbon text path */}
        <path id={ribbonArcId} d="M 30,136 Q 100,158 170,136" />
        {/* Bottom Guntakal path */}
        <path id={bottomArcId} d="M 46,162 A 64,64 0 0,0 154,162" />
      </defs>

      {/* Outer gold & white border */}
      <circle cx="100" cy="100" r="97" fill="#f5b800" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="93" fill="#ffffff" />
      {/* Main navy blue ring */}
      <circle cx="100" cy="100" r="90" fill="#0a2866" />

      {/* Top curved motto */}
      <text
        fill="#ffffff"
        fontSize="11.2"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="0.4"
      >
        <textPath href={`#${topArcId}`} startOffset="50%" textAnchor="middle">
          We Value Your Child&apos;s <tspan fill="#fde047">Future</tspan>
        </textPath>
      </text>

      {/* Left & right golden laurel leaves along the navy ring */}
      <g fill="#facc15" stroke="#ca8a04" strokeWidth="0.4">
        {leafAngles.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = 100 + 76 * Math.cos(rad);
          const y = 100 + 76 * Math.sin(rad);
          const rx = 100 + 76 * Math.cos(Math.PI - rad);
          const ry = 100 + 76 * Math.sin(Math.PI - rad);
          return (
            <g key={deg}>
              <ellipse cx={x} cy={y} rx="5.5" ry="2.4" transform={`rotate(${deg + 65} ${x} ${y})`} />
              <ellipse cx={rx} cy={ry} rx="5.5" ry="2.4" transform={`rotate(${115 - deg} ${rx} ${ry})`} />
            </g>
          );
        })}
      </g>

      {/* Inner gold border & cream background */}
      <circle cx="100" cy="96" r="64" fill="#f5b800" />
      <circle cx="100" cy="96" r="62" fill={`url(#${sunGradId})`} />

      {/* Radiating sunbeams inside inner circle */}
      <g clipPath={`url(#${clipInnerId})`}>
        {beamAngles.map((angle) => (
          <polygon
            key={angle}
            points="100,106 96,26 104,26"
            fill="#fde047"
            opacity="0.32"
            transform={`rotate(${angle} 100 106)`}
          />
        ))}

        {/* Tree of Knowledge trunk & branches */}
        <path
          d="M97,118 C97,102 95,90 88,80 C81,70 71,65 65,62 C72,63 82,66 90,74 C88,63 83,56 79,50 C85,54 91,62 95,72 C97,60 98,51 100,45 C102,51 103,60 105,72 C109,62 115,54 121,50 C117,56 112,63 110,74 C118,66 128,63 135,62 C129,65 119,70 112,80 C105,90 103,102 103,118 Z"
          fill="#78350f"
        />

        {/* Lush green canopy leaves */}
        <g fill="#15803d">
          <circle cx="100" cy="44" r="7" />
          <circle cx="88" cy="47" r="6.5" />
          <circle cx="112" cy="47" r="6.5" />
          <circle cx="76" cy="54" r="6.5" />
          <circle cx="124" cy="54" r="6.5" />
          <circle cx="67" cy="63" r="6" />
          <circle cx="133" cy="63" r="6" />
          <circle cx="83" cy="60" r="6" />
          <circle cx="117" cy="60" r="6" />
          <circle cx="100" cy="56" r="7" />
          <circle cx="73" cy="72" r="5" />
          <circle cx="127" cy="72" r="5" />
        </g>
        <g fill="#22c55e">
          <circle cx="95" cy="42" r="4.5" />
          <circle cx="106" cy="43" r="4.5" />
          <circle cx="82" cy="50" r="4.2" />
          <circle cx="118" cy="50" r="4.2" />
          <circle cx="70" cy="59" r="4" />
          <circle cx="130" cy="59" r="4" />
          <circle cx="89" cy="56" r="4" />
          <circle cx="111" cy="56" r="4" />
          <circle cx="100" cy="51" r="4.5" />
        </g>

        {/* Left silhouette: Boy reading */}
        <g fill="#0a2866">
          <circle cx="65" cy="96" r="6.8" />
          <path d="M58,93 C59,88 67,87 71,91 C68,90 63,91 58,93 Z" />
          <path d="M56,120 C56,108 60,104 66,104 C71,104 75,107 78,113 L84,114 L82,118 L73,117 L72,122 Z" />
          {/* Boy's book */}
          <polygon points="75,112 85,106 87,114 77,118" fill="#1e3a8a" />
        </g>

        {/* Right silhouette: Girl with ponytail reading */}
        <g fill="#0a2866">
          <circle cx="134" cy="96" r="6.5" />
          {/* Ponytail */}
          <path d="M139,93 C145,93 147,99 144,104 C142,101 141,98 139,96 Z" />
          <path d="M123,113 C126,107 130,104 135,104 C140,104 144,108 144,120 L128,122 L127,117 L118,118 L116,114 Z" />
          {/* Girl's book */}
          <polygon points="125,112 115,106 113,114 123,118" fill="#1e3a8a" />
        </g>

        {/* Central Golden Torch */}
        <g>
          {/* Torch handle */}
          <polygon points="95,97 105,97 102,130 98,130" fill="#d97706" stroke="#78350f" strokeWidth="0.6" />
          {/* Torch cup */}
          <ellipse cx="100" cy="96" rx="8" ry="3" fill="#f59e0b" stroke="#78350f" strokeWidth="0.6" />
          <rect x="93" y="92" width="14" height="4" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="0.6" />
          {/* Flame */}
          <path
            d="M100,66 C106,75 110,83 106,92 C104,93 96,93 94,92 C90,83 94,75 100,66 Z"
            fill={`url(#${flameGradId})`}
          />
          <path
            d="M100,74 C103,80 105,86 102,91 C100,92 98,91 98,91 C95,86 97,80 100,74 Z"
            fill="#fef08a"
          />
        </g>

        {/* Open Book at base */}
        <g>
          <path
            d="M44,125 Q72,118 100,132 Q128,118 156,125 L152,140 Q126,133 100,144 Q74,133 48,140 Z"
            fill="#ffffff"
            stroke="#0a2866"
            strokeWidth="2"
          />
          <path d="M50,129 Q74,123 99,135" fill="none" stroke="#0a2866" strokeWidth="1.2" />
          <path d="M51,134 Q74,128 99,139" fill="none" stroke="#0a2866" strokeWidth="1.2" />
          <path d="M150,129 Q126,123 101,135" fill="none" stroke="#0a2866" strokeWidth="1.2" />
          <path d="M149,134 Q126,128 101,139" fill="none" stroke="#0a2866" strokeWidth="1.2" />
        </g>
      </g>

      {/* Curved Crimson Ribbon Tails */}
      <path d="M14,133 L32,126 L36,147 L12,152 L20,142 Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1" />
      <path d="M186,133 L168,126 L164,147 L188,152 L180,142 Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="1" />

      {/* Main Curved Crimson Ribbon */}
      <path
        d="M24,121 Q100,145 176,121 L172,148 Q100,170 28,148 Z"
        fill={`url(#${ribbonGradId})`}
        stroke="#fbbf24"
        strokeWidth="1.8"
      />

      {/* VEDAVYAS Ribbon Text */}
      <text
        fill="#fef9c3"
        fontSize="22"
        fontWeight="900"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="1.8"
      >
        <textPath href={`#${ribbonArcId}`} startOffset="50%" textAnchor="middle">
          VEDAVYAS
        </textPath>
      </text>

      {/* Bottom GUNTAKAL text with gold dots */}
      <circle cx="52" cy="171" r="2.6" fill="#fde047" />
      <circle cx="148" cy="171" r="2.6" fill="#fde047" />
      <text
        x="100"
        y="176"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="11"
        fontWeight="800"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="2"
      >
        GUNTAKAL
      </text>
    </svg>
  );
}
