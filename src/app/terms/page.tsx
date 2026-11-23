import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';

const DESCRIPTION = 'The terms for using Saudi Future Tech, its reporting and its directories.';

export const metadata: Metadata = {
  title: `Terms of use | ${DEFAULT_SEO.siteName}`,
  description: DESCRIPTION,
  alternates: { canonical: getCanonicalUrl('/terms') },
  openGraph: {
    title: `Terms of use | ${DEFAULT_SEO.siteName}`,
    description: DESCRIPTION,
    url: getCanonicalUrl('/terms'),
    type: 'website',
  },
};

const UPDATED = '22 November 2026';

export default function TermsPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Terms', current: true },
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
            <h1 className="font-serif text-display-lg text-ink">Terms of use</h1>
            <p className="standfirst mt-4">
              By using the site you agree to these terms. They are short, and written to be read.
            </p>
            <p className="meta mt-5">Last updated {UPDATED}</p>
          </header>

          <article className="prose-sft mt-10 [&_h2]:font-serif [&_h2]:text-display-sm [&_h2]:text-ink [&_h2]:mt-12 [&_h2]:mb-4 [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-clay">
            <h2>Our reporting</h2>
            <p>
              Articles, analysis and the text of directory listings are ours unless we say otherwise. You’re welcome to
              quote short passages with a credit and a link back. Please ask before republishing whole pieces.
            </p>

            <h2>The directories</h2>
            <p>
              The startup, investor and opportunity directories are for information only. We check each listing and
              record when we did, but details change — deadlines move, programmes close, companies raise or shut down.
              Always confirm with the company or the issuing body before you apply, invest or make a decision.
            </p>
            <p>
              A listing is not an endorsement, and nothing on the site is financial, legal or investment advice.
            </p>

            <h2>Links to other sites</h2>
            <p>
              We link to company websites, government pages and other sources. We don’t control them and aren’t
              responsible for what they publish.
            </p>

            <h2>Using the site fairly</h2>
            <p>
              Don’t try to break, overload or gain unauthorised access to the site, and don’t scrape the directories in
              bulk for resale. Reasonable personal and research use is fine.
            </p>

            <h2>The newsletter</h2>
            <p>
              The Sunday Brief is free. You can unsubscribe at any time using the link in any issue. How we handle your
              email address is explained in our <Link href="/privacy">privacy policy</Link>.
            </p>

            <h2>Changes and contact</h2>
            <p>
              We may update these terms; the date at the top of the page shows when. If you have a question, or think
              something we published is wrong, contact us through the <Link href="/about#contact">about page</Link>.
            </p>
          </article>
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
