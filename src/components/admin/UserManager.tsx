'use client';

import React, { useState, useTransition } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  XCircle,
  KeyRound,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  createUserAction,
  updateUserAction,
  toggleUserActiveAction,
  deleteUserAction,
} from '@/actions/users';
import { UserRole } from '@prisma/client';

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
    if (confirm(`Permanently delete user account "${userEmail}"? This action cannot be undone.`)) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await deleteUserAction(id);
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
            <span>Create Staff Account</span>
          </Button>
        )}
      </div>

      {/* Form Drawer / Card */}
      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="p-5 bg-brand-surface border border-brand-yellow/40 rounded-sm space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-sft pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-yellow font-heading">
              {editingId ? 'Modify Staff Account' : 'Provision Staff Account'}
            </h3>
            <button type="button" onClick={closeForm} className="text-sft-text-muted hover:text-brand-cloud">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Staff Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Noura Al-Ghamdi"
                required
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@saudifuturetech.com"
                required
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Password {editingId ? '(Leave blank to keep unchanged)' : '*'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingId ? '••••••••••••' : 'Min 8 characters'}
                required={!editingId}
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Security Role (RBAC) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              >
                <option value={UserRole.AUTHOR}>AUTHOR (Drafting & Submissions)</option>
                <option value={UserRole.EDITOR}>EDITOR (Publishing & Taxonomy)</option>
                <option value={UserRole.SUPER_ADMIN}>SUPER_ADMIN (Full Platform Access)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-sft-text-muted font-heading">
                Link to Contributor Byline
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full bg-brand-dark border border-sft rounded-sm px-3 py-1.5 text-xs text-brand-cloud focus:border-brand-yellow focus:outline-none"
              >
                <option value="">None (Administrative User)</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs text-brand-cloud cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded-xs border-sft bg-brand-dark text-brand-yellow focus:ring-0"
              />
              <span className="font-heading font-bold">Account Active (Authorized to sign in)</span>
            </label>
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
              {isPending ? 'Saving...' : editingId ? 'Update Staff Member' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-brand-surface rounded-sm border border-sft overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-sft bg-brand-dark/60 text-sft-text-muted font-heading uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-bold">Staff Member</th>
              <th className="py-3 px-4 font-bold">Role Tier</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 px-4 font-bold">Linked Byline</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sft/50">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;

              return (
                <tr key={u.id} className="hover:bg-brand-dark/40 text-brand-cloud transition-editorial">
                  <td className="py-3 px-4">
                    <div className="font-bold font-heading flex items-center gap-2">
                      <span>{u.name}</span>
                      {isSelf && (
                        <span className="px-1.5 py-0.2 rounded-xs bg-brand-yellow text-brand-graphite font-mono text-[9px] uppercase font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-sft-text-muted font-mono">{u.email}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'text-[10px] uppercase font-heading font-bold px-2 py-0.5 rounded-xs inline-block',
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-brand-yellow text-brand-graphite'
                          : u.role === 'EDITOR'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      )}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id)}
                      disabled={isSelf || isPending}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-heading font-bold uppercase transition-colors',
                        u.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
                        isSelf && 'cursor-default opacity-80'
                      )}
                      title={isSelf ? 'Cannot deactivate yourself' : 'Click to toggle active status'}
                    >
                      {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{u.isActive ? 'Active' : 'Deactivated'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    {u.author ? (
                      <span className="font-medium text-brand-cloud text-[11px]">{u.author.name}</span>
                    ) : (
                      <span className="text-sft-text-muted text-[11px] italic">Not linked</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="p-1.5 rounded-sm hover:bg-brand-surface text-sft-text-muted hover:text-brand-cloud"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.email)}
                        className="p-1.5 rounded-sm hover:bg-red-950/20 text-red-400/80 hover:text-red-300"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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

