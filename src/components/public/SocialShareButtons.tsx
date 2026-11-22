'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SocialShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
  /** Stack the links vertically (for a sidebar). */
  stacked?: boolean;
}

/** Share actions set as plain text links. No icon tiles. */
export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ title, url, className, stacked = false }) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://saudifuturetech.com';
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard unavailable — nothing to do.
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleTwitterShare = () => {
    const shareUrl = getShareUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const shareUrl = getShareUrl();
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const item = 'text-left text-sm text-ink hover:text-clay transition-colors cursor-pointer';

  return (
    <div
      className={cn(
        'flex font-sans',
        stacked ? 'flex-col items-start gap-2' : 'flex-wrap items-baseline gap-x-5 gap-y-2',
        className,
      )}
    >
      <span className="meta uppercase tracking-[0.04em]">Share</span>

      <button type="button" onClick={handleCopyLink} className={item} aria-label="Copy article link" aria-live="polite">
        <span className={cn('link-rule', copied && 'text-moss')}>{copied ? 'Link copied' : 'Copy link'}</span>
      </button>

      <button type="button" onClick={handleTwitterShare} className={item} aria-label="Share on X (Twitter)">
        <span className="link-rule">X</span> <span aria-hidden className="text-ink-4">↗</span>
      </button>

      <button type="button" onClick={handleLinkedInShare} className={item} aria-label="Share on LinkedIn">
        <span className="link-rule">LinkedIn</span> <span aria-hidden className="text-ink-4">↗</span>
      </button>

      <button type="button" onClick={handleNativeShare} className={cn(item, 'sm:hidden')} aria-label="Open device share options">
        <span className="link-rule">More</span>
      </button>
    </div>
  );
};
