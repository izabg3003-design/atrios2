import React from 'react';

interface AtriosLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  variant?: 'metallic' | 'flat' | 'white';
}

export const AtriosLogo: React.FC<AtriosLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  textColor = 'text-slate-950',
  subtextColor = 'text-slate-400',
  variant = 'metallic'
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* SVG Official Metallic Construction Barrier Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md transition-transform duration-200 hover:scale-105"
        aria-label="Átrios Build Logo"
      >
        <defs>
          {/* Metallic Silver Plate Gradient */}
          <linearGradient id="atriosMetalGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Specular Highlight Gradient */}
          <linearGradient id="atriosHighlight" x1="0" y1="0" x2="200" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.4" />
          </linearGradient>

          {/* Cutout Inner Bevel / Shadow Gradient */}
          <linearGradient id="atriosCutoutBevel" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.9" />
          </linearGradient>

          {/* Orange Inset Glow / Background */}
          <radialGradient id="atriosOrangeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>

          {/* Shadow Filter */}
          <filter id="atriosDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.25" />
          </filter>

          <filter id="atriosInnerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feComponentTransfer in="SourceAlpha">
              <feFuncA type="linear" slope="0.7"/>
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feOffset dx="0" dy="3"/>
            <feComposite operator="out" in2="SourceGraphic"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.1   0 0 0 0 0.1   0 0 0 0 0.15  0 0 0 0.7 0"/>
            <feBlend mode="multiply" in2="SourceGraphic"/>
          </filter>
        </defs>

        {/* Outer Metallic Squircle Plate */}
        <rect
          x="12"
          y="12"
          width="176"
          height="176"
          rx="52"
          fill="url(#atriosMetalGrad)"
          stroke="url(#atriosHighlight)"
          strokeWidth="2.5"
          filter="url(#atriosDropShadow)"
        />

        {/* Brushed Texture Lines Overlay */}
        <g opacity="0.12" stroke="#000000" strokeWidth="0.75">
          <line x1="20" y1="45" x2="180" y2="45" />
          <line x1="16" y1="65" x2="184" y2="65" />
          <line x1="14" y1="85" x2="186" y2="85" />
          <line x1="14" y1="105" x2="186" y2="105" />
          <line x1="14" y1="125" x2="186" y2="125" />
          <line x1="16" y1="145" x2="184" y2="145" />
          <line x1="20" y1="165" x2="180" y2="165" />
        </g>

        {/* Construction Barrier Symbol (Cutout Channel in the Metal) */}
        <g id="construction-barrier-cutout">
          
          {/* Vertical Legs (Left & Right Cutouts) */}
          {/* Left Vertical Post */}
          <rect
            x="64"
            y="54"
            width="14"
            height="92"
            rx="7"
            fill="url(#atriosOrangeGlow)"
            stroke="#9a3412"
            strokeWidth="1.5"
          />

          {/* Right Vertical Post */}
          <rect
            x="122"
            y="54"
            width="14"
            height="92"
            rx="7"
            fill="url(#atriosOrangeGlow)"
            stroke="#9a3412"
            strokeWidth="1.5"
          />

          {/* Horizontal Barrier Outer Board */}
          <rect
            x="44"
            y="72"
            width="112"
            height="56"
            rx="12"
            fill="url(#atriosMetalGrad)"
            stroke="url(#atriosOrangeGlow)"
            strokeWidth="4.5"
          />

          {/* Barrier Inner Cutout Channel */}
          <rect
            x="50"
            y="78"
            width="100"
            height="44"
            rx="8"
            fill="url(#atriosOrangeGlow)"
          />

          {/* Slanted Metallic Stripes inside the barrier */}
          <g>
            {/* Stripe 1 */}
            <path
              d="M58 122 L76 78 L90 78 L72 122 Z"
              fill="url(#atriosMetalGrad)"
              stroke="url(#atriosHighlight)"
              strokeWidth="1"
            />
            {/* Stripe 2 */}
            <path
              d="M84 122 L102 78 L116 78 L98 122 Z"
              fill="url(#atriosMetalGrad)"
              stroke="url(#atriosHighlight)"
              strokeWidth="1"
            />
            {/* Stripe 3 */}
            <path
              d="M110 122 L128 78 L142 78 L124 122 Z"
              fill="url(#atriosMetalGrad)"
              stroke="url(#atriosHighlight)"
              strokeWidth="1"
            />
          </g>

          {/* Subtle Barrier Border Bevel */}
          <rect
            x="44"
            y="72"
            width="112"
            height="56"
            rx="12"
            fill="none"
            stroke="url(#atriosHighlight)"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      {/* Optional Side Branding Text */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center tracking-tight leading-none">
            <span className={`text-xl font-black ${textColor}`}>ÁTRIOS</span>
            <span className="text-xl font-black text-orange-500">BUILD</span>
          </div>
          <span className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 ${subtextColor}`}>
            SOFTWARE PARA CONSTRUÇÃO CIVIL
          </span>
        </div>
      )}
    </div>
  );
};

export default AtriosLogo;
