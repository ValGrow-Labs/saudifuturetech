import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DevNoticeBanner: React.FC = () => {
  return (
    <div className="bg-brand-dark border-b border-sft px-4 py-2 text-xs text-brand-cloud">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-brand-yellow shrink-0" />
          <span className="font-bold font-heading text-brand-yellow uppercase tracking-wider text-[11px]">
            CMS Prototype Shell:
          </span>
          <span className="text-sft-text-muted font-sans hidden sm:inline text-xs">
            Structural layout & design verification. Live authentication, database operations, and publishing logic will be integrated in Phase 4 & Phase 5.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-surface text-brand-yellow px-2 py-0.5 rounded-sm border border-sft font-heading shrink-0">
          Dev Preview
        </span>
      </div>
    </div>
  );
};
