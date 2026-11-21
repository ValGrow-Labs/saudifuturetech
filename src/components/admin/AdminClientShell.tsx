'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AuthenticatedUser } from '@/lib/auth/guard';

export function AdminClientShell({
  user,
  children,
}: {
  user: AuthenticatedUser | null;
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <main className="min-h-screen bg-editorial-paper text-ink-body font-sans selection:bg-brand-yellow/30">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-editorial-paper text-ink-body flex flex-col font-sans selection:bg-brand-yellow/30">
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <AdminSidebar
          user={user}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader
            user={user}
            onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

