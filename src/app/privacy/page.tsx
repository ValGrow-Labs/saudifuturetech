import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';

const DESCRIPTION = 'What Saudi Future Tech collects when you subscribe to the Sunday Brief, and how to remove it.';

export const metadata: Metadata = {
  title: 'Privacy',
  description: DESCRIPTION,
  alternates: { canonical: getCanonicalUrl('/privacy') },
  openGraph: {
    title: `Privacy | ${DEFAULT_SEO.siteName}`,
    description: DESCRIPTION,
    url: getCanonicalUrl('/privacy'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `Privacy | ${DEFAULT_SEO.siteName}`,
    description: DESCRIPTION,
  },
};

const UPDATED = '22 November 2026';

export default function PrivacyPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Privacy', current: true },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer size="narrow" className="pt-8 md:pt-10 pb-24">
          <Breadcrumbs items={breadcrumbs} />

          <header className="mt-10 md:mt-12 border-b border-rule pb-8">
            <p className="kicker mb-3">Policy</p>
            <h1 className="font-serif text-display-lg text-ink">Privacy</h1>
            <p className="standfirst mt-4">
              We collect very little. The short version: if you subscribe, we keep your email address so we can send you
              the newsletter, and we stop when you ask.
            </p>
            <p className="meta mt-5">Last updated {UPDATED}</p>
          </header>

          <article className="prose-sft mt-10 [&_h2]:font-serif [&_h2]:text-display-sm [&_h2]:text-ink [&_h2]:mt-12 [&_h2]:mb-4 [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-clay">
            <h2>Reading the site</h2>
            <p>
              You don’t need an account to read anything on Saudi Future Tech. Like most websites, our servers keep
              standard technical logs (such as IP address, browser type and the page requested) for security and to keep
              the site running. We don’t use these logs to build profiles of readers.
            </p>
            <p>
              The public site doesn’t set advertising cookies. A sign-in cookie is used only on the staff area of the
              site.
            </p>

            <h2>Subscribing to the Sunday Brief</h2>
            <p>When you sign up for the newsletter we store:</p>
            <ul className="list-none border-t border-rule font-sans text-[0.9375rem] leading-relaxed text-ink-2 !mt-4">
              <li className="border-b border-rule py-3">Your email address.</li>
              <li className="border-b border-rule py-3">The date you gave consent to receive it.</li>
              <li className="border-b border-rule py-3">Whether your subscription is active, and when you unsubscribed if you did.</li>
              <li className="border-b border-rule py-3">A random code that lets the unsubscribe link in each email work without a password.</li>
            </ul>
            <p>
              We use your address only to send the Sunday Brief and the occasional message about the newsletter itself.
              We don’t sell it or give it to advertisers. We may use an email delivery provider to send messages on our
              behalf; they process addresses only for that purpose.
            </p>

            <h2>Unsubscribing</h2>
            <p>
              Every issue has an unsubscribe link at the bottom. One click takes you to a page where you confirm, and you
              won’t receive further issues. We keep a record that the address unsubscribed so it isn’t added back by
              mistake. If you’d like the address deleted entirely, tell us and we’ll remove it.
            </p>

            <h2>The directories</h2>
            <p>
              Our directories list companies, investors and public programmes, not private individuals. Where a listing
              names a founder or executive, the information comes from public sources. If you’re named and think
              something is wrong, we’ll correct it.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about your data, deletion requests and corrections go to the editors. Contact details are on the{' '}
              <Link href="/about#contact">about page</Link>.
            </p>
            <p>
              If we change this policy we’ll update the date at the top of the page. See also our{' '}
              <Link href="/terms">terms of use</Link>.
            </p>
          </article>
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
