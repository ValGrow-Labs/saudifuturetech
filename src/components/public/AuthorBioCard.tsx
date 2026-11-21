import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { AuthorItem } from '@/types';
import { cn } from '@/lib/utils';

const TwitterIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface AuthorBioCardProps {
  author: AuthorItem;
  className?: string;
  isProfileHeader?: boolean;
}

export const AuthorBioCard: React.FC<AuthorBioCardProps> = ({
  author,
  className,
  isProfileHeader = false,
}) => {
  return (
    <div
      className={cn(
        'bg-editorial-sand rounded-xs border border-editorial-hairline p-6 sm:p-8',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-editorial-pure border-2 border-editorial-hairline shrink-0">
          <Image
            src={author.avatarUrl}
            alt={author.displayName}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted font-sans block">
                {isProfileHeader ? 'Editorial Contributor' : 'About the Author'}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink-high">
                {author.displayName}
              </h3>
              <p className="text-xs text-ink-muted font-sans">{author.title}</p>
            </div>

            {author.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted bg-editorial-pure px-2.5 py-1 rounded-xs border border-editorial-hairline">
                <MapPin className="w-3 h-3 text-brand-gold" />
                <span>{author.location}</span>
              </span>
            )}
          </div>

          {author.bio && (
            <p className="text-xs sm:text-sm text-ink-body font-sans leading-relaxed pt-1">
              {author.bio}
            </p>
          )}

          {/* Social Links & Byline Link */}
          <div className="pt-3 border-t border-editorial-hairline flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-ink-muted">
              {author.twitterHandle && (
                <span className="inline-flex items-center gap-1 hover:text-ink-high transition-editorial">
                  <TwitterIcon className="w-3 h-3" />
                  <span>{author.twitterHandle}</span>
                </span>
              )}
              {author.linkedinUrl && (
                <a
                  href={author.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-ink-high transition-editorial"
                >
                  <LinkedinIcon className="w-3 h-3" />
                  <span>Verified Profile</span>
                </a>
              )}
            </div>

            {!isProfileHeader && (
              <Link
                href={`/author/${author.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-ink-high hover:text-brand-gold font-sans uppercase tracking-wider"
              >
                <span>View Author Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
