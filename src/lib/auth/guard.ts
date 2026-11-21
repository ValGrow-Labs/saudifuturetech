import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authorId: string | null;
  isActive: boolean;
}

let _testSessionUser: AuthenticatedUser | null | undefined = undefined;

/**
 * Test harness helper: Set a mock authenticated user in non-production environments.
 */
export function __setTestSessionUser(user: AuthenticatedUser | null | undefined) {
  if (process.env.NODE_ENV !== 'production') {
    _testSessionUser = user;
  }
}

/**
 * Retrieve the current authenticated user from session and verify active status against the database.
 */
export async function getCurrentSessionUser(): Promise<AuthenticatedUser | null> {
  if (process.env.NODE_ENV !== 'production' && _testSessionUser !== undefined) {
    return _testSessionUser;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  // Real-time verification against DB to immediately enforce deactivations
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authorId: true,
        isActive: true,
      },
    });

    if (!dbUser || !dbUser.isActive) {
      return null;
    }

    return dbUser;
  } catch (error) {
    console.error('[AuthGuard] Error checking user status in DB:', error);
    // Fall back to session values if DB read temporarily fails
    if (!session.user.isActive) return null;
    return {
      id: session.user.id,
      name: session.user.name || '',
      email: session.user.email || '',
      role: session.user.role,
      authorId: session.user.authorId || null,
      isActive: session.user.isActive,
    };
  }
}

/**
 * Require authentication. Redirects to /admin/login if unauthenticated or inactive.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect('/admin/login');
  }
  return user;
}

/**
 * Require a specific role or set of roles. Throws error if unauthorized.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Access requires one of the following roles: ${allowedRoles.join(', ')}`);
  }
  return user;
}

/**
 * Permission check: Can the user edit the specified article?
 * - SUPER_ADMIN and EDITOR can edit any article.
 * - AUTHOR can only edit articles where authorId matches their linked Author profile.
 */
export function canEditArticle(
  user: AuthenticatedUser,
  article: { authorId: string; status?: string }
): boolean {
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.EDITOR) {
    return true;
  }
  if (user.role === UserRole.AUTHOR) {
    return Boolean(user.authorId && user.authorId === article.authorId);
  }
  return false;
}

/**
 * Permission check: Can the user publish or unpublish articles?
 * - SUPER_ADMIN and EDITOR can publish.
 * - AUTHOR cannot publish directly (can only submit for review).
 */
export function canPublishArticle(user: AuthenticatedUser): boolean {
  return user.role === UserRole.SUPER_ADMIN || user.role === UserRole.EDITOR;
}

/**
 * Permission check: Can the user delete the specified article?
 * - SUPER_ADMIN and EDITOR can delete any article.
 * - AUTHOR can only delete their own DRAFT articles.
 */
export function canDeleteArticle(
  user: AuthenticatedUser,
  article: { authorId: string; status: string }
): boolean {
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.EDITOR) {
    return true;
  }
  if (user.role === UserRole.AUTHOR) {
    return (
      Boolean(user.authorId && user.authorId === article.authorId) &&
      article.status === 'DRAFT'
    );
  }
  return false;
}

/**
 * Permission check: Can the user manage system users?
 * - SUPER_ADMIN only.
 */
export function canManageUsers(user: AuthenticatedUser): boolean {
  return user.role === UserRole.SUPER_ADMIN;
}

/**
 * Permission check: Can the user manage taxonomies (categories, tags)?
 * - SUPER_ADMIN and EDITOR only.
 */
export function canManageTaxonomy(user: AuthenticatedUser): boolean {
  return user.role === UserRole.SUPER_ADMIN || user.role === UserRole.EDITOR;
}

/**
 * Permission check: Can the user manage authors?
 * - SUPER_ADMIN and EDITOR only.
 */
export function canManageAuthors(user: AuthenticatedUser): boolean {
  return user.role === UserRole.SUPER_ADMIN || user.role === UserRole.EDITOR;
}

