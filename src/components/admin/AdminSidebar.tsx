'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AuthenticatedUser } from '@/lib/auth/guard';
import { logoutAction } from '@/actions/auth';

interface AdminSidebarProps {
  user?: AuthenticatedUser | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

type NavItem = { label: string; href: string; visible: boolean };

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, mobileOpen = false, onCloseMobile }) => {
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isEditor = user?.role === 'EDITOR' || isSuperAdmin;

  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: 'Publishing',
      items: [
        { label: 'Overview', href: '/admin', visible: true },
        { label: 'Articles', href: '/admin/articles', visible: true },
        { label: 'Sections', href: '/admin/categories', visible: isEditor },
        { label: 'Tags', href: '/admin/tags', visible: isEditor },
        { label: 'Authors', href: '/admin/authors', visible: isEditor },
      ],
    },
    {
      title: 'Directory',
      items: [
        { label: 'Opportunities', href: '/admin/opportunities', visible: isEditor },
        { label: 'Startups', href: '/admin/startups', visible: isEditor },
        { label: 'Investors', href: '/admin/investors', visible: isEditor },
      ],
    },
    {
      title: 'Newsletter',
      items: [
        { label: 'Subscribers', href: '/admin/subscribers', visible: isEditor },
        { label: 'Campaigns', href: '/admin/campaigns', visible: isEditor },
      ],
    },
    {
      title: 'Settings',
      items: [{ label: 'Users & roles', href: '/admin/users', visible: isSuperAdmin }],
    },
  ];

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const signOut = () =>
    startLogout(async () => {
      await logoutAction();
    });

  const content = (
    <div className="flex flex-col h-full w-60 bg-paper-band border-r border-rule">
      <div className="h-14 px-5 flex items-center justify-between border-b border-rule">
        <Link href="/admin" className="font-serif text-[1.125rem] text-ink tracking-[-0.02em] whitespace-nowrap">
          Saudi <em className="italic">Future</em> Tech
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-ink-3 hover:text-ink text-xl leading-none"
            aria-label="Close menu"
          >
            ×
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Admin">
        {groups.map((g) => {
          const items = g.items.filter((i) => i.visible);
          if (!items.length) return null;
          return (
            <div key={g.title}>
              <p className="px-2 mb-1.5 font-sans text-[0.6875rem] text-ink-4">{g.title}</p>
              <ul>
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center px-2 py-1.5 text-sm rounded-sm transition-colors',
                        isActive(item.href)
                          ? 'text-ink bg-paper-sheet font-medium'
                          : 'text-ink-2 hover:text-ink hover:bg-paper-sheet/60'
                      )}
                    >
                      {isActive(item.href) && (
                        <span className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 bg-clay" aria-hidden />
                      )}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-rule text-[0.8125rem]">
        {user && (
          <p className="text-ink-3 truncate mb-2" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          type="button"
          onClick={signOut}
          disabled={isLoggingOut}
          className="text-ink-2 hover:text-clay transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 sticky top-0 h-[100dvh]">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-overlay lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={onCloseMobile} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 shadow-lift">{content}</div>
        </div>
      )}
    </>
  );
};
