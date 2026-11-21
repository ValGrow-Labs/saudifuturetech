import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { UserManager } from '@/components/admin/UserManager';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const currentUser = await requireRole(['SUPER_ADMIN']);

  const [users, authors] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.author.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-editorial-hairline">
        <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1">
          Security & Access Control
        </div>
        <PageHeading
          title="Staff Accounts & Role-Based Access"
          description="Provision editorial personnel, configure RBAC permission tiers, manage account active states, and link contributor bylines."
          size="lg"
        />
      </div>

      <UserManager
        users={users}
        authors={authors}
        currentUserId={currentUser.id}
      />
    </div>
  );
}

