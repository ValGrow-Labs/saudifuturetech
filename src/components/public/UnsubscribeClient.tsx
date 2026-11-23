'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { unsubscribeNewsletterAction } from '@/actions/newsletter';
import { Button } from '@/components/ui/Button';

function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 text-sm text-ink">
      <span className="link-rule">{children}</span>
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

export function UnsubscribeClient({ token }: { token?: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; email?: string; error?: string } | null>(null);

  const handleConfirmUnsubscribe = () => {
    if (!token) return;
    startTransition(async () => {
      const res = await unsubscribeNewsletterAction(token);
      setResult(res);
    });
  };

  if (!token) {
    return (
      <div className="max-w-2xl">
        <p className="kicker mb-3">The Sunday Brief</p>
        <h1 className="font-serif text-display-md text-ink">This unsubscribe link is incomplete.</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-3">
          Use the unsubscribe link at the bottom of any Sunday Brief email — it carries a code that identifies your
          address. If that doesn’t work, contact us through the about page and we’ll remove you by hand.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <BackLink href="/about#contact">Contact us</BackLink>
          <BackLink href="/">Go to the front page</BackLink>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="max-w-2xl" role="status">
        <p className="kicker mb-3">The Sunday Brief</p>
        <h1 className="font-serif text-display-md text-ink">You’ve been unsubscribed.</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-3">
          {result.email ? (
            <>
              We won’t send the Sunday Brief to <span className="font-sans text-[0.9375rem] text-ink">{result.email}</span>{' '}
              again.
            </>
          ) : (
            'We won’t send you the Sunday Brief again.'
          )}{' '}
          If you change your mind, you can sign up again at any time.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <BackLink href="/">Go to the front page</BackLink>
          <BackLink href="/newsletter">Sign up again</BackLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="kicker mb-3">The Sunday Brief</p>
      <h1 className="font-serif text-display-md text-ink">Stop receiving the Sunday Brief?</h1>
      <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-3">
        Confirm below and we’ll take your address off the list. You won’t get any more emails from us.
      </p>

      {result?.error && (
        <p role="alert" className="mt-6 border-l-2 border-clay pl-4 py-1 text-[0.9375rem] text-clay">
          {result.error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Button variant="primary" size="lg" disabled={isPending} onClick={handleConfirmUnsubscribe}>
          {isPending ? 'Unsubscribing…' : 'Unsubscribe'}
        </Button>
        <BackLink href="/">Keep my subscription</BackLink>
      </div>
    </div>
  );
}
