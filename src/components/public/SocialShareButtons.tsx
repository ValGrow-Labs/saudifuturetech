'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const TwitterIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface SocialShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  title,
  url,
  className,
}) => {
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
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleTwitterShare = () => {
    const shareUrl = getShareUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const shareUrl = getShareUrl();
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn('flex items-center gap-1.5 font-sans', className)}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted font-sans mr-1 hidden sm:inline">
        Share:
      </span>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="relative inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xs bg-editorial-pure border border-editorial-hairline text-ink-high hover:border-ink-high hover:bg-editorial-sand transition-editorial"
        aria-label="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[11px] text-brand-gold">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-ink-muted" />
            <span className="text-[11px]">Copy Link</span>
          </>
        )}
      </button>

      {/* Twitter / X */}
      <button
        onClick={handleTwitterShare}
        className="p-1.5 rounded-xs bg-editorial-pure border border-editorial-hairline text-ink-muted hover:border-ink-high hover:text-ink-high transition-editorial"
        aria-label="Share story on X (Twitter)"
      >
        <TwitterIcon className="w-3.5 h-3.5" />
      </button>

      {/* LinkedIn */}
      <button
        onClick={handleLinkedInShare}
        className="p-1.5 rounded-xs bg-editorial-pure border border-editorial-hairline text-ink-muted hover:border-ink-high hover:text-ink-high transition-editorial"
        aria-label="Share story on LinkedIn"
      >
        <LinkedinIcon className="w-3.5 h-3.5" />
      </button>

      {/* Web Share (Mobile) */}
      <button
        onClick={handleNativeShare}
        className="p-1.5 rounded-xs bg-editorial-pure border border-editorial-hairline text-ink-muted hover:border-ink-high hover:text-ink-high transition-editorial sm:hidden"
        aria-label="Open device share options"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
