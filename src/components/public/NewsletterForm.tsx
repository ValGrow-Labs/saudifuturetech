'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { subscribeNewsletterAction, NewsletterSubscriptionState } from '@/actions/newsletter';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  variant?: 'banner' | 'footer' | 'standalone';
  className?: string;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  variant = 'banner',
  className,
}) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<NewsletterSubscriptionState | null>(null);
  const [isPending, startTransition] = useTransition();

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
        setState({ error: 'Failed to process subscription request. Please try again.' });
      }
    });
  };

  if (state?.success) {
    return (
      <div
        className={cn(
          'p-4 bg-editorial-pure border border-emerald-600/40 rounded-xs text-xs text-ink-high text-left space-y-2',
          variant === 'footer' ? 'max-w-full' : 'max-w-md mx-auto',
          className
        )}
      >
        <div className="flex items-center gap-2 text-emerald-700 font-bold font-sans uppercase tracking-wider text-[11px]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Subscription Active</span>
        </div>
        <p className="text-ink-body font-sans leading-relaxed">{state.message}</p>
        <button
          type="button"
          onClick={() => setState(null)}
          className="text-[11px] font-bold text-ink-high underline font-sans uppercase tracking-wide hover:text-brand-gold cursor-pointer"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', variant === 'footer' ? 'w-full' : 'max-w-md mx-auto', className)}>
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-xs text-xs text-red-800 flex items-start gap-2 text-left">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="font-sans leading-relaxed text-red-700">{state.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        <div className={cn('flex gap-2', variant === 'footer' ? 'flex-col' : 'flex-col sm:flex-row')}>
          <div className="relative flex-1 min-w-0">
            <Mail className={cn("w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2", variant === 'footer' ? 'text-slate-400' : 'text-ink-muted')} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter corporate email address"
              disabled={isPending}
              className={cn(
                "w-full rounded-md pl-9 pr-3 py-2 text-xs sm:text-sm font-sans transition-all focus:outline-none",
                variant === 'footer'
                  ? "bg-[#132B3C] border border-[#1E3E52] text-white placeholder-slate-400 focus:border-[#0B6E4F] focus:ring-1 focus:ring-[#0B6E4F]"
                  : "bg-editorial-pure border border-editorial-hairline text-ink-high placeholder-ink-muted focus:border-ink-high"
              )}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "px-5 py-2 font-bold text-xs rounded-md active:translate-y-px transition-all font-sans uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60",
              variant === 'footer'
                ? "w-full bg-[#0B6E4F] text-white hover:bg-[#08533C]"
                : "shrink-0 bg-brand-yellow text-ink-high hover:bg-brand-yellow-hover"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className={cn("w-3.5 h-3.5 animate-spin", variant === 'footer' ? 'text-white' : 'text-ink-high')} />
                <span>Joining...</span>
              </>
            ) : (
              <span>Subscribe Free</span>
            )}
          </button>
        </div>

        {/* Explicit Consent Checkbox */}
        <label className={cn("flex items-start gap-2 text-[11px] font-sans cursor-pointer select-none", variant === 'footer' ? 'text-slate-400' : 'text-ink-muted')}>
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            disabled={isPending}
            className={cn(
              "mt-0.5 rounded-xs shrink-0",
              variant === 'footer'
                ? "border-[#1E3E52] bg-[#132B3C] text-[#0B6E4F] focus:ring-0"
                : "border-editorial-hairline bg-editorial-pure text-brand-yellow focus:ring-0"
            )}
          />
          <span className="leading-tight">
            I agree to receive the Saudi Future Tech executive intelligence briefing and accept the{' '}
            <Link href="/privacy" className={cn("underline", variant === 'footer' ? 'text-slate-300 hover:text-white' : 'hover:text-ink-high')}>
              Privacy Policy
            </Link>
            . Unsubscribe at any time.
          </span>
        </label>
      </form>
    </div>
  );
};
