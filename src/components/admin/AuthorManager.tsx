'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, AlertTriangle, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createAuthorAction, updateAuthorAction, deleteAuthorAction } from '@/actions/authors';

interface AuthorItem {
  id: string;
  name: string;
  slug: string;
  title: string;
  bio: string | null;
  avatar: string | null;
  location: string | null;
  socialLinks: any;
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  } | null;
  _count: {
    articles: number;
  };
}

export function AuthorManager({ authors }: { authors: AuthorItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formTwitter, setFormTwitter] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setFormName('');
    setFormSlug('');
    setFormTitle('Technology Journalist');
    setFormBio('');
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setFormLocation('Riyadh, Saudi Arabia');
    setFormTwitter('');
    setFormLinkedin('');
    setErrorMsg(null);
  };

  const openEdit = (author: AuthorItem) => {
    setIsCreating(false);
    setEditingId(author.id);
    setFormName(author.name);
    setFormSlug(author.slug);
    setFormTitle(author.title);
    setFormBio(author.bio || '');
    setFormAvatar(author.avatar || '');
    setFormLocation(author.location || '');
    setFormTwitter(author.socialLinks?.twitter || '');
    setFormLinkedin(author.socialLinks?.linkedin || '');
    setErrorMsg(null);
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    if (editingId) formData.append('id', editingId);
    formData.append('name', formName);
    formData.append('slug', formSlug);
    formData.append('title', formTitle);
    formData.append('bio', formBio);
    formData.append('avatar', formAvatar);
    formData.append('location', formLocation);
    formData.append('twitter', formTwitter);
    formData.append('linkedin', formLinkedin);

    startTransition(async () => {
      const res = editingId
        ? await updateAuthorAction(undefined, formData)
        : await createAuthorAction(undefined, formData);

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        closeForm();
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete author "${name}"?`)) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await deleteAuthorAction(id);
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

      {/* Action Header */}
      <div className="flex justify-end">
        {!isCreating && !editingId && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreate}
            className="font-heading uppercase tracking-wider text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Author Byline</span>
          </Button>
        )}
      </div>

      {/* Create / Edit Form Modal / Card */}
      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="p-5 bg-brand-surface border border-brand-yellow/40 rounded-sm space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-sft pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-yellow font-heading">
              {editingId ? 'Edit Contributor Profile' : 'New Contributor Profile'}
            </h3>
            <button type="button" onClick={closeForm} className="text-sft-text-muted hover:text-brand-cloud">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Full Name *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingId) {
                    setFormSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                    );
                  }
                }}
                placeholder="e.g. Tariq Al-Mansoor"
                required
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                URL Slug *
              </label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="tariq-al-mansoor"
                required
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs font-mono text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Editorial Title *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Senior Technology Analyst"
                required
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Avatar Photo URL
              </label>
              <input
                type="url"
                value={formAvatar}
                onChange={(e) => setFormAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs font-mono text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Location
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="Riyadh, Saudi Arabia"
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Social Links (Twitter / LinkedIn)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formTwitter}
                  onChange={(e) => setFormTwitter(e.target.value)}
                  placeholder="@handle"
                  className="bg-brand-dark border border-sft rounded-sm px-2 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
                />
                <input
                  type="text"
                  value={formLinkedin}
                  onChange={(e) => setFormLinkedin(e.target.value)}
                  placeholder="linkedin-slug"
                  className="bg-brand-dark border border-sft rounded-sm px-2 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
              Journalist Bio
            </label>
            <textarea
              rows={3}
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              placeholder="Detailed editorial biography..."
              className="w-full bg-brand-dark border border-sft rounded-sm p-2 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-sft">
            <Button type="button" variant="outline" size="sm" onClick={closeForm} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
              className="text-xs font-heading uppercase"
            >
              {isPending ? 'Saving...' : editingId ? 'Update Author' : 'Create Author'}
            </Button>
          </div>
        </form>
      )}

      {/* Authors Table */}
      <div className="bg-brand-surface rounded-sm border border-sft overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-sft bg-brand-dark/60 text-sft-text-muted font-heading uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-bold">Contributor</th>
              <th className="py-3 px-4 font-bold">Desk Title</th>
              <th className="py-3 px-4 font-bold">Articles</th>
              <th className="py-3 px-4 font-bold">User Account Link</th>
              <th className="py-3 px-4 font-bold">Location</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sft/50">
            {authors.map((author) => (
              <tr key={author.id} className="hover:bg-brand-dark/40 text-brand-cloud transition-editorial">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {author.avatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-dark border border-sft relative shrink-0">
                        <Image src={author.avatar} alt={author.name} fill sizes="32px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-dark border border-sft flex items-center justify-center font-bold text-brand-yellow">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold font-heading">{author.name}</div>
                      <div className="text-[11px] text-sft-text-muted font-mono">/{author.slug}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-sft-text-body">{author.title}</td>

                <td className="py-3 px-4 font-mono">
                  <span className="px-2 py-0.5 rounded-xs bg-brand-dark border border-sft text-[11px]">
                    {author._count.articles} stories
                  </span>
                </td>

                <td className="py-3 px-4">
                  {author.user ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono text-[11px] truncate max-w-[140px]">{author.user.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sft-text-muted">
                      <UserX className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[11px]">Unlinked</span>
                    </div>
                  )}
                </td>

                <td className="py-3 px-4 text-sft-text-muted">{author.location || '—'}</td>

                <td className="py-3 px-4 text-right space-x-1">
                  <button
                    type="button"
                    onClick={() => openEdit(author)}
                    className="p-1.5 rounded-sm hover:bg-brand-surface text-sft-text-muted hover:text-brand-cloud"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(author.id, author.name)}
                    className="p-1.5 rounded-sm hover:bg-red-950/20 text-red-400/80 hover:text-red-300"
                    title="Delete Author"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

