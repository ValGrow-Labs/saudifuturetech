'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createTagAction, updateTagAction, deleteTagAction } from '@/actions/tags';

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count: {
    articleTags: number;
  };
}

export function TagManager({ tags }: { tags: TagItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('name', newName);
    formData.append('slug', newSlug);

    startTransition(async () => {
      const res = await createTagAction(undefined, formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setNewName('');
        setNewSlug('');
      }
    });
  };

  const handleUpdate = (id: string) => {
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', editName);
    formData.append('slug', editSlug);

    startTransition(async () => {
      const res = await updateTagAction(undefined, formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setEditingId(null);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete tag #${name}? It will be removed from all associated articles.`)) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await deleteTagAction(id);
        if (res?.error) {
          setErrorMsg(res.error);
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

      {/* Quick Add Tag Form */}
      <form onSubmit={handleCreate} className="p-4 bg-brand-surface border border-sft rounded-sm flex flex-col sm:flex-row items-end gap-3">
        <div className="flex-1 space-y-1 w-full">
          <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
            New Topic / Tag Name
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
            placeholder="e.g. Sovereign AI"
            required
            className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
          />
        </div>

        <div className="flex-1 space-y-1 w-full">
          <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
            URL Slug
          </label>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="sovereign-ai"
            required
            className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs font-mono text-brand-cloud focus:border-brand-yellow focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isPending}
          className="font-heading uppercase tracking-wider text-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Add Tag</span>
        </Button>
      </form>

      {/* Tags Grid / Table */}
      <div className="bg-brand-surface rounded-sm border border-sft overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-sft bg-brand-dark/60 text-sft-text-muted font-heading uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-bold">Tag / Topic</th>
              <th className="py-3 px-4 font-bold">Slug</th>
              <th className="py-3 px-4 font-bold">Articles Linked</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sft/50">
            {tags.map((tag) => {
              const isEditing = editingId === tag.id;

              if (isEditing) {
                return (
                  <tr key={tag.id} className="bg-brand-dark/80 text-brand-cloud">
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
                    <td className="py-3 px-4 text-sft-text-muted font-mono">{tag._count.articleTags}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(tag.id)}
                        disabled={isPending}
                        className="p-1 rounded-sm bg-brand-yellow text-brand-graphite"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded-sm bg-brand-surface text-sft-text-muted hover:text-brand-cloud border border-sft"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={tag.id} className="hover:bg-brand-dark/40 text-brand-cloud transition-editorial">
                  <td className="py-3 px-4 font-medium flex items-center gap-2">
                    <TagIcon className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                    <span>#{tag.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sft-text-muted text-[11px]">/{tag.slug}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded-xs bg-brand-dark border border-sft text-[11px]">
                      {tag._count.articleTags} stories
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(tag.id);
                        setEditName(tag.name);
                        setEditSlug(tag.slug);
                      }}
                      className="p-1.5 rounded-sm hover:bg-brand-surface text-sft-text-muted hover:text-brand-cloud"
                      title="Edit Tag"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="p-1.5 rounded-sm hover:bg-red-950/20 text-red-400/80 hover:text-red-300"
                      title="Delete Tag"
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

