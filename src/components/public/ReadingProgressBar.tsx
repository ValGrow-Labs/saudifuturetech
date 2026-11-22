'use client';

import React, { useEffect, useState } from 'react';

/** A 2px clay line across the top of the viewport that fills as you read. */
export const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const percentage = Math.min(100, Math.max(0, (scrollY / totalHeight) * 100));
        setProgress(percentage);
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full h-[2px] z-overlay pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div className="h-full bg-clay origin-left" style={{ width: `${progress}%` }} />
    </div>
  );
};
