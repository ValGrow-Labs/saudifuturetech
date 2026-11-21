'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser, canManageTaxonomy } from '@/lib/auth/guard';

export interface TagActionState {
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

export async function createTagAction(
  prevState: TagActionState | undefined,
  formData: FormData
): Promise<TagActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can create tags.' };
  }

  const name = (formData.get('name') as string)?.trim();
  const rawSlug = (formData.get('slug') as string)?.trim();

  if (!name) return { error: 'Tag name is required.' };
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(name);

  try {
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) return { error: `Tag with slug "${slug}" already exists.` };

    await prisma.tag.create({
      data: { name, slug },
    });

    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to create tag.' };
  }
}

export async function updateTagAction(
  prevState: TagActionState | undefined,
  formData: FormData
): Promise<TagActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can update tags.' };
  }

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string)?.trim();
  const rawSlug = (formData.get('slug') as string)?.trim();

  if (!id || !name) return { error: 'Tag ID and name are required.' };
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(name);

  try {
    const existing = await prisma.tag.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) return { error: `Another tag with slug "${slug}" already exists.` };

    await prisma.tag.update({
      where: { id },
      data: { name, slug },
    });

    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update tag.' };
  }
}

export async function deleteTagAction(id: string): Promise<TagActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can delete tags.' };
  }

  try {
    // Delete tag (cascade will safely remove article-tag links)
    await prisma.tag.delete({
      where: { id },
    });

    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete tag.' };
  }
}

