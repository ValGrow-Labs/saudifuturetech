import React from 'react';
import { NewsletterForm } from './NewsletterForm';

/** In-page newsletter block for inner pages: a ruled note, not a coloured box. */
export const NewsletterBanner: React.FC<{ className?: string }> = ({ className }) => (
  <section
    id="newsletter"
    aria-labelledby="newsletter-banner"
    className={`border-t-2 border-ink pt-6 grid gap-8 md:grid-cols-12 md:items-end ${className ?? ''}`}
  >
    <div className="md:col-span-7">
      <p className="kicker mb-2">The Sunday Brief</p>
      <h2 id="newsletter-banner" className="font-serif text-display-sm md:text-display-md text-ink">
        The week in Saudi tech, <em className="italic">in one email.</em>
      </h2>
      <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-ink-3">
        What changed, which grants close in the next fortnight, and who raised. Sundays, 7am Riyadh. Free.
      </p>
    </div>
    <div className="md:col-span-5">
      <NewsletterForm variant="banner" />
    </div>
  </section>
);

export default NewsletterBanner;
