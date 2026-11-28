import React from 'react';
import { RiyadhSkyline } from './RiyadhSkyline';

// Low-rise stretch of the city (left of the Kingdom Centre in the full drawing),
// repeated outwards so the skyline runs edge to edge on any screen width.
const DISTRICT = '0 0 440 160';

/**
 * Full-width Riyadh skyline across the top of every page: the landmarks
 * (Kingdom Centre, Al Faisaliah, KAFD) in the centre, low-rise districts
 * extending to both edges, standing on an ink line with a thin gold rule.
 */
export function TopOrnament() {
  const h = '!h-12 md:!h-[4.5rem]';
  return (
    <div aria-hidden className="select-none pt-3">
      <div className="flex items-end justify-center overflow-hidden text-ink">
        {/* left districts: grow outwards from the centre on tablet/desktop */}
        <div className="hidden sm:flex flex-1 min-w-0 justify-end overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <RiyadhSkyline key={i} viewBox={DISTRICT} className={`shrink-0 !w-auto ${h}`} />
          ))}
        </div>
        {/* the landmarks */}
        <RiyadhSkyline className={`shrink-0 !w-auto ${h}`} />
        {/* right districts */}
        <div className="hidden sm:flex flex-1 min-w-0 justify-start overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <RiyadhSkyline key={i} viewBox={DISTRICT} className={`shrink-0 !w-auto ${h}`} />
          ))}
        </div>
      </div>
      <div className="h-[3px] bg-ink" />
      <div className="mt-[3px] h-px bg-gold/70" />
    </div>
  );
}
