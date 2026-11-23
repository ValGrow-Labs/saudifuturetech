import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Riyadh skyline silhouette: the Kingdom Centre (arched opening + skybridge),
 * Al Faisaliah (tapering pyramid with its globe and spire) and the KAFD towers,
 * set among lower blocks, with a scatter of gold window lights.
 *
 * Fill follows `currentColor`; lights use the gold token. Sits flush on top of
 * a band of the same colour (e.g. the footer) so the city rises out of it.
 */
export function RiyadhSkyline({
  className,
  lights = true,
  viewBox = '0 0 1440 160',
}: {
  className?: string;
  lights?: boolean;
  /** Crop to part of the city, e.g. just the landmarks. */
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      preserveAspectRatio="xMidYMax slice"
      className={cn('block w-full h-24 md:h-32', className)}
    >
      <g fill="currentColor">
        {/* low blocks, left */}
        <rect x="0" y="128" width="70" height="32" />
        <rect x="64" y="112" width="38" height="48" />
        <rect x="98" y="122" width="54" height="38" />
        <rect x="148" y="98" width="26" height="62" />
        <rect x="170" y="116" width="62" height="44" />
        <rect x="228" y="104" width="34" height="56" />
        <rect x="258" y="124" width="70" height="36" />
        <rect x="322" y="92" width="30" height="68" />
        <rect x="348" y="110" width="58" height="50" />
        <rect x="402" y="120" width="44" height="40" />

        {/* Kingdom Centre: tapering tower with a parabolic opening and skybridge */}
        <path
          fillRule="evenodd"
          d="M452 160 L464 26 Q491 2 518 26 L530 160 Z M474 34 Q491 70 508 34 Q491 18 474 34 Z"
        />
        <rect x="472" y="44" width="38" height="3" />

        <rect x="532" y="118" width="48" height="42" />
        <rect x="576" y="102" width="30" height="58" />
        <rect x="602" y="126" width="66" height="34" />
        <rect x="664" y="108" width="40" height="52" />
        <rect x="700" y="120" width="52" height="40" />

        {/* Al Faisaliah: four-sided pyramid tapering to a spire, with its globe */}
        <path d="M760 160 L792 40 L798 40 L830 160 Z" />
        <circle cx="795" cy="56" r="9" />
        <rect x="794" y="8" width="2" height="34" />

        <rect x="836" y="114" width="46" height="46" />
        <rect x="878" y="96" width="28" height="64" />
        <rect x="902" y="122" width="60" height="38" />
        <rect x="958" y="106" width="36" height="54" />
        <rect x="990" y="118" width="48" height="42" />

        {/* KAFD: a cluster of tall towers, the tallest with a stepped crown */}
        <path d="M1044 160 L1048 70 L1066 62 L1070 160 Z" />
        <path d="M1074 160 L1078 30 L1088 22 L1098 30 L1102 160 Z" />
        <rect x="1086" y="10" width="2" height="14" />
        <path d="M1106 160 L1110 58 L1130 52 L1134 160 Z" />
        <path d="M1138 160 L1140 84 L1158 80 L1162 160 Z" />

        <rect x="1166" y="112" width="52" height="48" />
        <rect x="1214" y="100" width="30" height="60" />
        <rect x="1240" y="122" width="64" height="38" />
        <rect x="1300" y="108" width="40" height="52" />
        <rect x="1336" y="124" width="104" height="36" />
      </g>

      {lights && (
        <g className="fill-gold" opacity="0.75">
          {[
            [82, 124], [160, 112], [196, 128], [240, 118], [334, 106], [366, 122], [418, 132],
            [484, 96], [498, 120], [486, 140], [590, 116], [680, 122], [716, 134],
            [790, 100], [800, 128], [852, 128], [890, 110], [972, 120], [1004, 132],
            [1056, 96], [1090, 66], [1090, 104], [1118, 84], [1148, 110], [1180, 126], [1226, 114],
            [1262, 136], [1314, 122], [1360, 140],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="3" height="3" />
          ))}
        </g>
      )}
    </svg>
  );
}
