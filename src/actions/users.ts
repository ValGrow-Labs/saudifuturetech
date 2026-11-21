'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser, canManageUsers } from '@/lib/auth/guard';
import { hashPassword } from '@/lib/auth/password';
import { UserRole } from '@prisma/client';

export interface UserActionState {
  success?: boolean;
  error?: string;
}

export async function createUserAction(
  prevState: UserActionState | undefined,
  formData: FormData
): Promise<UserActionState> {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser || !canManageUsers(currentUser)) {
    return { error: 'Permission denied: Super Admin authorization required.' };
  }

  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const role = (formData.get('role') as UserRole) || UserRole.AUTHOR;
  const authorId = (formData.get('authorId') as string) || null;
  const isActive = formData.get('isActive') !== 'false';

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: `A user with email "${email}" already exists.` };
    }

    if (authorId) {
      const existingLink = await prisma.user.findUnique({ where: { authorId } });
      if (existingLink) {
        return { error: 'The selected Author profile is already linked to another user account.' };
      }
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        authorId: authorId || null,
        isActive,
      },
    });

    revalidatePath('/admin/users');
    revalidatePath('/admin/authors');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to create user.' };
  }
}

export async function updateUserAction(
  prevState: UserActionState | undefined,
  formData: FormData
): Promise<UserActionState> {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser || !canManageUsers(currentUser)) {
    return { error: 'Permission denied: Super Admin authorization required.' };
  }

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string)?.trim();
  const role = (formData.get('role') as UserRole) || UserRole.AUTHOR;
  const authorId = (formData.get('authorId') as string) || null;
  const isActive = formData.get('isActive') !== 'false';

  if (!id || !name || !email) {
    return { error: 'User ID, name, and email are required.' };
  }

  // Safety: Prevent self-deactivation or self-demotion
  if (id === currentUser.id) {
    if (!isActive) {
      return { error: 'You cannot deactivate your own administrative account.' };
    }
    if (role !== UserRole.SUPER_ADMIN) {
      return { error: 'You cannot revoke your own Super Admin role.' };
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return { error: 'User not found.' };
    }

    const emailConflict = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    if (emailConflict) {
      return { error: `Email "${email}" is already in use by another account.` };
    }

    if (authorId) {
      const authorConflict = await prisma.user.findFirst({
        where: { authorId, NOT: { id } },
      });
      if (authorConflict) {
        return { error: 'The selected Author profile is already linked to another account.' };
      }
    }

    const data: any = {
      name,
      email,
      role,
      authorId: authorId || null,
      isActive,
    };

    if (password) {
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters long.' };
      }
      data.passwordHash = await hashPassword(password);
    }

    await prisma.user.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/users');
    revalidatePath('/admin/authors');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update user.' };
  }
}

export async function toggleUserActiveAction(id: string): Promise<UserActionState> {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser || !canManageUsers(currentUser)) {
    return { error: 'Permission denied.' };
  }

  if (id === currentUser.id) {
    return { error: 'You cannot deactivate your own account.' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { error: 'User not found.' };

    await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update user status.' };
  }
}

export async function deleteUserAction(id: string): Promise<UserActionState> {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser || !canManageUsers(currentUser)) {
    return { error: 'Permission denied.' };
  }

  if (id === currentUser.id) {
    return { error: 'You cannot delete your own account.' };
  }

  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete user.' };
  }
}

