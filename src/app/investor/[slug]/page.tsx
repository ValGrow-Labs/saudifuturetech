import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  getInvestorBySlug,
  getAllInvestorSlugs,
  getRelatedInvestors,
  getStartups,
} from '@/lib/founder-intelligence';
import { investorTypeLabel } from '@/lib/labels';
import { getCanonicalUrl, DEFAULT_SEO, DEFAULT_OG_IMAGE } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllInvestorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const investor = await getInvestorBySlug(slug);

  if (!investor) {
    return {
      title: 'Investor not found | Saudi Future Tech',
    };
  }

  const title = `${investor.name} — ${investorTypeLabel(investor.type)}`;
  const description = investor.thesisSummary || investor.description.slice(0, 160);
  const canonical = getCanonicalUrl(`/investor/${investor.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${investor.name} — investor profile`,
      description,
      url: canonical,
      siteName: DEFAULT_SEO.siteName,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function InvestorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const investor = await getInvestorBySlug(slug);

  if (!investor) {
    notFound();
  }

  const related = await getRelatedInvestors(investor.id, investor.type, 3);
  const stages = Array.isArray(investor.targetStages) ? (investor.targetStages as string[]) : [];
  const sectors = Array.isArray(investor.targetSectors) ? (investor.targetSectors as string[]) : [];
  const portfolio = Array.isArray(investor.portfolioHighlights) ? (investor.portfolioHighlights as string[]) : [];

  // Cross-link portfolio names to companies in our register
  const allStartups = await getStartups({ includeUnpublished: false });
  const startupSlugMap = new Map<string, string>();
  allStartups.forEach((s) => {
    startupSlugMap.set(s.name.toLowerCase(), s.slug);
  });

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Investors', href: '/funding' },
    { label: investor.name, current: true },
  ];

  const typeLabel = investorTypeLabel(investor.type);
  const svcLabel = investor.isSvcPartner
    ? 'SVC partner fund'
    : investor.slug === 'svc-sovereign-fund'
      ? 'Fund-of-funds operator'
      : 'No';

  // Schema.org Structured Data: FinancialService
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: investor.name,
    description: investor.description,
    url: investor.websiteUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: investor.hqLocation,
      addressCountry: 'SA',
    },
    ...(investor.isCmaAuthorized && investor.cmaLicenseNumber
      ? { legalName: `${investor.name} (CMA Authorized: ${investor.cmaLicenseNumber})` }
      : {}),
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main" className="flex-1">
        <MainContainer className="pt-8 md:pt-10 pb-24">
          <Breadcrumbs items={breadcrumbs} />

          <header className="mt-8 max-w-4xl">
            <p className="kicker mb-3">{typeLabel}</p>
            <h1 className="font-serif text-display-lg text-ink">{investor.name}</h1>
            {investor.thesisSummary && (
              <p className="mt-4 max-w-2xl font-serif text-[1.25rem] leading-relaxed text-ink-3">
                {investor.thesisSummary}
              </p>
            )}
            <p className="meta mt-5 flex flex-wrap items-center gap-x-2">
              <span>Based in {investor.hqLocation}</span>
              <span aria-hidden>·</span>
              {investor.isActiveInvesting ? (
                <span className="inline-flex items-center gap-1.5 text-moss">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-moss" />
                  Investing now
                </span>
              ) : (
                <span>Not currently investing</span>
              )}
            </p>
          </header>

          <div className="mt-10 grid gap-12 rule-dot-t pt-8 lg:grid-cols-12 lg:gap-10">
            {/* Key facts */}
            <aside className="lg:col-span-4 lg:order-last lg:border-l lg:border-rule lg:pl-10">
              <div className="lg:sticky lg:top-24">
                <h2 className="meta mb-3">Key facts</h2>
                <dl className="text-sm">
                  <Fact label="Type">{typeLabel}</Fact>
                  <Fact label="Ticket size">{investor.checkSizeRange || 'Not disclosed'}</Fact>
                  <Fact label="Stages">{stages.length ? stages.join(', ') : '—'}</Fact>
                  <Fact label="Based in">{investor.hqLocation}</Fact>
                  <Fact label="CMA licence">
                    {investor.isCmaAuthorized ? (
                      <span className="font-sans tabular">{investor.cmaLicenseNumber || 'Licensed'}</span>
                    ) : (
                      'Not CMA-licensed'
                    )}
                  </Fact>
                  <Fact label="SVC partner">{svcLabel}</Fact>
                  <Fact label="Website">
                    <a href={investor.websiteUrl} target="_blank" rel="noopener noreferrer" className="link-rule text-ink">
                      {investor.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
                    </a>
                  </Fact>
                  {investor.sourceName && (
                    <Fact label="Source">
                      {investor.sourceUrl ? (
                        <a href={investor.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-rule text-ink">
                          {investor.sourceName} ↗
                        </a>
                      ) : (
                        investor.sourceName
                      )}
                    </Fact>
                  )}
                  <Fact label="Last checked">
                    <span className="font-sans tabular">{gbDate(investor.verifiedAt)}</span>
                    {investor.verifiedBy && (
                      <span className="block text-ink-3 text-[0.8125rem] mt-0.5">by {investor.verifiedBy}</span>
                    )}
                  </Fact>
                </dl>

                {investor.pitchUrl ? (
                  <>
                    <a href={investor.pitchUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 w-full">
                      Submit a pitch <span aria-hidden>↗</span>
                    </a>
                    <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">
                      Opens {investor.name}’s own submission page.
                    </p>
                  </>
                ) : (
                  <p className="mt-6 border-l-2 border-rule pl-4 text-[0.875rem] leading-relaxed text-ink-3">
                    {investor.name} doesn’t publish a pitch form. Introductions usually come through co-investors or
                    programme partners.
                  </p>
                )}
              </div>
            </aside>

            {/* Body */}
            <article className="lg:col-span-8 space-y-12">
              <section>
                <h2 className="font-serif text-display-sm text-ink">About</h2>
                <p className="mt-4 max-w-measure text-[1.0625rem] leading-relaxed text-ink-2 whitespace-pre-line">
                  {investor.description}
                </p>
              </section>

              <section>
                <h2 className="font-serif text-display-sm text-ink mb-3">What they invest in</h2>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="meta mb-2">Stages</p>
                    <RuledList items={stages} empty="Not stated" />
                  </div>
                  <div>
                    <p className="meta mb-2">Sectors</p>
                    <RuledList items={sectors} empty="Not stated" />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <h2 className="font-serif text-display-sm text-ink">Portfolio</h2>
                  {portfolio.length > 0 && <span className="meta">From public disclosures</span>}
                </div>
                {portfolio.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="meta border-b border-ink">
                        <th scope="col" className="font-normal py-2.5 pr-6">Company</th>
                        <th scope="col" className="font-normal py-2.5 text-right">In our register</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((companyName, idx) => {
                        const matchedSlug = startupSlugMap.get(companyName.toLowerCase());
                        return (
                          <tr key={idx} className="border-b border-rule">
                            <th scope="row" className="py-3 pr-6 font-normal font-serif text-[1.125rem] text-ink">
                              {matchedSlug ? (
                                <Link href={`/startup/${matchedSlug}`} className="headline-link">
                                  {companyName}
                                </Link>
                              ) : (
                                companyName
                              )}
                            </th>
                            <td className="py-3 text-right text-sm">
                              {matchedSlug ? (
                                <Link href={`/startup/${matchedSlug}`} className="group inline-flex items-center gap-1.5 text-ink">
                                  <span className="link-rule">Profile</span>
                                  <span aria-hidden>→</span>
                                </Link>
                              ) : (
                                <span className="font-sans text-ink-4">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-[0.9375rem] text-ink-3">This investor hasn’t published its portfolio.</p>
                )}
              </section>

              {(investor.licenseDetails || investor.svcProgramDetails || investor.regulatoryCategory) && (
                <section>
                  <h2 className="font-serif text-display-sm text-ink mb-3">Licensing</h2>
                  <dl className="text-sm">
                    {investor.regulatoryCategory && <Fact label="Category">{investor.regulatoryCategory}</Fact>}
                    {investor.svcProgramDetails && <Fact label="SVC programme">{investor.svcProgramDetails}</Fact>}
                    {investor.licenseDetails && <Fact label="Legal entity">{investor.licenseDetails}</Fact>}
                  </dl>
                </section>
              )}
            </article>
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related" className="mt-20 md:mt-28">
              <div className="rule-dot-t pt-4 mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 id="related" className="font-serif text-display-sm text-ink">
                  Other {typeLabel.toLowerCase()} investors
                </h2>
                <Link href="/funding" className="group shrink-0 inline-flex items-center gap-2 text-sm text-ink">
                  <span className="link-rule">All investors</span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
              <ul>
                {related.map((rel) => (
                  <li key={rel.id} className="border-b border-rule">
                    <Link
                      href={`/investor/${rel.slug}`}
                      className="group grid gap-x-6 gap-y-1 py-4 md:grid-cols-[minmax(0,1fr)_16rem_10rem] md:items-baseline -mx-3 px-3 transition-colors hover:bg-paper-sheet/60"
                    >
                      <span className="font-serif font-bold text-[1.125rem] leading-snug text-ink headline-link">{rel.name}</span>
                      <span className="text-sm text-ink-2">{rel.checkSizeRange || 'Ticket not disclosed'}</span>
                      <span className="text-sm text-ink-3">{rel.hqLocation}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}

function gbDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-rule py-3 first:border-t">
      <dt className="meta pt-0.5">{label}</dt>
      <dd className="text-ink-2 leading-snug break-words">{children}</dd>
    </div>
  );
}

function RuledList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="border-t border-ink py-3 text-sm text-ink-3">{empty}</p>;
  return (
    <ul className="border-t border-ink">
      {items.map((t, i) => (
        <li key={i} className="border-b border-rule py-2.5 text-[0.9375rem] text-ink-2">
          {t}
        </li>
      ))}
    </ul>
  );
}
