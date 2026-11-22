'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { subscribeNewsletterAction, NewsletterSubscriptionState } from '@/actions/newsletter';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  /** banner/standalone sit on paper; footer sits on the dark ink footer. */
  variant?: 'banner' | 'footer' | 'standalone';
  className?: string;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({ variant = 'banner', className }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<NewsletterSubscriptionState | null>(null);
  const [isPending, startTransition] = useTransition();
  const dark = variant === 'footer';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('consent', String(consent));

    startTransition(async () => {
      try {
        const result = await subscribeNewsletterAction(undefined, formData);
        setState(result);
        if (result.success) {
          setEmail('');
          setConsent(false);
        }
      } catch {
        setState({ error: 'We couldn’t reach the server. Check your connection and try again.' });
      }
    });
  };

  if (state?.success) {
    return (
      <div
        role="status"
        className={cn(
          'border-l-2 border-moss pl-4 py-1 space-y-2',
          dark ? 'text-paper-band' : 'text-ink-2',
          className
        )}
      >
        <p className={cn('font-serif text-xl', dark ? 'text-paper-sheet' : 'text-ink')}>You’re on the list.</p>
        <p className="text-sm leading-relaxed">{state.message}</p>
        <button
          type="button"
          onClick={() => setState(null)}
          className={cn('text-sm link-rule', dark ? 'text-paper-sheet' : 'text-ink')}
        >
          Add another address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false} className={cn('w-full space-y-3', className)}>
      <div
        className={cn(
          'flex items-stretch border-b-2 transition-colors',
          dark ? 'border-paper-sheet/70 focus-within:border-clay' : 'border-ink focus-within:border-clay',
          variant === 'footer' ? 'flex-col sm:flex-row gap-2 sm:gap-0' : 'flex-row'
        )}
      >
        <label htmlFor={`nl-email-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-email-${variant}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.sa"
          disabled={isPending}
          aria-invalid={Boolean(state?.error)}
          aria-describedby={state?.error ? `nl-error-${variant}` : undefined}
          className={cn(
            'flex-1 min-w-0 bg-transparent py-3 text-base focus:outline-none',
            dark ? 'text-paper-sheet placeholder:text-paper-sheet/40' : 'text-ink'
          )}
        />
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'shrink-0 inline-flex items-center gap-2 py-3 pl-4 text-sm font-medium transition-colors disabled:opacity-50',
            dark ? 'text-paper-sheet hover:text-clay-tint' : 'text-ink hover:text-clay'
          )}
        >
          {isPending ? 'Subscribing…' : 'Subscribe'}
          <span aria-hidden>→</span>
        </button>
      </div>

      {state?.error && (
        <p id={`nl-error-${variant}`} role="alert" className={cn('text-sm', dark ? 'text-clay-tint' : 'text-clay')}>
          {state.error}
        </p>
      )}

      <label
        className={cn(
          'flex items-start gap-2.5 text-[0.8125rem] leading-snug cursor-pointer select-none',
          dark ? 'text-paper-sheet/60' : 'text-ink-3'
        )}
      >
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={isPending}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#A63D24]"
        />
        <span>
          Send me the Sunday Brief. I accept the{' '}
          <Link href="/privacy" className={cn('underline underline-offset-2', dark ? 'hover:text-paper-sheet' : 'hover:text-ink')}>
            privacy policy
          </Link>{' '}
          and can unsubscribe at any time.
        </span>
      </label>
    </form>
  );
};

export default NewsletterForm;
