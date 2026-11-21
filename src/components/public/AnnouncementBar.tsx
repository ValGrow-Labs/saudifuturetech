'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
  badge?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = "Documenting Saudi Arabia's sovereign AI infrastructure, Vision 2030 developments & frontier innovation.",
  badge = 'Special Dispatch',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Editorial Announcement"
      className="bg-editorial-sand border-b border-editorial-hairline text-xs py-1.5 px-4 text-ink-body font-sans"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="inline-flex items-center gap-1 font-bold tracking-wider uppercase text-[10px] text-ink-high bg-brand-yellow px-1.5 py-0.5 rounded-xs shrink-0 font-sans">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{badge}</span>
          </span>
          <p className="text-ink-body truncate text-xs font-sans">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/newsletter"
            className="text-[11px] font-bold text-ink-high hover:text-brand-gold underline underline-offset-2 hidden sm:inline"
          >
            Get the Weekly Briefing &rarr;
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-ink-muted hover:text-ink-high p-0.5 transition-editorial"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
