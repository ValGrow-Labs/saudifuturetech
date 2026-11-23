import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthorItem } from '@/types';
import { cn } from '@/lib/utils';

interface AuthorBioCardProps {
  author: AuthorItem;
  className?: string;
  /** Render as the header of the author's own page (h1, larger portrait, no archive link). */
  isProfileHeader?: boolean;
}

function AuthorLinks({ author }: { author: AuthorItem }) {
  const handle = author.twitterHandle?.replace(/^@/, '');
  if (!handle && !author.linkedinUrl) return null;
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink">
      {handle && (
        <a href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer" className="group">
          <span className="link-rule">@{handle} on X</span> <span aria-hidden className="text-ink-4">↗</span>
        </a>
      )}
      {author.linkedinUrl && (
        <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="group">
          <span className="link-rule">LinkedIn</span> <span aria-hidden className="text-ink-4">↗</span>
        </a>
      )}
    </p>
  );
}

/** A note about the writer: portrait, name, role, a short bio. Ruled, not boxed. */
export const AuthorBioCard: React.FC<AuthorBioCardProps> = ({ author, className, isProfileHeader = false }) => {
  if (isProfileHeader) {
    return (
      <header className={cn('grid gap-8 md:grid-cols-12 md:items-end', className)}>
        <div className="md:col-span-8 lg:col-span-7">
          <p className="kicker mb-3">Contributor</p>
          <h1 className="font-serif text-display-lg text-ink">{author.displayName}</h1>
          <p className="meta mt-4">
            {author.title}
            {author.location && <> · {author.location}</>}
          </p>
          {author.bio && <p className="standfirst mt-6 max-w-2xl">{author.bio}</p>}
          <div className="mt-6">
            <AuthorLinks author={author} />
          </div>
        </div>
        {author.avatarUrl && (
          <div className="order-first md:order-none md:col-span-4 lg:col-span-3 lg:col-start-10 md:border-l md:border-rule md:pl-8">
            <div className="relative aspect-[4/5] w-24 md:w-full max-w-[14rem] overflow-hidden bg-paper-band">
              <Image src={author.avatarUrl} alt={author.displayName} fill sizes="224px" className="object-cover img-warm" />
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <aside aria-label="About the writer" className={cn('border-t border-ink pt-5', className)}>
      <div className="grid grid-cols-[4rem_1fr] sm:grid-cols-[5rem_1fr] gap-5">
        {author.avatarUrl ? (
          <Link
            href={`/author/${author.slug}`}
            tabIndex={-1}
            aria-hidden
            className="relative block aspect-square overflow-hidden bg-paper-band"
          >
            <Image src={author.avatarUrl} alt="" fill sizes="80px" className="object-cover img-warm" />
          </Link>
        ) : (
          <span aria-hidden />
        )}
        <div className="min-w-0">
          <p className="meta uppercase tracking-[0.04em]">About the writer</p>
          <h3 className="mt-1.5 font-serif text-[1.375rem] leading-tight text-ink">
            <Link href={`/author/${author.slug}`} className="headline-link">
              {author.displayName}
            </Link>
          </h3>
          <p className="meta mt-1">
            {author.title}
            {author.location && <> · {author.location}</>}
          </p>
          {author.bio && <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{author.bio}</p>}
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
            <AuthorLinks author={author} />
            <Link href={`/author/${author.slug}`} className="group inline-flex items-center gap-2 text-sm text-ink">
              <span className="link-rule">Everything by {author.displayName.split(' ')[0]}</span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
