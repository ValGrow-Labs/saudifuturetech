'use client';

import React, { useState, useTransition } from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerScheduledPublisherAction } from '@/actions/scheduler';
import { useRouter } from 'next/navigation';

interface TriggerSchedulerButtonProps {
  className?: string;
  variant?: 'outline' | 'ghost' | 'solid';
  size?: 'sm' | 'md';
}

export function TriggerSchedulerButton({
  className = '',
  variant = 'outline',
  size = 'sm',
}: TriggerSchedulerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleTrigger = () => {
    setFeedback(null);
    setIsError(false);

    startTransition(async () => {
      const res = await triggerScheduledPublisherAction();
      if (res.error) {
        setIsError(true);
        setFeedback(res.error);
      } else if (res.result) {
        setIsError(false);
        if (res.result.published > 0) {
          setFeedback(`Published ${res.result.published} scheduled story${res.result.published > 1 ? 'ies' : ''}`);
        } else {
          setFeedback('Checked: No scheduled stories are currently due');
        }
        router.refresh();
      }

      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    });
  };

  const baseStyles = 'inline-flex items-center gap-2 rounded-none font-sans uppercase tracking-wider text-xs font-bold transition-editorial cursor-pointer';
  const sizeStyles = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs';
  const variantStyles =
    variant === 'solid'
      ? 'bg-ink-high text-white hover:bg-black shadow-xs'
      : variant === 'ghost'
      ? 'text-ink-body hover:text-ink-high hover:bg-editorial-sand border border-transparent'
      : 'bg-editorial-pure text-ink-high hover:bg-editorial-sand border border-editorial-hairline hover:border-ink-high shadow-xs';

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleTrigger}
        disabled={isPending}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className} ${
          isPending ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        title="Check and immediately publish any scheduled stories whose target time has arrived"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-high" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-ink-high" />
        )}
        <span>{isPending ? 'Checking Pipeline...' : 'Run Scheduler Now'}</span>
      </button>

      {feedback && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-sans whitespace-nowrap shadow-md border ${
            isError
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-editorial-pure text-ink-high border-editorial-hairline'
          }`}
        >
          {isError ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          )}
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}

