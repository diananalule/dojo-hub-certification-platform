import React from 'react';

interface DojoHubLogoProps {
  className?: string;
  size?: number;
  color?: string; // Color of the torii / D structure, defaults to 'black'
  sunColor?: string; // Color of the red sun, defaults to '#FF0800'
}

export default function DojoHubLogo({ 
  className = "", 
  size = 48, 
  color = "#000000", 
  sunColor = "#FF0000" 
}: DojoHubLogoProps) {
  return (
    <svg 
      viewBox="0 0 1000 1000" 
      width={size} 
      height={size} 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      id="dojohub-logo-svg"
    >
      {/* 1. The Red Sun / Hinomaru Circle */}
      <circle 
        cx="312" 
        cy="432" 
        r="163" 
        fill={sunColor} 
        id="logo-sun"
      />

      {/* 2. The Left Vertical Pillar */}
      <rect 
        x="348" 
        y="385" 
        width="50" 
        height="433" 
        fill={color} 
        id="logo-pillar-left"
      />

      {/* 3. The Upper Crossbeam */}
      <rect 
        x="245" 
        y="365" 
        width="340" 
        height="45" 
        fill={color} 
        id="logo-crossbeam-upper"
      />

      {/* 4. Left Upturned Hook of Upper Crossbeam */}
      <rect 
        x="245" 
        y="295" 
        width="40" 
        height="70" 
        fill={color} 
        id="logo-crossbeam-left-hook"
      />

      {/* 5. The Lower Crossbeam */}
      <rect 
        x="245" 
        y="492" 
        width="340" 
        height="50" 
        fill={color} 
        id="logo-crossbeam-lower"
      />

      {/* 6. The Top Curved Roof (Kasagi) with elegant curve */}
      <path 
        d="M 203,187 C 320,215 460,235 585,240 L 585,295 C 460,290 320,270 203,245 Z" 
        fill={color} 
        id="logo-kasagi"
      />

      {/* 7. The Curved Loop of the Capital "D" with bottom left hook */}
      <path 
        d="M 585,240 C 760,240 850,330 850,529 C 850,728 760,818 585,818 L 569,818 L 569,648 L 662,648 L 662,725 C 715,725 755,675 755,529 C 755,383 715,333 662,333 L 585,333 Z" 
        fill={color} 
        id="logo-d-loop"
      />
    </svg>
  );
}
