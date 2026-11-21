'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser, canManageTaxonomy } from '@/lib/auth/guard';

export interface CategoryActionState {
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

export async function createCategoryAction(
  prevState: CategoryActionState | undefined,
  formData: FormData
): Promise<CategoryActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can manage categories.' };
  }

  const name = (formData.get('name') as string)?.trim();
  const rawSlug = (formData.get('slug') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const accentColor = (formData.get('accentColor') as string)?.trim() || '#F4C542';
  const displayOrder = parseInt(formData.get('displayOrder') as string, 10) || 0;

  if (!name) return { error: 'Category name is required.' };
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(name);

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return { error: `A category with slug "${slug}" already exists.` };

    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        accentColor,
        displayOrder,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to create category.' };
  }
}

export async function updateCategoryAction(
  prevState: CategoryActionState | undefined,
  formData: FormData
): Promise<CategoryActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can manage categories.' };
  }

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string)?.trim();
  const rawSlug = (formData.get('slug') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const accentColor = (formData.get('accentColor') as string)?.trim() || '#F4C542';
  const displayOrder = parseInt(formData.get('displayOrder') as string, 10) || 0;

  if (!id || !name) return { error: 'Category ID and name are required.' };
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(name);

  try {
    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) return { error: `Another category with slug "${slug}" already exists.` };

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        accentColor,
        displayOrder,
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath(`/category/${slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update category.' };
  }
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionState> {
  const user = await getCurrentSessionUser();
  if (!user || !canManageTaxonomy(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can delete categories.' };
  }

  try {
    const articleCount = await prisma.article.count({
      where: { categoryId: id },
    });

    if (articleCount > 0) {
      return {
        error: `Cannot delete category: ${articleCount} article(s) are currently associated with it. Reassign these articles first.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete category.' };
  }
}

