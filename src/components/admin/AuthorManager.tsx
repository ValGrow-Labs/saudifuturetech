'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PageHeading } from '@/components/ui/PageHeading';
import { createAuthorAction, updateAuthorAction, deleteAuthorAction } from '@/actions/authors';

import { StatusDot, Note, type Tone } from '@/components/ui/StatusDot';
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
    if (confirm(`Delete the author "${name}"?`)) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await deleteAuthorAction(id);
        if (res?.error) {
          setErrorMsg(res.error);
        }
      });
    }
  };

  const isFormOpen = Boolean(isCreating || editingId);

  return (
    <div className="space-y-6">
      <PageHeading title="Authors" description="Bylines shown on articles, with bios and linked login accounts.">
        {!isFormOpen && (
          <Button type="button" onClick={openCreate}>
            Add author
          </Button>
        )}
      </PageHeading>

      {errorMsg && !isFormOpen && (
        <Note tone="error" onDismiss={() => setErrorMsg(null)}>
          {errorMsg}
        </Note>
      )}

      {/* Create / edit form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="panel p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="panel-title">{editingId ? 'Edit author' : 'New author'}</h2>
            <button type="button" onClick={closeForm} className="row-action">
              Close
            </button>
          </div>

          {errorMsg && <Note tone="error">{errorMsg}</Note>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="au-name" className="field-label">
                Name
              </label>
              <input
                id="au-name"
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
                placeholder="Tariq Al-Mansoor"
                required
                className="field"
              />
            </div>
            <div>
              <label htmlFor="au-slug" className="field-label">
                Slug
              </label>
              <input
                id="au-slug"
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="tariq-al-mansoor"
                required
                className="field font-sans"
              />
            </div>
            <div>
              <label htmlFor="au-title" className="field-label">
                Job title
              </label>
              <input
                id="au-title"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Senior technology reporter"
                required
                className="field"
              />
            </div>
            <div>
              <label htmlFor="au-avatar" className="field-label">
                Photo URL
              </label>
              <input
                id="au-avatar"
                type="url"
                value={formAvatar}
                onChange={(e) => setFormAvatar(e.target.value)}
                placeholder="https://"
                className="field font-sans text-[0.8125rem]"
              />
            </div>
            <div>
              <label htmlFor="au-location" className="field-label">
                Location
              </label>
              <input
                id="au-location"
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="Riyadh, Saudi Arabia"
                className="field"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="au-twitter" className="field-label">
                  X / Twitter
                </label>
                <input
                  id="au-twitter"
                  type="text"
                  value={formTwitter}
                  onChange={(e) => setFormTwitter(e.target.value)}
                  placeholder="@handle"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="au-linkedin" className="field-label">
                  LinkedIn
                </label>
                <input
                  id="au-linkedin"
                  type="text"
                  value={formLinkedin}
                  onChange={(e) => setFormLinkedin(e.target.value)}
                  placeholder="profile-slug"
                  className="field"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="au-bio" className="field-label">
              Bio
            </label>
            <textarea
              id="au-bio"
              rows={3}
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              placeholder="Two or three sentences on what they cover."
              className="field"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : editingId ? 'Save changes' : 'Create author'}
            </Button>
          </div>
        </form>
      )}

      <p className="meta">{authors.length} authors</p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table min-w-[820px]">
          <thead>
            <tr>
              <th>Author</th>
              <th>Job title</th>
              <th className="text-right">Articles</th>
              <th>Login</th>
              <th>Location</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10">
                  <p className="font-serif text-lg text-ink">No authors yet.</p>
                  <p className="mt-1 text-sm text-ink-3">Add one so articles can carry a byline.</p>
                </td>
              </tr>
            )}
            {authors.map((author) => (
              <tr key={author.id}>
                <td>
                  <div className="flex items-center gap-3">
                    {author.avatar ? (
                      <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full bg-paper-band">
                        <Image src={author.avatar} alt="" fill sizes="32px" className="object-cover img-warm" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 shrink-0 rounded-full bg-paper-band flex items-center justify-center font-serif text-ink-3">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => openEdit(author)}
                        className="font-serif text-[1.0625rem] leading-snug text-ink text-left whitespace-nowrap hover:text-clay transition-colors"
                      >
                        {author.name}
                      </button>
                      <p className="whitespace-nowrap font-sans text-[0.71875rem] text-ink-4">/{author.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="text-ink-2">{author.title}</td>
                <td className="text-right font-sans tabular text-ink-2">{author._count.articles}</td>
                <td className="whitespace-nowrap">
                  {author.user ? (
                    <span className="font-sans text-[0.8125rem] text-ink-2 truncate inline-block max-w-[240px] align-bottom">
                      {author.user.email}
                    </span>
                  ) : (
                    <StatusDot tone="ink">No login</StatusDot>
                  )}
                </td>
                <td className="text-ink-3">{author.location || '—'}</td>
                <td className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-4">
                    <button type="button" onClick={() => openEdit(author)} className="row-action">
                      Edit
                    </button>
                    <a href={`/author/${author.slug}`} target="_blank" rel="noopener noreferrer" className="row-action">
                      View ↗
                    </a>
                    <button type="button" onClick={() => handleDelete(author.id, author.name)} className="row-action-danger">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
