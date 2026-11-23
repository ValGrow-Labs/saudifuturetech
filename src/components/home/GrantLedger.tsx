import React from 'react';
import Link from 'next/link';
import type { OpportunityItem } from '@/components/public/OpportunityDirectory';
import { daysUntil, opportunityTypeLabel, shortEquity } from '@/lib/labels';
import { cn } from '@/lib/utils';

/**
 * "Closing soon" — open grants and programmes, nearest deadline first.
 * Set like a newspaper listings column: a calendar-style date, the programme,
 * and the headline sum. No column headers, no data-table chrome.
 */
export function GrantLedger({ opportunities, total }: { opportunities: OpportunityItem[]; total: number }) {
  const rows = [...opportunities]
    .filter((o) => o.status !== 'CLOSED')
    .sort((a, b) => {
      const ta = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const tb = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return ta - tb;
    })
    .slice(0, 6);

  return (
    <section aria-labelledby="grant-ledger" className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <div className="border-t-2 border-ink pt-4 lg:sticky lg:top-24">
          <p className="kicker mb-2">The grant desk</p>
          <h2 id="grant-ledger" className="font-serif text-display-md text-ink">
            Closing soon
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">
            Grants, accelerators and sandboxes open to Saudi founders, checked against the issuing body’s own page.
          </p>
          <Link href="/opportunities" className="group mt-6 inline-flex items-center gap-2 text-sm text-ink">
            <span className="link-rule">All {total} opportunities</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>

      <ol className="lg:col-span-9 border-t-2 border-ink">
        {rows.map((o) => {
          const when = dateParts(o.deadline);
          const left = daysUntil(o.deadline);
          const urgent = left !== null && left >= 0 && left <= 14;
          const value = splitValue(o.fundingAmount);
          return (
            <li key={o.id} className="border-b border-rule">
              <Link
                href={`/opportunity/${o.slug}`}
                className="group grid grid-cols-[4.5rem_1fr] md:grid-cols-[5.5rem_1fr_15rem] gap-x-5 md:gap-x-8 gap-y-3 py-6"
              >
                {/* Calendar date */}
                <div className="row-span-2 md:row-span-1 leading-none">
                  {when ? (
                    <>
                      <span className="block font-serif text-[2.75rem] md:text-[3.25rem] text-ink tabular">{when.day}</span>
                      <span className="block mt-1.5 text-[0.8125rem] text-ink-3">
                        {when.month} {when.year}
                      </span>
                    </>
                  ) : (
                    <span className="block font-serif italic text-xl text-ink-2 pt-2">Rolling</span>
                  )}
                </div>

                {/* Programme */}
                <div className="min-w-0 md:pt-1">
                  <p className="font-serif text-[1.375rem] leading-snug text-ink headline-link">{o.title}</p>
                  <p className="mt-1.5 text-sm text-ink-3">
                    {o.organization} · {opportunityTypeLabel(o.category)}
                  </p>
                  {left !== null && left >= 0 && (
                    <p className={cn('mt-2 font-serif italic text-[0.9375rem]', urgent ? 'text-clay' : 'text-ink-3')}>
                      {left === 0 ? 'Closes today' : left === 1 ? 'Closes tomorrow' : `Closes in ${left} days`}
                    </p>
                  )}
                </div>

                {/* Value */}
                <div className="md:pt-1">
                  <p className="font-serif text-[1.1875rem] text-ink leading-snug">{value.lead}</p>
                  {value.rest && <p className="mt-0.5 text-[0.8125rem] text-ink-3 leading-snug">{value.rest}</p>}
                  <p className="mt-1.5 text-[0.8125rem] text-ink-3">{equityWords(o.equityTaken)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function dateParts(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // Deadlines are Riyadh dates (stored as late-evening UTC), so format in Riyadh time.
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Riyadh',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { day: get('day'), month: get('month'), year: get('year') };
}

/** "Up to SAR 300,000 Value in NVIDIA H100 GPU Clusters" → lead "Up to SAR 300,000", rest "Value in NVIDIA H100 GPU Clusters". */
function splitValue(raw: string | null): { lead: string; rest?: string } {
  if (!raw) return { lead: '—' };
  const m = raw.match(/^((?:up to |co-funding up to )?(?:SAR|USD|\$)\s?[\d,.]+\s?[KMB]?)(.*)$/i);
  if (!m) return { lead: raw };
  const rest = m[2].replace(/^[\s,:–-]+/, '').replace(/^\((.*)\)$/, '$1').trim();
  return { lead: m[1].trim(), rest: rest || undefined };
}

function equityWords(raw: string | null) {
  const e = shortEquity(raw);
  if (e === '—') return '';
  return e === '0%' ? 'No equity taken' : `${e} equity`;
}
