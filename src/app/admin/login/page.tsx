'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { loginAction } from '@/actions/auth';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('callbackUrl', callbackUrl);

    startTransition(async () => {
      try {
        const result = await loginAction(undefined, formData);
        if (result?.error) {
          setErrorMessage(result.error);
        }
      } catch (err: any) {
        // NEXT_REDIRECT errors shouldn't be caught, but if error is thrown
        if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
          return;
        }
        setErrorMessage("We couldn't reach the server. Check your connection and try again.");
      }
    });
  };

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="font-serif text-[1.5rem] text-ink tracking-[-0.02em] whitespace-nowrap hover:text-clay transition-colors"
      >
        Saudi <em className="italic">Future</em> Tech
      </Link>

      <div className="mt-10 border-t-2 border-ink pt-5">
        <h1 className="font-serif text-display-sm text-ink">Sign in</h1>
        <p className="mt-1.5 text-sm text-ink-3">Use your newsroom account to open the CMS.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {errorMessage && (
          <p role="alert" className="border-l-2 border-clay pl-3 text-sm text-ink-2 leading-relaxed">
            {errorMessage}
          </p>
        )}

        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@saudifuturetech.com"
            className="field"
            aria-invalid={errorMessage ? true : undefined}
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            aria-invalid={errorMessage ? true : undefined}
            required
            disabled={isPending}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={isPending} className="w-full">
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-10 pt-4 border-t border-rule text-[0.8125rem] text-ink-3">
        Not an editor?{' '}
        <Link href="/" className="text-ink link-rule">
          Back to the site
        </Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[100dvh] bg-paper flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<p className="text-sm text-ink-3">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
