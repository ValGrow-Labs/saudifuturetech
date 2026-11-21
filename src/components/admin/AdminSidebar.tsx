'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag as TagIcon,
  Users,
  ShieldCheck,
  Mail,
  Send,
  ArrowLeft,
  ExternalLink,
  X,
  LogOut,
  Loader2,
  Sparkles,
  Coins,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';
import { AuthenticatedUser } from '@/lib/auth/guard';
import { logoutAction } from '@/actions/auth';

interface AdminSidebarProps {
  user?: AuthenticatedUser | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isEditor = user?.role === 'EDITOR' || isSuperAdmin;

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, visible: true },
    { label: 'Opportunities', href: '/admin/opportunities', icon: Coins, visible: isEditor },
    { label: 'Startups', href: '/admin/startups', icon: Building2, visible: isEditor },
    { label: 'Investors', href: '/admin/investors', icon: Sparkles, visible: isEditor },
    { label: 'Articles', href: '/admin/articles', icon: FileText, visible: true },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree, visible: isEditor },
    { label: 'Taxonomy Tags', href: '/admin/tags', icon: TagIcon, visible: isEditor },
    { label: 'Authors / Bylines', href: '/admin/authors', icon: Users, visible: isEditor },
    { label: 'Subscribers', href: '/admin/subscribers', icon: Mail, visible: isEditor },
    { label: 'Campaigns', href: '/admin/campaigns', icon: Send, visible: isEditor },
    { label: 'Users & Roles', href: '/admin/users', icon: ShieldCheck, visible: isSuperAdmin },
  ];

  const handleSignOut = () => {
    startLogout(async () => {
      await logoutAction();
    });
  };

  const content = (
    <div className="flex flex-col h-full bg-editorial-paper border-r border-editorial-hairline w-64 text-ink-body font-sans">
      {/* Brand & Admin Badge */}
      <div className="p-5 border-b border-editorial-hairline flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-ink-high flex items-center justify-center text-white font-black text-base font-serif shadow-xs">
            S
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-ink-high font-serif block">
              {SITE_NAME}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted font-sans">
              Editorial CMS
            </span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-none text-ink-muted hover:text-ink-high"
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Status Capsule */}
      {user && (
        <div className="px-4 py-3 mx-3 mt-3 bg-editorial-pure rounded-none border border-editorial-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-ink-muted">
              Signed in as
            </span>
            <span
              className={cn(
                'text-[9px] uppercase tracking-widest font-sans font-bold px-1.5 py-0.5 rounded-none',
                user.role === 'SUPER_ADMIN'
                  ? 'bg-brand-yellow text-ink-high border border-ink-high/20'
                  : user.role === 'EDITOR'
                  ? 'bg-editorial-sand text-ink-high border border-editorial-hairline'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              )}
            >
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <div className="text-xs font-bold text-ink-high truncate mt-1 font-serif">{user.name}</div>
          <div className="text-[11px] text-ink-muted truncate font-mono">{user.email}</div>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-ink-muted font-sans">
          Editorial Modules
        </div>

        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-none text-xs font-sans transition-editorial',
                  isActive
                    ? 'bg-editorial-pure text-ink-high border-l-2 border-ink-high font-bold shadow-xs'
                    : 'text-ink-body hover:text-ink-high hover:bg-editorial-sand/60 border-l-2 border-transparent font-medium'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-ink-high' : 'text-ink-muted')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* Bottom Switcher: Public Website & Logout */}
      <div className="p-3 border-t border-editorial-hairline space-y-1">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-none text-xs font-semibold text-ink-muted hover:text-ink-high hover:bg-editorial-sand transition-editorial"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-ink-high" />
            <span>View Public Site</span>
          </span>
          <ExternalLink className="w-3 h-3 text-ink-muted" />
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-between px-3 py-2 rounded-none text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-transparent transition-editorial text-left cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </span>
          <span className="text-[10px] text-rose-600/70 uppercase font-mono">End Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen">{content}</aside>

      {/* Mobile Modal Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
