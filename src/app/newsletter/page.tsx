import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { NewsletterForm } from '@/components/public/NewsletterForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

const newsletterCanonical = getCanonicalUrl('/newsletter');

const TITLE = `The Sunday Brief newsletter | ${DEFAULT_SEO.siteName}`;
const DESCRIPTION =
  'A free weekly email on technology in Saudi Arabia: what changed, which grants close in the next fortnight, and who raised money.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: newsletterCanonical,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: newsletterCanonical,
    siteName: DEFAULT_SEO.siteName,
    locale: DEFAULT_SEO.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    site: DEFAULT_SEO.social.twitter,
  },
};

const WHAT_YOU_GET = [
  ['The week', 'The stories that mattered, each in a paragraph, with a link if you want more.'],
  ['Closing soon', 'Grants, accelerators and programmes with deadlines in the next two weeks.'],
  ['Money', 'Funding rounds announced that week, with the investors named.'],
  ['The register', 'Startups and investors we added or updated in the directory.'],
];

const SAMPLE_OUTLINE = [
  ['01', 'Opening note', 'A few lines from the editor on the week’s main thread.'],
  ['02', 'The week', 'Four to six short items across AI, government platforms, security, cities, finance and energy.'],
  ['03', 'Closing soon', 'A dated list of deadlines, nearest first, each linked to the issuing body’s page.'],
  ['04', 'Money', 'Rounds announced, by company, stage and lead investor, as disclosed.'],
  ['05', 'One long read', 'Our longest piece of the week, or one worth going back to.'],
];

export default function NewsletterPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Newsletter', current: true },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-8 md:pt-10 pb-24">
          <Breadcrumbs items={breadcrumbs} />

          <section className="mt-10 md:mt-12 grid gap-10 lg:grid-cols-12 lg:gap-x-10 lg:items-end">
            <header className="lg:col-span-7">
              <p className="kicker mb-3">The Sunday Brief · Sundays, 7am Riyadh</p>
              <h1 className="font-serif text-display-lg text-ink">
                The week in Saudi tech, <em className="italic">in one email.</em>
              </h1>
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-ink-3">
                What changed, which grants close in the next fortnight, and who raised money. Written by our editors for
                founders, operators and investors. Free.
              </p>
            </header>
            <div className="lg:col-span-5">
              <NewsletterForm variant="standalone" />
            </div>
          </section>

          <div className="mt-20 md:mt-24 grid gap-16 lg:grid-cols-12 lg:gap-x-10">
            <section aria-labelledby="what-you-get" className="lg:col-span-5">
              <div className="rule-dot-t pt-4">
                <h2 id="what-you-get" className="font-serif text-display-sm md:text-display-md text-ink">
                  What you get
                </h2>
                <p className="mt-2 text-[0.9375rem] text-ink-3">Every Sunday morning, in your inbox.</p>
              </div>
              <dl className="mt-6 border-t border-ink">
                {WHAT_YOU_GET.map(([term, desc]) => (
                  <div key={term} className="border-b border-rule py-4">
                    <dt className="font-serif text-[1.25rem] text-ink">{term}</dt>
                    <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">{desc}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="sample-issue" className="lg:col-span-7 lg:border-l lg:border-rule lg:pl-10">
              <div className="rule-dot-t pt-4">
                <h2 id="sample-issue" className="font-serif text-display-sm md:text-display-md text-ink">
                  How an issue is laid out
                </h2>
                <p className="mt-2 text-[0.9375rem] text-ink-3">The running order, from top to bottom.</p>
              </div>
              <ol className="mt-6 border-t border-ink">
                {SAMPLE_OUTLINE.map(([n, title, desc]) => (
                  <li key={n} className="grid grid-cols-[2.75rem_minmax(0,1fr)] border-b border-rule py-4">
                    <span className="font-sans tabular text-sm text-ink-4 pt-1">{n}</span>
                    <div>
                      <p className="font-serif text-[1.25rem] text-ink">{title}</p>
                      <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-3">
                We use your address only to send the newsletter. Every issue has a one-click unsubscribe link. See the{' '}
                <Link href="/privacy" className="text-ink underline underline-offset-2 hover:text-clay">
                  privacy policy
                </Link>
                .
              </p>
            </section>
          </div>
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
