import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Najdi crenellation — the stepped, triangular parapet (shurfat) that crowns
 * the mud-brick walls of Diriyah and old Riyadh. Drawn as a repeating SVG
 * pattern so it scales to any width. Use sparingly: above the footer, or as
 * a section divider. Colour comes from `currentColor`.
 */
export function NajdiBorder({ className, flip = false }: { className?: string; flip?: boolean }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg
      aria-hidden
      className={cn('block w-full h-3.5', flip && 'rotate-180', className)}
      preserveAspectRatio="none"
      height="14"
    >
      <defs>
        <pattern id={`najdi-${id}`} width="28" height="14" patternUnits="userSpaceOnUse">
          {/* stepped merlon: four 3px steps up, four down */}
          <polygon
            points="2,14 2,11 5,11 5,8 8,8 8,5 11,5 11,2 17,2 17,5 20,5 20,8 23,8 23,11 26,11 26,14"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill={`url(#najdi-${id})`} />
    </svg>
  );
}

/** A single row of small triangular vents, as cut into Najdi walls. */
export function NajdiVents({ className }: { className?: string }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg aria-hidden className={cn('block w-full h-2', className)} height="8">
      <defs>
        <pattern id={`vents-${id}`} width="20" height="8" patternUnits="userSpaceOnUse">
          <polygon points="6,8 10,1 14,8" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="8" fill={`url(#vents-${id})`} />
    </svg>
  );
}
