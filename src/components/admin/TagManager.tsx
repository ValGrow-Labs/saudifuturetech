'use client';

import React, { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PageHeading } from '@/components/ui/PageHeading';
import { createTagAction, updateTagAction, deleteTagAction } from '@/actions/tags';

import { StatusDot, Note, type Tone } from '@/components/ui/StatusDot';
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
  const [query, setQuery] = useState('');

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
    if (confirm(`Delete the tag "${name}"? It will be removed from every article that uses it.`)) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await deleteTagAction(id);
        if (res?.error) {
          setErrorMsg(res.error);
        }
      });
    }
  };

  const q = query.trim().toLowerCase();
  const visibleTags = q ? tags.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q)) : tags;

  return (
    <div className="space-y-6">
      <PageHeading title="Tags" description="Topics that link articles across sections." />

      {errorMsg && (
        <Note tone="error" onDismiss={() => setErrorMsg(null)}>
          {errorMsg}
        </Note>
      )}

      {/* Add tag */}
      <form onSubmit={handleCreate} className="panel p-5">
        <h2 className="panel-title mb-4">Add a tag</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
          <div>
            <label htmlFor="tag-new-name" className="field-label">
              Name
            </label>
            <input
              id="tag-new-name"
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
              placeholder="Generative AI"
              required
              className="field"
            />
          </div>
          <div>
            <label htmlFor="tag-new-slug" className="field-label">
              Slug
            </label>
            <input
              id="tag-new-slug"
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="generative-ai"
              required
              className="field font-sans"
            />
          </div>
          <Button type="submit" disabled={isPending} className="whitespace-nowrap">
            {isPending ? 'Saving…' : 'Add tag'}
          </Button>
        </div>
      </form>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="sm:w-80">
          <label htmlFor="tag-search" className="field-label">
            Search
          </label>
          <input
            id="tag-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or slug"
            className="field"
          />
        </div>
        <p className="meta">
          {visibleTags.length} of {tags.length} tags
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table min-w-[560px]">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Slug</th>
              <th className="text-right">Articles</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTags.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10">
                  <p className="font-serif text-lg text-ink">
                    {tags.length === 0 ? 'No tags yet.' : 'No tags match this search.'}
                  </p>
                  <p className="mt-1 text-sm text-ink-3">{tags.length === 0 ? 'Add one above.' : 'Try a shorter search.'}</p>
                </td>
              </tr>
            )}
            {visibleTags.map((tag) => {
              const isEditing = editingId === tag.id;

              if (isEditing) {
                return (
                  <tr key={tag.id} className="bg-paper-sheet">
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
                    <td className="text-right font-sans tabular text-ink-3">{tag._count.articleTags}</td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={() => handleUpdate(tag.id)} disabled={isPending}>
                          {isPending ? 'Saving…' : 'Save'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={tag.id}>
                  <td className="font-serif text-[1.0625rem] text-ink">{tag.name}</td>
                  <td className="whitespace-nowrap font-sans text-[0.8125rem] text-ink-3">/{tag.slug}</td>
                  <td className="text-right font-sans tabular text-ink-2">{tag._count.articleTags}</td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(tag.id);
                          setEditName(tag.name);
                          setEditSlug(tag.slug);
                        }}
                        className="row-action"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(tag.id, tag.name)} className="row-action-danger">
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
