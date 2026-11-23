'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type Tone = 'moss' | 'clay' | 'ink';

export const DOT_BG: Record<Tone, string> = { moss: 'bg-moss', clay: 'bg-clay', ink: 'bg-ink-4' };
export const DOT_TEXT: Record<Tone, string> = { moss: 'text-moss', clay: 'text-clay', ink: 'text-ink-3' };

/** Status as a mono word with a 6px dot. */
export const StatusDot: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={cn('inline-flex items-center gap-1.5 font-sans text-[0.71875rem] whitespace-nowrap', DOT_TEXT[tone])}>
    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_BG[tone])} aria-hidden="true" />
    {children}
  </span>
);

/** Success / error note: a rule on the left, no box. */
export const Note: React.FC<{ tone: 'success' | 'error'; onDismiss?: () => void; children: React.ReactNode }> = ({
  tone,
  onDismiss,
  children,
}) => (
  <div
    role={tone === 'error' ? 'alert' : 'status'}
    className={cn(
      'flex items-start justify-between gap-4 border-l-2 pl-3 py-0.5 text-sm text-ink-2',
      tone === 'success' ? 'border-moss' : 'border-clay'
    )}
  >
    <span>{children}</span>
    {onDismiss && (
      <button type="button" onClick={onDismiss} className="row-action shrink-0">
        Dismiss
      </button>
    )}
  </div>
);
