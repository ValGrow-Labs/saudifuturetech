import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  getOpportunityBySlug,
  getAllOpportunitySlugs,
  getRelatedOpportunities,
} from '@/lib/founder-intelligence';
import { cn } from '@/lib/utils';
import { deadlineInfo, opportunityTypeLabel } from '@/lib/labels';
import { OpportunityCategory } from '@prisma/client';
import { getCanonicalUrl, DEFAULT_SEO, DEFAULT_OG_IMAGE } from '@/lib/seo/config';
import { BreadcrumbJsonLd } from '@/lib/seo/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllOpportunitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug, false);

  if (!opp) {
    return {
      title: 'Programme not found | Saudi Future Tech',
    };
  }

  const categoryLabel = opportunityTypeLabel(opp.category);
  const canonical = getCanonicalUrl(`/opportunity/${opp.slug}`);

  return {
    title: `${opp.title} — ${categoryLabel}`,
    description: opp.description.slice(0, 160),
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${opp.title} — ${opp.organization}`,
      description: opp.description.slice(0, 160),
      url: canonical,
      siteName: DEFAULT_SEO.siteName,
      type: 'article',
      locale: 'en_US',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${opp.title} | Saudi Future Tech`,
      description: opp.description.slice(0, 160),
      images: ['/og-image.png'],
    },
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug, false);

  if (!opp) {
    notFound();
  }

  const related = await getRelatedOpportunities(opp.categoryId, opp.id, 3);
  const criteriaList = Array.isArray(opp.eligibilityCriteria) ? (opp.eligibilityCriteria as string[]) : [];
  const benefitsList = Array.isArray(opp.benefits) ? (opp.benefits as string[]) : [];
  const requirementsList = Array.isArray(opp.requirements) ? (opp.requirements as string[]) : [];

  const typeLabel = opportunityTypeLabel(opp.category);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Opportunities', href: '/opportunities' },
    { label: opp.title, current: true },
  ];

  const d = deadlineInfo(opp.deadline, opp.effectiveStatus);
  const isExpired = opp.isExpired || d.closed;

  // Plain description of each programme type (label doubles as serviceType in JSON-LD).
  const getProgramTypeDetails = (cat: OpportunityCategory) => {
    switch (cat) {
      case OpportunityCategory.GRANT:
        return { label: 'Grant', desc: 'Money you don’t pay back and that takes no equity.' };
      case OpportunityCategory.ACCELERATOR:
        return { label: 'Accelerator', desc: 'A fixed-length cohort with mentoring and, often, investment.' };
      case OpportunityCategory.INCUBATOR:
        return { label: 'Incubator', desc: 'Workspace, lab access and coaching for early teams.' };
      case OpportunityCategory.SUBSIDY:
        return { label: 'Subsidy', desc: 'Co-funding or vouchers towards services such as IP, legal or engineering work.' };
      case OpportunityCategory.GOVERNMENT_PROGRAM:
        return { label: 'Government programme', desc: 'A regulatory or government scheme, such as a sandbox.' };
      case OpportunityCategory.SUBSIDIZED_PERK:
        return { label: 'Credits and perks', desc: 'Compute, cloud or software credits rather than cash.' };
      case OpportunityCategory.HACKATHON:
        return { label: 'Hackathon', desc: 'A competition with prizes for working prototypes.' };
      default:
        return { label: 'Programme', desc: '' };
    }
  };

  const programType = getProgramTypeDetails(opp.category);

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: opp.title,
    serviceType: programType.label,
    provider: {
      '@type': 'GovernmentOrganization',
      name: opp.organization,
    },
    description: opp.description,
    url: opp.applicationUrl,
    termsOfService: opp.equityTaken || '0% Non-Dilutive',
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
            <h1 className="font-serif text-display-lg text-ink">{opp.title}</h1>
            <p className="mt-4 max-w-2xl font-serif text-[1.25rem] leading-relaxed text-ink-3">
              {opp.eligibilitySummary || opp.description}
            </p>
            <p className="meta mt-5">
              Run by {opp.organization}
              {opp.categoryRel && <> · {opp.categoryRel.name}</>}
            </p>
          </header>

          <div className="mt-10 grid gap-12 rule-dot-t pt-8 lg:grid-cols-12 lg:gap-10">
            {/* Key facts */}
            <aside className="lg:col-span-4 lg:order-last lg:border-l lg:border-rule lg:pl-10">
              <div className="lg:sticky lg:top-24">
                <h2 className="meta mb-3">Key facts</h2>
                <dl className="text-sm">
                  <Fact label="Deadline">
                    <span className="font-sans tabular text-ink">{d.date}</span>
                    <span className={cn('block font-sans text-[0.75rem] mt-0.5', d.urgent ? 'text-alert' : 'text-ink-3')}>
                      {d.urgent && (
                        <span className="live-dot inline-block w-1.5 h-1.5 rounded-full bg-clay mr-1.5 align-middle" />
                      )}
                      {d.note}
                    </span>
                  </Fact>
                  <Fact label="Value">{opp.fundingAmount || '—'}</Fact>
                  <Fact label="Equity">{opp.equityTaken || '—'}</Fact>
                  <Fact label="Type">{typeLabel}</Fact>
                  <Fact label="Location">{opp.location || '—'}</Fact>
                  <Fact label="Source">
                    {opp.sourceUrl ? (
                      <a href={opp.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-rule text-ink">
                        {opp.sourceName} ↗
                      </a>
                    ) : (
                      opp.sourceName
                    )}
                  </Fact>
                  <Fact label="Last checked">
                    <span className="font-sans tabular">{gbDate(opp.verifiedAt)}</span>
                    {opp.verifiedBy && (
                      <span className="block text-ink-3 text-[0.8125rem] mt-0.5">by {opp.verifiedBy}</span>
                    )}
                  </Fact>
                </dl>

                <a
                  href={opp.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn('mt-6 w-full', isExpired ? 'btn-quiet justify-center' : 'btn-primary')}
                >
                  {isExpired ? 'Visit the programme site' : 'Apply on the official site'} <span aria-hidden>↗</span>
                </a>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">
                  The link goes straight to {opp.organization}. We don’t take a fee or collect your details.
                </p>
              </div>
            </aside>

            {/* Body */}
            <article className="lg:col-span-8 space-y-12">
              {isExpired && (
                <p className="border-l-2 border-clay pl-4 text-[0.9375rem] leading-relaxed text-ink-2">
                  <span className="text-ink">Applications for this round have closed.</span> We keep the listing for
                  reference. Check the programme’s own site for the next round.
                </p>
              )}

              <section>
                <h2 className="font-serif text-display-sm text-ink">About the programme</h2>
                {programType.desc && (
                  <p className="meta mt-2">
                    {programType.label}: {programType.desc}
                  </p>
                )}
                <p className="mt-4 max-w-measure text-[1.0625rem] leading-relaxed text-ink-2 whitespace-pre-line">
                  {opp.description}
                </p>
              </section>

              {benefitsList.length > 0 && (
                <section>
                  <ListHeading title="What you get" count={benefitsList.length} />
                  <NumberedList items={benefitsList} />
                </section>
              )}

              {criteriaList.length > 0 && (
                <section>
                  <ListHeading title="Who can apply" count={criteriaList.length} />
                  <NumberedList items={criteriaList} />
                </section>
              )}

              {requirementsList.length > 0 && (
                <section>
                  <ListHeading title="What to prepare" count={requirementsList.length} />
                  <NumberedList items={requirementsList} />
                </section>
              )}
            </article>
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related" className="mt-20 md:mt-28">
              <div className="rule-dot-t pt-4 mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 id="related" className="font-serif text-display-sm text-ink">
                  More in {opp.categoryRel?.name || 'this section'}
                </h2>
                <Link href="/opportunities" className="group shrink-0 inline-flex items-center gap-2 text-sm text-ink">
                  <span className="link-rule">All opportunities</span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
              <ul>
                {related.map((rel) => {
                  const rd = deadlineInfo(rel.deadline, rel.effectiveStatus);
                  return (
                    <li key={rel.id} className="border-b border-rule">
                      <Link
                        href={`/opportunity/${rel.slug}`}
                        className="group grid gap-x-6 gap-y-1 py-4 md:grid-cols-[8.5rem_minmax(0,1fr)_14rem] md:items-baseline -mx-3 px-3 transition-colors hover:bg-paper-sheet/60"
                      >
                        <span className={cn('font-sans tabular text-sm', rd.urgent ? 'text-alert' : 'text-ink-3')}>
                          {rd.date}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-serif font-bold text-[1.125rem] leading-snug text-ink headline-link">
                            {rel.title}
                          </span>
                          <span className="block text-sm text-ink-3 mt-0.5">{rel.organization}</span>
                        </span>
                        <span className="text-sm text-ink-2 leading-snug">{rel.fundingAmount || '—'}</span>
                      </Link>
                    </li>
                  );
                })}
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

function ListHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-3">
      <h2 className="font-serif text-display-sm text-ink">{title}</h2>
      <span className="meta">
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="border-t border-ink">
      {items.map((t, i) => (
        <li
          key={i}
          className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-rule py-3 text-[0.9375rem] leading-relaxed text-ink-2"
        >
          <span className="font-sans tabular text-[0.75rem] text-ink-4 pt-1">{String(i + 1).padStart(2, '0')}</span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
  );
}
