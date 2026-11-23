import React from 'react';

export const DevNoticeBanner: React.FC = () => {
  return (
    <div className="border-b border-rule bg-paper-band px-4 py-2 text-[0.8125rem] text-ink-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <p className="border-l-2 border-clay pl-3">
          <span className="text-ink">Development build.</span>{' '}
          <span className="hidden sm:inline">Some publishing features may not be connected yet.</span>
        </p>
        <span className="font-sans text-[0.6875rem] text-ink-4 shrink-0">Dev preview</span>
      </div>
    </div>
  );
};
