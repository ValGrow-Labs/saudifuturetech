'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
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
    <div className="space-y-6 font-sans">
      {errorMsg && (
        <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-sm text-xs text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="font-sans text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Action to trigger Create */}
      <div className="flex justify-end">
        {!isCreating && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category Pillar</span>
          </Button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 bg-brand-surface border border-brand-yellow/40 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-sft pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-yellow font-heading">
              New Category Pillar
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-sft-text-muted hover:text-brand-cloud"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Name *
              </label>
              <input
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
                placeholder="e.g. Clean Energy"
                required
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Slug *
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="clean-energy"
                required
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs font-mono text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Accent Hex
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-8 h-8 rounded-sm bg-transparent cursor-pointer border border-sft"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs font-mono text-brand-cloud focus:border-brand-yellow focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
              Description
            </label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Editorial description of this pillar..."
              className="w-full bg-brand-dark border border-sft rounded-sm p-2 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-sft">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
              className="text-xs font-heading uppercase"
            >
              {isPending ? 'Saving...' : 'Create Category'}
            </Button>
          </div>
        </form>
      )}

      {/* Category List Table */}
      <div className="bg-brand-surface rounded-sm border border-sft overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-sft bg-brand-dark/60 text-sft-text-muted font-heading uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-bold">Category Pillar</th>
              <th className="py-3 px-4 font-bold">Slug</th>
              <th className="py-3 px-4 font-bold">Articles</th>
              <th className="py-3 px-4 font-bold">Accent Color</th>
              <th className="py-3 px-4 font-bold">Order</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sft/50">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <tr key={cat.id} className="bg-brand-dark/80 text-brand-cloud">
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-yellow rounded-sm px-2 py-1 text-xs text-brand-cloud"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="w-full bg-brand-surface border border-sft rounded-sm px-2 py-1 text-xs font-mono text-brand-cloud"
                      />
                    </td>
                    <td className="py-3 px-4 text-sft-text-muted font-mono">{cat._count.articles}</td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-24 bg-brand-surface border border-sft rounded-sm px-2 py-1 text-xs font-mono text-brand-cloud"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={editOrder}
                        onChange={(e) => setEditOrder(parseInt(e.target.value, 10) || 0)}
                        className="w-16 bg-brand-surface border border-sft rounded-sm px-2 py-1 text-xs font-mono text-brand-cloud"
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(cat.id)}
                        disabled={isPending}
                        className="p-1 rounded-sm bg-brand-yellow text-brand-graphite"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-1 rounded-sm bg-brand-surface text-sft-text-muted hover:text-brand-cloud border border-sft"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={cat.id} className="hover:bg-brand-dark/40 text-brand-cloud transition-editorial">
                  <td className="py-3 px-4">
                    <div className="font-bold font-heading">{cat.name}</div>
                    {cat.description && (
                      <div className="text-[11px] text-sft-text-muted line-clamp-1">{cat.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-sft-text-muted text-[11px]">/{cat.slug}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded-xs bg-brand-dark border border-sft text-[11px]">
                      {cat._count.articles} stories
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: cat.accentColor || '#F4C542' }}
                      />
                      <span className="font-mono text-[11px] text-sft-text-muted">{cat.accentColor}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-sft-text-muted">{cat.displayOrder}</td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-sm hover:bg-brand-surface text-sft-text-muted hover:text-brand-cloud"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-sm hover:bg-red-950/20 text-red-400/80 hover:text-red-300"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

