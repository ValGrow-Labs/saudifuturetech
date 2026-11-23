'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { PageHeading } from '@/components/ui/PageHeading';
import { cn } from '@/lib/utils';
import {
  createUserAction,
  updateUserAction,
  toggleUserActiveAction,
  deleteUserAction,
} from '@/actions/users';
import { UserRole } from '@prisma/client';

import { StatusDot, Note, type Tone } from '@/components/ui/StatusDot';
interface AuthorOption {
  id: string;
  name: string;
  slug: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  authorId: string | null;
  author: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
}

interface UserManagerProps {
  users: UserItem[];
  authors: AuthorOption[];
  currentUserId: string;
}

export function UserManager({ users, authors, currentUserId }: UserManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.AUTHOR);
  const [authorId, setAuthorId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const openCreate = () => {
    setEditingId(null);
    setIsCreating(true);
    setName('');
    setEmail('');
    setPassword('');
    setRole(UserRole.AUTHOR);
    setAuthorId('');
    setIsActive(true);
    setErrorMsg(null);
  };

  const openEdit = (u: UserItem) => {
    setIsCreating(false);
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword(''); // leave blank for no change
    setRole(u.role);
    setAuthorId(u.authorId || '');
    setIsActive(u.isActive);
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
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    formData.append('role', role);
    formData.append('authorId', authorId);
    formData.append('isActive', String(isActive));

    startTransition(async () => {
      const res = editingId
        ? await updateUserAction(undefined, formData)
        : await createUserAction(undefined, formData);

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        closeForm();
      }
    });
  };

  const handleToggleActive = (id: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await toggleUserActiveAction(id);
      if (res?.error) {
        setErrorMsg(res.error);
      }
    });
  };

  const handleDelete = (id: string, userEmail: string) => {
    if (confirm(`Delete the account for ${userEmail}? This cannot be undone.`)) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await deleteUserAction(id);
        if (res?.error) {
          setErrorMsg(res.error);
        }
      });
    }
  };

  const isFormOpen = Boolean(isCreating || editingId);

  return (
    <div className="space-y-6">
      <PageHeading title="Users and roles" description="Staff who can sign in to the admin, and what each one is allowed to do.">
        {!isFormOpen && (
          <Button type="button" onClick={openCreate}>
            Add user
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
            <h2 className="panel-title">{editingId ? 'Edit user' : 'New user'}</h2>
            <button type="button" onClick={closeForm} className="row-action">
              Close
            </button>
          </div>

          {errorMsg && <Note tone="error">{errorMsg}</Note>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="us-name" className="field-label">
                Name
              </label>
              <input
                id="us-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Noura Al-Ghamdi"
                required
                className="field"
              />
            </div>
            <div>
              <label htmlFor="us-email" className="field-label">
                Email
              </label>
              <input
                id="us-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@saudifuturetech.com"
                required
                className="field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="us-password" className="field-label">
                Password
              </label>
              <input
                id="us-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingId ? '••••••••' : ''}
                required={!editingId}
                className="field"
              />
              <p className="field-hint">{editingId ? 'Leave blank to keep the current password.' : 'At least 8 characters.'}</p>
            </div>
            <div>
              <label htmlFor="us-role" className="field-label">
                Role
              </label>
              <select id="us-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="field">
                <option value={UserRole.AUTHOR}>Author</option>
                <option value={UserRole.EDITOR}>Editor</option>
                <option value={UserRole.SUPER_ADMIN}>Super admin</option>
              </select>
              <p className="field-hint">{ROLE_HINT[role]}</p>
            </div>
            <div>
              <label htmlFor="us-author" className="field-label">
                Byline
              </label>
              <select id="us-author" value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="field">
                <option value="">None</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <p className="field-hint">The author profile this person writes as.</p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-[#0B6E45]"
            />
            Active (can sign in)
          </label>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : editingId ? 'Save changes' : 'Create user'}
            </Button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="meta">{users.length} users</p>
        {isPending && <p className="meta">Saving…</p>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table min-w-[720px]">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Byline</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;

              return (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-baseline gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="font-serif text-[1.0625rem] leading-snug text-ink text-left hover:text-clay transition-colors"
                      >
                        {u.name}
                      </button>
                      {isSelf && <span className="font-sans text-[0.6875rem] text-ink-4">You</span>}
                    </div>
                    <p className="whitespace-nowrap font-sans text-[0.75rem] text-ink-3">{u.email}</p>
                  </td>
                  <td className="whitespace-nowrap text-ink-2">{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td className="whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id)}
                      disabled={isSelf || isPending}
                      title={isSelf ? 'You can’t deactivate your own account' : u.isActive ? 'Click to deactivate' : 'Click to reactivate'}
                      className={cn('transition-opacity', isSelf ? 'cursor-default' : 'hover:opacity-70 disabled:opacity-50')}
                    >
                      <StatusDot tone={u.isActive ? 'moss' : 'ink'}>{u.isActive ? 'Active' : 'Inactive'}</StatusDot>
                    </button>
                  </td>
                  <td className="whitespace-nowrap">
                    {u.author ? <span className="text-ink-2">{u.author.name}</span> : <span className="text-ink-4">—</span>}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-4">
                      <button type="button" onClick={() => openEdit(u)} className="row-action">
                        Edit
                      </button>
                      {!isSelf && (
                        <button type="button" onClick={() => handleDelete(u.id, u.email)} className="row-action-danger">
                          Delete
                        </button>
                      )}
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

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  EDITOR: 'Editor',
  AUTHOR: 'Author',
};

const ROLE_HINT: Record<string, string> = {
  SUPER_ADMIN: 'Everything, including users and exports.',
  EDITOR: 'Publishes articles and manages sections, tags and the directory.',
  AUTHOR: 'Writes drafts and submits them for review.',
};
