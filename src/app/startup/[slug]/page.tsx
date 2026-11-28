import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { CategoryBadge } from '@/components/public/CategoryBadge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getStartupBySlug, getAllStartupSlugs, getRelatedStartups, getInvestors } from '@/lib/founder-intelligence';
import { stageLabel, businessModelLabel } from '@/lib/labels';
import { getCanonicalUrl, DEFAULT_SEO, DEFAULT_OG_IMAGE } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllStartupSlugs();
  return slugs.map((slug) => ({ slug }));
}

function findMatchedInvestor(invString: string, investors: { name: string; slug: string }[]) {
  const clean = invString.toLowerCase().trim();
  for (const inv of investors) {
    if (inv.name.toLowerCase() === clean) return inv;
  }
  const baseName = clean.replace(/\s*\(.*?\)\s*/g, '').trim();
  if (baseName.length >= 3) {
    for (const inv of investors) {
      if (inv.name.toLowerCase() === baseName) return inv;
      if (inv.name.toLowerCase().startsWith(baseName + ' ')) return inv;
      if (baseName.startsWith(inv.name.toLowerCase())) return inv;
    }
  }
  if (clean.includes('saudi venture capital') || clean === 'svc') {
    return investors.find((i) => i.slug === 'svc-sovereign-fund') || null;
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) {
    return {
      title: 'Startup not found | Saudi Future Tech',
    };
  }

  // Determine stage display: omit if missing or uninformative
  const stage = startup.stage ? stageLabel(startup.stage) : null;
  const validStage = stage && stage !== '—' ? stage : null;

  // Title: omit stage if missing, avoiding '(—)'
  const title = validStage ? `${startup.name} (${validStage})` : startup.name;

  // Defensive description synthesis:
  const city = startup.hqCity?.trim() || null;
  const categoryName = startup.category?.name?.trim() || null;

  const locationPrefix = city ? `${city}-based` : 'Saudi Arabia-based';
  const stageDescriptor = validStage ? `${validStage} venture` : 'venture';

  const descParts: string[] = [];
  if (categoryName) {
    descParts.push(`${startup.name} is a ${locationPrefix} ${stageDescriptor} in ${categoryName}.`);
  } else {
    // If category is missing, omit category phrase entirely to prevent repeating "Saudi Arabia"
    descParts.push(`${startup.name} is a ${locationPrefix} ${stageDescriptor}.`);
  }

  if (startup.tagline && startup.tagline.trim()) {
    descParts.push(startup.tagline.trim());
  } else if (startup.description && startup.description.trim()) {
    const firstParagraph = startup.description.trim().split(/\n+/)[0].trim();
    descParts.push(firstParagraph);
  }

  let description = descParts.join(' ').replace(/\s+/g, ' ').trim();
  if (description.length > 160) {
    description = description.slice(0, 157).trimEnd() + '...';
  }
  const canonical = getCanonicalUrl(`/startup/${startup.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${startup.name} — Saudi Future Tech startup register`,
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

function longDate(d: Date) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default async function StartupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const startup = await getStartupBySlug(slug);

  if (!startup) {
    notFound();
  }

  const allInvestors = await getInvestors({ includeUnpublished: false });

  const sameSector = await getRelatedStartups(startup.categoryId, startup.id, 3);
  // Fall back to the wider register when nothing else is listed in this sector.
  const related = sameSector.length ? sameSector : await getRelatedStartups(null, startup.id, 3);
  const relatedInSector = sameSector.length > 0;
  const techList = Array.isArray(startup.techStack) ? (startup.techStack as string[]) : [];
  const productList = Array.isArray(startup.products) ? (startup.products as string[]) : [];
  const investorList = Array.isArray(startup.investorsDisclosed) ? (startup.investorsDisclosed as string[]) : [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Startups', href: '/startups' },
    { label: startup.name, current: true },
  ];

  // Structured Data (Schema.org Corporation)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    name: startup.name,
    description: startup.description,
    url: startup.websiteUrl,
    foundingDate: `${startup.foundingYear}-01-01`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: startup.hqCity,
      addressCountry: 'SA',
    },
    knowsAbout: techList,
  };

  const facts: { term: string; value: React.ReactNode; mono?: boolean }[] = [
    { term: 'Founded', value: startup.foundingYear, mono: true },
    { term: 'Headquarters', value: `${startup.hqCity}, Saudi Arabia` },
    { term: 'Stage', value: stageLabel(startup.stage), mono: true },
    { term: 'Business model', value: businessModelLabel(startup.businessModel) },
    ...(startup.category ? [{ term: 'Sector', value: startup.category.name }] : []),
    {
      term: 'Commercial registration',
      value: startup.crNumber ? (
        <>
          {startup.crNumber}
          {startup.crVerified && <span className="ml-2 text-moss">✓ confirmed</span>}
        </>
      ) : (
        <span className="text-ink-3">Not yet on file</span>
      ),
      mono: true,
    },
    {
      term: 'Website',
      value: (
        <a
          href={startup.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-ink break-all"
        >
          <span className="link-rule">{hostOf(startup.websiteUrl)}</span>
          <span aria-hidden className="text-ink-3 group-hover:text-clay transition-colors">↗</span>
        </a>
      ),
    },
    { term: 'Last checked', value: longDate(startup.verifiedAt), mono: true },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteHeader />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main id="main" className="flex-1">
        <MainContainer className="pt-8 md:pt-10 pb-24">
          <Breadcrumbs items={breadcrumbs} />

          {/* Masthead */}
          <header className="mt-10 md:mt-12 max-w-4xl">
            {startup.category ? (
              <CategoryBadge category={startup.category} className="mb-3" />
            ) : (
              <p className="kicker mb-3">Company profile</p>
            )}
            <div className="flex items-center gap-5">
              {startup.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={startup.logoUrl}
                  alt={`${startup.name} logo`}
                  width={72}
                  height={72}
                  className="h-14 w-14 md:h-[4.5rem] md:w-[4.5rem] object-contain bg-paper-sheet border border-rule shrink-0"
                />
              )}
              <h1 className="font-serif text-display-lg text-ink">{startup.name}</h1>
            </div>
            <p className="standfirst mt-4 max-w-2xl">{startup.tagline}</p>
          </header>

          <div className="mt-10 md:mt-12 rule-dot-t pt-8 grid gap-12 lg:grid-cols-12 lg:gap-10 items-start">
            {/* Fact sheet — first on mobile, sticky rail on desktop */}
            <aside className="lg:col-span-4 lg:order-2 lg:border-l lg:border-rule lg:pl-10 lg:sticky lg:top-24">
              <h2 className="meta mb-3">Key facts</h2>
              <dl className="border-t border-ink">
                {facts.map((f) => (
                  <div key={f.term} className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
                    <dt className="text-[0.8125rem] text-ink-3">{f.term}</dt>
                    <dd className={f.mono ? 'font-sans tabular text-sm text-ink' : 'text-sm text-ink'}>{f.value}</dd>
                  </div>
                ))}
              </dl>
              <a
                href={startup.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6 w-full"
              >
                Visit {startup.name} <span aria-hidden>↗</span>
              </a>
              <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-3">
                Work at {startup.name} and something here is wrong or out of date?{' '}
                <Link href="/about#listings" className="text-ink underline underline-offset-2 hover:text-clay">
                  Tell us how to correct it
                </Link>
                .
              </p>
            </aside>

            {/* Profile */}
            <article className="lg:col-span-8 lg:order-1 space-y-14">
              <section aria-labelledby="about-company">
                <h2 id="about-company" className="sr-only">
                  About {startup.name}
                </h2>
                <div className="prose-sft max-w-measure whitespace-pre-line">{startup.description}</div>
              </section>

              {productList.length > 0 && (
                <ProfileSection id="products" title="Products">
                  <ul className="border-t border-ink">
                    {productList.map((prod, idx) => (
                      <li key={idx} className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b border-rule py-3">
                        <span className="font-sans tabular text-sm text-ink-4">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="text-[0.9375rem] text-ink">{prod}</span>
                      </li>
                    ))}
                  </ul>
                </ProfileSection>
              )}

              {startup.keyMetrics && (
                <ProfileSection id="metrics" title="Key figures">
                  <ul className="border-t border-ink">
                    <li className="border-b border-rule py-3 text-[0.9375rem] leading-relaxed text-ink">
                      {startup.keyMetrics}
                    </li>
                  </ul>
                  <p className="mt-3 text-[0.8125rem] text-ink-3">
                    As published by the company or in a public filing. We don’t estimate valuations.
                  </p>
                </ProfileSection>
              )}

              {(startup.fundingDisclosed || investorList.length > 0) && (
                <ProfileSection id="funding" title="Funding">
                  <dl className="border-t border-ink">
                    {startup.fundingDisclosed && (
                      <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
                        <dt className="text-[0.8125rem] text-ink-3">Latest disclosed</dt>
                        <dd className="text-[0.9375rem] text-ink">{startup.fundingDisclosed}</dd>
                      </div>
                    )}
                    {investorList.length > 0 && (
                      <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
                        <dt className="text-[0.8125rem] text-ink-3">Disclosed investors</dt>
                        <dd className="text-[0.9375rem] text-ink">
                          {investorList.map((invName, idx) => {
                            const matched = findMatchedInvestor(invName, allInvestors);
                            return (
                              <React.Fragment key={idx}>
                                {matched ? (
                                  <Link
                                    href={`/investor/${matched.slug}`}
                                    className="link-rule text-ink hover:text-clay transition-colors"
                                  >
                                    {invName}
                                  </Link>
                                ) : (
                                  <span>{invName}</span>
                                )}
                                {idx < investorList.length - 1 && <span className="text-ink-4">, </span>}
                              </React.Fragment>
                            );
                          })}
                        </dd>
                      </div>
                    )}
                  </dl>
                </ProfileSection>
              )}

              <ProfileSection id="tech" title="Technology">
                {techList.length > 0 ? (
                  <p className="border-t border-ink border-b border-b-rule py-3 font-sans text-sm leading-relaxed text-ink-2">
                    {techList.join(' · ')}
                  </p>
                ) : (
                  <p className="border-t border-ink border-b border-b-rule py-3 text-[0.9375rem] text-ink-3">
                    The company hasn’t published its stack, and we haven’t confirmed it independently.
                  </p>
                )}
              </ProfileSection>

              <ProfileSection id="sources" title="Sources">
                <dl className="border-t border-ink">
                  <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
                    <dt className="text-[0.8125rem] text-ink-3">Checked against</dt>
                    <dd className="text-[0.9375rem] text-ink">
                      {startup.sourceUrl ? (
                        <a
                          href={startup.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-baseline gap-1.5"
                        >
                          <span className="link-rule">{startup.sourceName || hostOf(startup.sourceUrl)}</span>
                          <span aria-hidden className="text-ink-3 group-hover:text-clay transition-colors">↗</span>
                        </a>
                      ) : (
                        startup.sourceName || 'The company’s own website'
                      )}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
                    <dt className="text-[0.8125rem] text-ink-3">Checked by</dt>
                    <dd className="text-[0.9375rem] text-ink">{startup.verifiedBy || 'Saudi Future Tech editors'}</dd>
                  </div>
                  <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
                    <dt className="text-[0.8125rem] text-ink-3">Date</dt>
                    <dd className="font-sans tabular text-sm text-ink">{longDate(startup.verifiedAt)}</dd>
                  </div>
                </dl>
                <p className="mt-3 max-w-measure text-[0.8125rem] leading-relaxed text-ink-3">
                  Registration and licensing details come from public registers. Customer numbers and other figures are
                  the company’s own unless a source says otherwise.
                </p>
              </ProfileSection>
            </article>
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related" className="mt-20 md:mt-28">
              <div className="rule-dot-t pt-4 mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="kicker mb-2">The register</p>
                  <h2 id="related" className="font-serif text-display-sm md:text-display-md text-ink">
                    {relatedInSector && startup.category ? `More in ${startup.category.name}` : 'More Saudi startups'}
                  </h2>
                </div>
                <Link href="/startups" className="group shrink-0 inline-flex items-center gap-2 text-sm text-ink">
                  <span className="link-rule">Full register</span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
              <ul>
                {related.map((rel) => (
                  <li key={rel.id} className="group border-b border-rule">
                    <Link
                      href={`/startup/${rel.slug}`}
                      className="grid gap-x-6 gap-y-1 py-5 -mx-3 px-3 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_7.5rem_6.5rem] md:items-baseline transition-colors hover:bg-paper-sheet/60"
                    >
                      <span className="font-serif font-bold text-[1.3125rem] leading-snug text-ink headline-link">{rel.name}</span>
                      <span className="text-[0.9375rem] leading-snug text-ink-2">{rel.tagline}</span>
                      <span className="meta md:hidden">
                        {rel.hqCity} · <span className="text-ink">{stageLabel(rel.stage)}</span>
                      </span>
                      <span className="hidden md:block text-sm text-ink-3">{rel.hqCity}</span>
                      <span className="hidden md:block font-sans text-sm text-ink text-right whitespace-nowrap">
                        {stageLabel(rel.stage)}
                      </span>
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

function ProfileSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`section-${id}`}>
      <h2 id={`section-${id}`} className="font-serif text-display-sm text-ink mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
