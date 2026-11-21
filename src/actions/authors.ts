'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser, canManageAuthors } from '@/lib/auth/guard';

export interface AuthorActionState {
  success?: boolean;
  error?: string;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createAuthorAction(
  prevState: AuthorActionState | undefined,
  formData: FormData
): Promise<AuthorActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageAuthors(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can manage authors.' };
  }

  const name = (formData.get('name') as string)?.trim();
  const rawSlug = (formData.get('slug') as string)?.trim();
  const title = (formData.get('title') as string)?.trim();
  const bio = (formData.get('bio') as string)?.trim() || null;
  const avatar = (formData.get('avatar') as string)?.trim() || null;
  const location = (formData.get('location') as string)?.trim() || null;
  const twitter = (formData.get('twitter') as string)?.trim() || null;
  const linkedin = (formData.get('linkedin') as string)?.trim() || null;

  if (!name || !title) return { error: 'Author name and title are required.' };
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(name);

  try {
    const existing = await prisma.author.findUnique({ where: { slug } });
    if (existing) return { error: `An author with slug "${slug}" already exists.` };

    await prisma.author.create({
      data: {
        name,
        slug,
        title,
        bio,
        avatar,
        location,
        socialLinks: {
          twitter: twitter || undefined,
          linkedin: linkedin || undefined,
        },
      },
    });

    revalidatePath('/admin/authors');
    revalidatePath('/admin/articles/new');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to create author.' };
  }
}

export async function updateAuthorAction(
  prevState: AuthorActionState | undefined,
  formData: FormData
): Promise<AuthorActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageAuthors(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can manage authors.' };
  }

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string)?.trim();
  const rawSlug = (formData.get('slug') as string)?.trim();
  const title = (formData.get('title') as string)?.trim();
  const bio = (formData.get('bio') as string)?.trim() || null;
  const avatar = (formData.get('avatar') as string)?.trim() || null;
  const location = (formData.get('location') as string)?.trim() || null;
  const twitter = (formData.get('twitter') as string)?.trim() || null;
  const linkedin = (formData.get('linkedin') as string)?.trim() || null;

  if (!id || !name || !title) return { error: 'Author ID, name, and title are required.' };
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(name);

  try {
    const existing = await prisma.author.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) return { error: `Another author with slug "${slug}" already exists.` };

    await prisma.author.update({
      where: { id },
      data: {
        name,
        slug,
        title,
        bio,
        avatar,
        location,
        socialLinks: {
          twitter: twitter || undefined,
          linkedin: linkedin || undefined,
        },
      },
    });

    revalidatePath('/admin/authors');
    revalidatePath(`/author/${slug}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update author.' };
  }
}

export async function deleteAuthorAction(id: string): Promise<AuthorActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageAuthors(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can delete authors.' };
  }

  try {
    const articleCount = await prisma.article.count({
      where: { authorId: id },
    });

    if (articleCount > 0) {
      return {
        error: `Cannot delete author: ${articleCount} article(s) are currently authored by this profile. Reassign articles first.`,
      };
    }

    await prisma.author.delete({
      where: { id },
    });

    revalidatePath('/admin/authors');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete author.' };
  }
}

