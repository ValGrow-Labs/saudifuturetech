import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Section = { id: string; name: string; slug: string; description: string };

// One photograph per desk, drawn from the desk's own reporting.
const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=75`;
const SECTION_IMAGES: Record<string, string> = {
  'ai-deep-tech': U('photo-1451187580459-43490279c0fa'),
  govtech: U('photo-1517245386807-bb43f82c33c4'),
  cybersecurity: U('photo-1563986768609-322da13575f3'),
  'smart-cities-infra': U('photo-1486406146926-c627a92ad1ab'),
  fintech: U('photo-1559526324-4b87b5e36e44'),
  'clean-energy': U('photo-1508514177221-188b1cf16e9d'),
};

/** The six desks: a photograph, the desk name and what it covers. */
export function SectionIndex({ sections }: { sections: Section[] }) {
  return (
    <section aria-labelledby="sections-index">
      <div className="border-t-2 border-ink pt-4 mb-2">
        <p className="kicker mb-2">What we cover</p>
        <h2 id="sections-index" className="font-serif text-display-md text-ink">
          Six desks
        </h2>
      </div>
      <ol className="grid md:grid-cols-2 md:gap-x-12">
        {sections.slice(0, 6).map((s, i) => {
          const img = SECTION_IMAGES[s.slug];
          return (
            <li key={s.id} className="border-b border-rule">
              <Link
                href={`/category/${s.slug}`}
                className="group grid grid-cols-[6.5rem_1fr] sm:grid-cols-[9rem_1fr_auto] gap-5 sm:gap-6 items-center py-6"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-paper-band">
                  {img && (
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="144px"
                      className="object-cover img-warm transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.8125rem] text-ink-4 tabular">{String(i + 1).padStart(2, '0')}</span>
                  <span className="block mt-0.5 font-serif text-[1.625rem] leading-tight text-ink headline-link">
                    {s.name}
                  </span>
                  <span className="block mt-1.5 text-[0.9375rem] leading-relaxed text-ink-3">{s.description}</span>
                </span>
                <span
                  aria-hidden
                  className="hidden sm:block text-ink-4 transition-all duration-300 group-hover:text-clay group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
