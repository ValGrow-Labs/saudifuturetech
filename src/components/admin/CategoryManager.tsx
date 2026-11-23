'use client';

import React, { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PageHeading } from '@/components/ui/PageHeading';
import { StatusDot, Note, type Tone } from '@/components/ui/StatusDot';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/actions/categories';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accentColor: string | null;
  displayOrder: number;
  _count: {
    articles: number;
  };
}

export function CategoryManager({ categories }: { categories: CategoryItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Create Form State
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#F4C542');
  const [newOrder, setNewOrder] = useState(0);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editOrder, setEditOrder] = useState(0);

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDesc(cat.description || '');
    setEditColor(cat.accentColor || '#F4C542');
    setEditOrder(cat.displayOrder);
    setErrorMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrorMsg(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('name', newName);
    formData.append('slug', newSlug);
    formData.append('description', newDesc);
    formData.append('accentColor', newColor);
    formData.append('displayOrder', String(newOrder));

    startTransition(async () => {
      const result = await createCategoryAction(undefined, formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setIsCreating(false);
        setNewName('');
        setNewSlug('');
        setNewDesc('');
      }
    });
  };

  const handleUpdate = (id: string) => {
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', editName);
    formData.append('slug', editSlug);
    formData.append('description', editDesc);
    formData.append('accentColor', editColor);
    formData.append('displayOrder', String(editOrder));

    startTransition(async () => {
      const result = await updateCategoryAction(undefined, formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setEditingId(null);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete the section "${name}"?`)) {
      setErrorMsg(null);
      startTransition(async () => {
        const result = await deleteCategoryAction(id);
        if (result?.error) {
          setErrorMsg(result.error);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Sections" description="The coverage sections articles are filed under, in the order they appear in navigation.">
        {!isCreating && (
          <Button type="button" onClick={() => setIsCreating(true)}>
            Add section
          </Button>
        )}
      </PageHeading>

      {errorMsg && (
        <Note tone="error" onDismiss={() => setErrorMsg(null)}>
          {errorMsg}
        </Note>
      )}

      {/* Create form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="panel p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="panel-title">New section</h2>
            <button type="button" onClick={() => setIsCreating(false)} className="row-action">
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cat-new-name" className="field-label">
                Name
              </label>
              <input
                id="cat-new-name"
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_-]+/g, '-')
                  );
                }}
                placeholder="Clean Energy"
                required
                className="field"
              />
            </div>
            <div>
              <label htmlFor="cat-new-slug" className="field-label">
                Slug
              </label>
              <input
                id="cat-new-slug"
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="clean-energy"
                required
                className="field font-sans"
              />
            </div>
            <div>
              <label htmlFor="cat-new-color" className="field-label">
                Accent colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Pick accent colour"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-[2.375rem] w-10 shrink-0 cursor-pointer rounded-sm border border-rule bg-paper-sheet p-1"
                />
                <input
                  id="cat-new-color"
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="field font-sans"
                />
              </div>
              <p className="field-hint">Stored for reference; the public site doesn&apos;t use it.</p>
            </div>
          </div>

          <div>
            <label htmlFor="cat-new-desc" className="field-label">
              Description
            </label>
            <textarea
              id="cat-new-desc"
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="One line on what this section covers."
              className="field"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Create section'}
            </Button>
          </div>
        </form>
      )}

      <p className="meta">{categories.length} sections</p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table min-w-[760px]">
          <thead>
            <tr>
              <th>Section</th>
              <th>Slug</th>
              <th className="text-right">Articles</th>
              <th>Accent</th>
              <th className="text-right">Order</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10">
                  <p className="font-serif text-lg text-ink">No sections yet.</p>
                  <p className="mt-1 text-sm text-ink-3">Add one so articles have somewhere to be filed.</p>
                </td>
              </tr>
            )}
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <tr key={cat.id} className="bg-paper-sheet">
                    <td>
                      <input
                        type="text"
                        aria-label="Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="field !py-1"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        aria-label="Slug"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="field !py-1 font-sans"
                      />
                    </td>
                    <td className="text-right font-sans tabular text-ink-3">{cat._count.articles}</td>
                    <td>
                      <input
                        type="text"
                        aria-label="Accent colour"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="field !py-1 !w-28 font-sans"
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        aria-label="Order"
                        value={editOrder}
                        onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 0)}
                        className="field !py-1 !w-20 ml-auto font-sans tabular"
                      />
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={() => handleUpdate(cat.id)} disabled={isPending}>
                          {isPending ? 'Saving…' : 'Save'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={cat.id}>
                  <td className="max-w-sm">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="font-serif text-[1.0625rem] leading-snug text-ink text-left hover:text-clay transition-colors"
                    >
                      {cat.name}
                    </button>
                    {cat.description && <p className="mt-0.5 text-[0.8125rem] text-ink-3 line-clamp-1">{cat.description}</p>}
                  </td>
                  <td className="whitespace-nowrap font-sans text-[0.8125rem] text-ink-3">/{cat.slug}</td>
                  <td className="text-right font-sans tabular text-ink-2">{cat._count.articles}</td>
                  <td className="whitespace-nowrap font-sans text-[0.8125rem] text-ink-3">{cat.accentColor || '—'}</td>
                  <td className="text-right font-sans tabular text-ink-3">{cat.displayOrder}</td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-4">
                      <button type="button" onClick={() => startEdit(cat)} className="row-action">
                        Edit
                      </button>
                      <a href={`/category/${cat.slug}`} target="_blank" rel="noopener noreferrer" className="row-action">
                        View ↗
                      </a>
                      <button type="button" onClick={() => handleDelete(cat.id, cat.name)} className="row-action-danger">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
