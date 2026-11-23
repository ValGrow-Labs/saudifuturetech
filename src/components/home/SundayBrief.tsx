import React from 'react';
import { NewsletterForm } from '@/components/public/NewsletterForm';

/** Newsletter sign-up as an editorial note on a slightly deeper paper band — not a "CTA box". */
export function SundayBrief() {
  return (
    <section id="newsletter" aria-labelledby="sunday-brief" className="bg-paper-band border-y border-rule">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-10 py-16 md:py-20 grid gap-10 lg:grid-cols-12 items-end">
        <div className="lg:col-span-7">
          <p className="kicker mb-3">Newsletter · Sundays, 7am Riyadh</p>
          <h2 id="sunday-brief" className="font-serif text-display-lg text-ink">
            The week in Saudi tech, <em className="italic">in one email.</em>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2">
            What changed, which grants close in the next fortnight, who raised and from whom. Written by our desk for
            founders, operators and investors. Free.
          </p>
        </div>
        <div className="lg:col-span-5">
          <NewsletterForm variant="banner" />
        </div>
      </div>
    </section>
  );
}
