import React from 'react';
import { getCurrentSessionUser } from '@/lib/auth/guard';
import { AdminClientShell } from '@/components/admin/AdminClientShell';

export const metadata = {
  title: 'Editorial Backstage',
  description: 'Administrative Content Management System & Editorial Operations Portal',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentSessionUser();

  return <AdminClientShell user={user}>{children}</AdminClientShell>;
}
