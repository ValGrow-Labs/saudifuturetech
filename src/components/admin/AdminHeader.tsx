'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { AuthenticatedUser } from '@/lib/auth/guard';

interface AdminHeaderProps {
  user?: AuthenticatedUser | null;
  breadcrumbs?: BreadcrumbItem[];
  onToggleMobileSidebar?: () => void;
}

const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: 'Super admin', EDITOR: 'Editor', AUTHOR: 'Author' };

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  breadcrumbs = [{ label: 'Admin', href: '/admin' }],
  onToggleMobileSidebar,
}) => (
  <header className="sticky top-0 z-header bg-paper/95 backdrop-blur-[6px] border-b border-rule">
    <div className="h-14 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden h-9 w-9 -ml-2 inline-flex flex-col items-center justify-center gap-[5px]"
            aria-label="Open menu"
          >
            <span className="block h-px w-5 bg-ink" />
            <span className="block h-px w-5 bg-ink" />
          </button>
        )}
        <div className="truncate">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline text-[0.8125rem] text-ink-3 hover:text-ink transition-colors"
        >
          View site ↗
        </Link>
        {user && (
          <div className="flex items-center gap-2.5 pl-5 border-l border-rule">
            <span
              className="h-7 w-7 rounded-sm bg-ink text-paper-sheet font-serif text-sm flex items-center justify-center"
              aria-hidden
            >
              {user.name?.charAt(0).toUpperCase() ?? '·'}
            </span>
            <span className="hidden sm:block leading-tight">
              <span className="block text-[0.8125rem] text-ink truncate max-w-[12rem]">{user.name}</span>
              <span className="block font-sans text-[0.6875rem] text-ink-3">{ROLE_LABEL[user.role] ?? user.role}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  </header>
);
