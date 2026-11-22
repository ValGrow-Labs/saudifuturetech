'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AuthenticatedUser } from '@/lib/auth/guard';

export function AdminClientShell({ user, children }: { user: AuthenticatedUser | null; children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <main className="min-h-[100dvh] bg-paper text-ink-2 font-sans">{children}</main>;
  }

  return (
    <div className="min-h-[100dvh] bg-paper text-ink-2 font-sans flex">
      <AdminSidebar user={user} mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
      {/* overflow-x-clip: wide tables scroll inside their own wrappers; the page never scrolls sideways. */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-clip">
        <AdminHeader user={user} onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main id="main" className="flex-1 w-full max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
