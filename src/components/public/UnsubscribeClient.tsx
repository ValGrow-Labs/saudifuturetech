'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { MailX, CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { unsubscribeNewsletterAction } from '@/actions/newsletter';
import { Button } from '@/components/ui/Button';

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
      <div className="p-8 bg-editorial-pure rounded-none border border-editorial-hairline text-center space-y-4 max-w-md mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-full bg-editorial-sand border border-editorial-hairline flex items-center justify-center text-ink-muted mx-auto">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold font-serif text-ink-high">Missing Unsubscribe Link</h2>
        <p className="text-xs text-ink-muted leading-relaxed font-sans">
          This unsubscription page requires a secure personal token from the footer of your Saudi Future Tech email dispatch.
        </p>
        <Link href="/" className="inline-block pt-2">
          <Button variant="secondary" size="sm" className="text-xs font-sans uppercase">
            Return to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="p-8 bg-editorial-pure rounded-none border border-emerald-500/40 text-center space-y-4 max-w-md mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-serif text-ink-high">Unsubscribed Successfully</h2>
        <p className="text-xs text-ink-muted leading-relaxed font-sans">
          {result.email ? (
            <>
              <strong className="text-ink-high font-semibold">{result.email}</strong> has been removed from all future Saudi Future Tech email briefings.
            </>
          ) : (
            'You have been successfully removed from our subscriber list.'
          )}
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="secondary" size="sm" className="text-xs font-sans uppercase flex items-center gap-1.5 mx-auto">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Publication</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-editorial-pure rounded-none border border-editorial-hairline text-center space-y-5 max-w-md mx-auto shadow-sm">
      <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
        <MailX className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold font-serif text-ink-high">Confirm Unsubscription</h2>
        <p className="text-xs text-ink-muted leading-relaxed font-sans">
          Are you sure you want to stop receiving the Saudi Future Tech Executive Briefing? You will miss our weekly analysis on foundation models, giga-projects, and venture deals.
        </p>
      </div>

      {result?.error && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-none text-xs text-rose-800">
          {result.error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full text-xs font-sans uppercase">
            Keep My Subscription
          </Button>
        </Link>
        <Button
          variant="primary"
          size="sm"
          disabled={isPending}
          onClick={handleConfirmUnsubscribe}
          className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-sans uppercase flex items-center justify-center gap-1.5"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Unsubscribing...</span>
            </>
          ) : (
            <span>Confirm Unsubscribe</span>
          )}
        </Button>
      </div>
    </div>
  );
}

