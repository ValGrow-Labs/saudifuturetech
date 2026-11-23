import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NewsletterBanner } from '@/components/public/NewsletterBanner';
import { OrganizationJsonLd, BreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { getCanonicalUrl, DEFAULT_SEO } from '@/lib/seo/config';
import { EDITORIAL_CATEGORIES, SITE_NAME } from '@/lib/constants';
import { getAllAuthors } from '@/lib/data/authors';

export const revalidate = 300;

const DESCRIPTION =
  'Saudi Future Tech is an independent publication reporting on technology in Saudi Arabia, with a hand-checked directory of grants, startups and investors.';

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: {
    canonical: getCanonicalUrl('/about'),
  },
  openGraph: {
    title: `About | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: getCanonicalUrl('/about'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `About | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

/** Plain one-line summaries of each section, written for this page. */
const SECTION_NOTES: Record<string, string> = {
  'ai-deep-tech': 'Arabic language models, compute, robotics and the companies building them.',
  govtech: 'Government digital services and the platforms behind them.',
  cybersecurity: 'National security rules, enterprise defence and the local security industry.',
  'smart-cities-infra': 'The giga-projects, connectivity and building technology, and what has actually been built.',
  fintech: 'Payments, open banking, the SAMA sandbox and venture funding.',
  'clean-energy': 'Solar, hydrogen, grids and water.',
};

const CHECKS = [
  {
    title: 'It has to exist on paper',
    body: 'Startups need a Saudi commercial registration. Grants and programmes need a page on the issuing body’s own site. We link the source on every listing.',
  },
  {
    title: 'It has to exist in practice',
    body: 'A product people can use, or a programme that is taking applications. We don’t list announcements, pilots that have ended or companies we can’t reach.',
  },
  {
    title: 'Figures come with a source',
    body: 'Funding rounds, customer numbers and deadlines are shown only when the company, the investor or a public filing has published them. We don’t estimate valuations.',
  },
  {
    title: 'Every listing is dated',
    body: 'Each entry shows when we last checked it. Deadlines are re-checked as they approach, and closed programmes are marked closed rather than quietly removed.',
  },
];

export default async function AboutPage() {
  const authors = await getAllAuthors();
  const email = DEFAULT_SEO.publisher.editorialDesk;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'About', current: true },
  ];

  return (
    <>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-8 md:pt-10 pb-24">
          <Breadcrumbs items={breadcrumbs} />

          <header className="mt-10 md:mt-12 max-w-3xl">
            <p className="kicker mb-3">About us</p>
            <h1 className="font-serif text-display-lg text-ink">
              We report on the technology being built in Saudi Arabia.
            </h1>
            <p className="standfirst mt-5 max-w-2xl">
              Who is building what, who is paying for it, and whether it works. Written for founders, operators and
              investors who need the detail.
            </p>
          </header>

          <div className="mt-14 md:mt-16 grid gap-y-16 lg:grid-cols-12 lg:gap-x-10">
            {/* Left rail: contents */}
            <nav aria-label="On this page" className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 rule-dot-t pt-4">
                <p className="meta mb-3">On this page</p>
                <ol className="space-y-2 text-sm">
                  {[
                    ['#coverage', 'What we cover'],
                    ['#listings', 'How we check listings'],
                    ['#editors', 'Who edits it'],
                    ['#contact', 'Contact and corrections'],
                  ].map(([href, label], i) => (
                    <li key={href} className="flex gap-3">
                      <span className="font-sans tabular text-ink-4">{String(i + 1).padStart(2, '0')}</span>
                      <a href={href} className="text-ink-2 hover:text-clay transition-colors">
                        {label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="lg:col-span-9 lg:border-l lg:border-rule lg:pl-10 space-y-20">
              <section id="coverage" aria-labelledby="coverage-h" className="scroll-mt-24">
                <h2 id="coverage-h" className="font-serif text-display-md text-ink">
                  What we cover
                </h2>
                <div className="prose-sft mt-5 max-w-measure">
                  <p>
                    {SITE_NAME} is an independent publication. We publish reporting and analysis on six areas of the
                    Saudi technology industry, and keep three directories alongside it: open grants and programmes,
                    startups, and the investors who back them.
                  </p>
                  <p>
                    The directories exist because the information is scattered across ministry sites, press releases and
                    PDFs. We gather it in one place, check it, and keep it up to date.
                  </p>
                </div>

                <ul className="mt-8 border-t border-ink max-w-3xl">
                  {EDITORIAL_CATEGORIES.map((cat) => (
                    <li key={cat.slug} className="group border-b border-rule">
                      <Link
                        href={`/category/${cat.slug}`}
                        className="grid gap-x-8 gap-y-1 py-4 -mx-3 px-3 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-baseline transition-colors hover:bg-paper-sheet/60"
                      >
                        <span className="font-serif font-bold text-[1.25rem] text-ink headline-link">{cat.name}</span>
                        <span className="text-[0.9375rem] text-ink-3">{SECTION_NOTES[cat.slug] ?? cat.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="listings" aria-labelledby="listings-h" className="scroll-mt-24">
                <h2 id="listings-h" className="font-serif text-display-md text-ink">
                  How we check listings
                </h2>
                <p className="prose-sft mt-5 max-w-measure">
                  A listing is a record, not an endorsement. These are the rules we apply to every
                  startup, investor and programme in the directories.
                </p>
                <ol className="mt-8 border-t border-ink max-w-3xl">
                  {CHECKS.map((c, i) => (
                    <li key={c.title} className="grid grid-cols-[2.75rem_minmax(0,1fr)] border-b border-rule py-5">
                      <span className="font-sans tabular text-sm text-ink-4 pt-1">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="font-serif text-[1.25rem] leading-snug text-ink">{c.title}</h3>
                        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2 max-w-measure">{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 max-w-measure text-[0.9375rem] leading-relaxed text-ink-2">
                  Founders can ask to be listed by emailing{' '}
                  <a href={`mailto:${email}`} className="text-ink underline underline-offset-2 hover:text-clay">
                    {email}
                  </a>{' '}
                  with the company’s name, website and commercial registration number. We check before we publish, and
                  we may decline.
                </p>
              </section>

              <section id="editors" aria-labelledby="editors-h" className="scroll-mt-24">
                <h2 id="editors-h" className="font-serif text-display-md text-ink">
                  Who edits it
                </h2>
                <p className="prose-sft mt-5 max-w-measure">
                  The publication is edited in Riyadh. Each piece carries the name of the person who wrote it, and every
                  directory entry records who checked it and when.
                </p>
                {authors.length > 0 && (
                  <ul className="mt-8 border-t border-ink max-w-3xl">
                    {authors.map((a) => (
                      <li key={a.id} className="group border-b border-rule">
                        <Link
                          href={`/author/${a.slug}`}
                          className="grid gap-x-8 gap-y-0.5 py-4 -mx-3 px-3 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-baseline transition-colors hover:bg-paper-sheet/60"
                        >
                          <span className="font-serif font-bold text-[1.25rem] text-ink headline-link">{a.displayName}</span>
                          <span className="text-[0.9375rem] text-ink-3">{a.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section id="contact" aria-labelledby="contact-h" className="scroll-mt-24">
                <h2 id="contact-h" className="font-serif text-display-md text-ink">
                  Contact and corrections
                </h2>
                <div className="prose-sft mt-5 max-w-measure">
                  <p>
                    If something we published is wrong, tell us and we’ll correct it. Directory entries are updated and
                    re-dated when they change.
                  </p>
                  <p>
                    Tips, corrections and listing requests go to{' '}
                    <a href={`mailto:${email}`} className="text-ink underline underline-offset-2 hover:text-clay">
                      {email}
                    </a>
                    . We keep sponsorship and editorial separate, and say so whenever a piece involves a commercial
                    relationship.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <NewsletterBanner className="mt-24 md:mt-28" />
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
