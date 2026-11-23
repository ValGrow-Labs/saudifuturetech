import React from 'react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
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

  return <UserManager users={users} authors={authors} currentUserId={currentUser.id} />;
}
