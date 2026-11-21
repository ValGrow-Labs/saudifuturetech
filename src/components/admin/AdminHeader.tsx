'use client';

import React from 'react';
import { Menu, User, ShieldCheck } from 'lucide-react';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { AuthenticatedUser } from '@/lib/auth/guard';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  user?: AuthenticatedUser | null;
  breadcrumbs?: BreadcrumbItem[];
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  breadcrumbs = [{ label: 'Admin', href: '/admin' }],
  onToggleMobileSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-editorial-paper/95 backdrop-blur-md border-b border-editorial-hairline px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-1.5 rounded-none text-ink-body hover:text-ink-high hover:bg-editorial-sand transition-editorial border border-editorial-hairline shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="truncate">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>

        {/* Right: Security & Admin User Capsule */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-editorial-pure border border-editorial-hairline text-[11px] font-sans text-ink-muted shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-ink-high" />
            <span>Encrypted Session</span>
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2 pl-2 border-l border-editorial-hairline">
            <div className="w-7 h-7 rounded-none bg-editorial-sand border border-editorial-hairline flex items-center justify-center text-ink-high shrink-0 font-bold font-serif text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-ink-high block font-serif leading-tight truncate max-w-[140px] sm:max-w-[200px]">
                {user?.name || 'Authorized Staff'}
              </span>
              <span
                className={cn(
                  'text-[10px] block font-sans font-medium tracking-wide uppercase',
                  user?.role === 'SUPER_ADMIN'
                    ? 'text-amber-800 font-semibold'
                    : user?.role === 'EDITOR'
                    ? 'text-sky-800'
                    : 'text-emerald-800'
                )}
              >
                {user?.role ? user.role.replace('_', ' ') : 'Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
