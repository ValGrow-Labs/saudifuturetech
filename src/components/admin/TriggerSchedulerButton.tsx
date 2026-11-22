'use client';

import React, { useState, useTransition } from 'react';
import { triggerScheduledPublisherAction } from '@/actions/scheduler';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

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
          setFeedback(
            `Published ${res.result.published} scheduled ${res.result.published > 1 ? 'articles' : 'article'}.`
          );
        } else {
          setFeedback('Nothing is due yet.');
        }
        router.refresh();
      }

      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    });
  };

  // "solid" maps to the outlined ink style: the page's primary button stays the only filled one.
  const buttonVariant = variant === 'ghost' ? 'ghost' : variant === 'solid' ? 'secondary' : 'outline';

  return (
    <div className="relative inline-flex items-center">
      <Button
        type="button"
        variant={buttonVariant}
        size={size === 'sm' ? 'sm' : 'md'}
        onClick={handleTrigger}
        disabled={isPending}
        className={className}
        title="Publish any scheduled articles whose time has arrived"
      >
        {isPending ? 'Checking…' : 'Run scheduler now'}
      </Button>

      {feedback && (
        <p
          role="status"
          className={`absolute right-0 top-full mt-2 z-30 whitespace-nowrap bg-paper-sheet border border-rule shadow-lift px-3 py-1.5 text-[0.8125rem] text-ink-2 border-l-2 ${
            isError ? 'border-l-clay' : 'border-l-moss'
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
