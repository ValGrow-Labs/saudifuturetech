import React from 'react';
import Link from 'next/link';
import { EDITORIAL_CATEGORIES, NAV_LINKS } from '@/lib/constants';
import { NewsletterForm } from './NewsletterForm';
import { RiyadhSkyline } from './RiyadhSkyline';
import { SITE_NAME_AR } from '@/lib/arabic';

export const SiteFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-14 md:pt-20">
      {/* The Riyadh skyline rises out of the footer */}
      <RiyadhSkyline className="text-night" />
      <div className="bg-night text-snow/80">
      <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-10 pt-14 pb-10">
        {/* Top: wordmark + newsletter */}
        <div className="grid gap-12 lg:grid-cols-12 pb-14 border-b border-snow/15">
          <div className="lg:col-span-6">
            <Link href="/" className="inline-block font-serif text-snow text-4xl md:text-5xl tracking-[-0.025em] leading-none">
              Saudi <em className="italic">Future</em> Tech
            </Link>
            <p lang="ar" dir="rtl" className="mt-3 text-left font-sans text-xl text-[#E3C27F]">
              {SITE_NAME_AR}
            </p>
            <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-snow/70">
              Independent reporting on the technology being built in Saudi Arabia, and a checked directory of the
              grants, startups and investors behind it. Edited in Riyadh.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="font-serif text-2xl text-snow">The Sunday Brief</h2>
            <p className="mt-2 mb-5 text-sm text-snow/70">
              One email a week: what changed in Saudi tech, which grants are closing, and who raised.
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* Link columns — three, not four */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 py-12">
          <FooterCol title="Sections">
            {EDITORIAL_CATEGORIES.map((c) => (
              <FooterLink key={c.slug} href={`/category/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterCol>
          <FooterCol title="Directory">
            {NAV_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
            <FooterLink href="/search">Search</FooterLink>
          </FooterCol>
          <FooterCol title="Publication">
            <FooterLink href="/about">About us</FooterLink>
            <FooterLink href="/newsletter">Newsletter</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/admin">Staff sign-in</FooterLink>
          </FooterCol>
        </div>

        <div className="pt-6 border-t border-snow/15 flex flex-col sm:flex-row justify-between gap-3 font-sans text-[0.71875rem] text-snow/50">
          <p>© {year} Saudi Future Tech</p>
          <p>Riyadh · 24.7136° N, 46.6753° E</p>
        </div>
      </div>
    </div>
    </footer>
  );
};

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-sans text-[0.6875rem] uppercase tracking-[0.06em] text-snow/50 mb-4">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[0.9375rem] text-snow/80 hover:text-snow transition-colors">
        {children}
      </Link>
    </li>
  );
}

export default SiteFooter;
