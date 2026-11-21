'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Mail, AlertTriangle, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SITE_NAME } from '@/lib/constants';
import { loginAction } from '@/actions/auth';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleQuickFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMessage(null);
  };

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
        setErrorMessage('Authentication request failed. Please check network and retry.');
      }
    });
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-none bg-ink-high text-white font-black text-2xl font-serif shadow-xs mb-2">
          S
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink-high tracking-tight font-serif">
          {SITE_NAME}
        </h1>
        <p className="text-xs uppercase tracking-widest text-ink-muted font-sans font-bold">
          Editorial Backstage Console
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-editorial-pure border border-editorial-hairline rounded-none p-3.5 text-xs text-ink-body space-y-1 shadow-xs">
        <div className="flex items-center gap-2 font-bold font-sans text-ink-high">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="uppercase tracking-wider text-[11px]">Protected Editorial Portal</span>
        </div>
        <p className="text-ink-muted font-sans leading-relaxed">
          Authorized editorial access only. Sessions are encrypted, role-managed, and brute-force protected.
        </p>
      </div>

      {/* Login Box */}
      <div className="bg-editorial-pure rounded-none border border-editorial-hairline p-6 sm:p-8 shadow-xs space-y-6">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-none text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold font-sans uppercase tracking-wide text-[11px] block">
                Authentication Error
              </span>
              <p className="font-sans leading-relaxed text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest text-ink-muted font-sans"
            >
              Editorial Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@saudifuturetech.com"
                className="w-full bg-editorial-sand/40 border border-editorial-hairline rounded-none pl-9 pr-3 py-2.5 text-xs sm:text-sm text-ink-high placeholder-ink-muted/60 focus:outline-none focus:border-ink-high transition-editorial font-sans"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-ink-muted font-sans"
              >
                Password
              </label>
              <span className="text-[10px] text-ink-muted font-sans uppercase tracking-wide">
                Encrypted via Bcrypt
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-editorial-sand/40 border border-editorial-hairline rounded-none pl-9 pr-3 py-2.5 text-xs sm:text-sm text-ink-high placeholder-ink-muted/60 focus:outline-none focus:border-ink-high transition-editorial font-sans"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending}
            className="w-full font-sans uppercase tracking-wider text-xs flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-ink-high" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Sign In to Editorial Console</span>
            )}
          </Button>
        </form>

        {/* Quick Testing Helper */}
        <div className="pt-4 border-t border-editorial-hairline space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-sans font-bold text-ink-muted uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-ink-high" />
            <span>Pre-Configured Seed Profiles:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@saudifuturetech.com', 'AdminPassword2026!')}
              className="px-2.5 py-1.5 rounded-none bg-editorial-sand hover:bg-editorial-stone border border-editorial-hairline text-left transition-editorial"
            >
              <span className="font-bold text-ink-high block font-serif">Super Admin</span>
              <span className="text-[10px] text-ink-muted font-mono truncate block">admin@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('editor@saudifuturetech.com', 'EditorPassword2026!')}
              className="px-2.5 py-1.5 rounded-none bg-editorial-sand hover:bg-editorial-stone border border-editorial-hairline text-left transition-editorial"
            >
              <span className="font-bold text-ink-high block font-serif">Editor</span>
              <span className="text-[10px] text-ink-muted font-mono truncate block">editor@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('author@saudifuturetech.com', 'AuthorPassword2026!')}
              className="px-2.5 py-1.5 rounded-none bg-editorial-sand hover:bg-editorial-stone border border-editorial-hairline text-left transition-editorial"
            >
              <span className="font-bold text-ink-high block font-serif">Author</span>
              <span className="text-[10px] text-ink-muted font-mono truncate block">author@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('inactive@saudifuturetech.com', 'InactivePassword2026!')}
              className="px-2.5 py-1.5 rounded-none bg-editorial-sand hover:bg-editorial-stone border border-editorial-hairline text-left transition-editorial"
            >
              <span className="font-bold text-ink-high block font-serif">Deactivated</span>
              <span className="text-[10px] text-rose-600 font-mono truncate block">inactive@...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <p className="text-center text-[11px] text-ink-muted font-sans">
        Saudi Future Tech Backstage Editorial Platform &bull; Strictly Confidential
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-editorial-paper flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-brand-yellow/30">
      {/* Back to Public Site */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink-high transition-editorial font-sans uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 text-ink-high" />
          <span>Back to Publication</span>
        </Link>
      </div>

      <Suspense fallback={<div className="text-ink-muted text-xs font-sans">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
