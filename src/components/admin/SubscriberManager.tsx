'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatDate, cn } from '@/lib/utils';
import { toggleSubscriberStatusAction, deleteSubscriberAction } from '@/actions/newsletter';
import { SubscriberStatus } from '@prisma/client';

import { StatusDot, Note, type Tone } from '@/components/ui/StatusDot';
interface SubscriberItem {
  id: string;
  email: string;
  status: SubscriberStatus;
  consentGivenAt: Date;
  unsubscribedAt: Date | null;
  createdAt: Date;
}

interface SubscriberManagerProps {
  subscribers: SubscriberItem[];
  totalCount: number;
  activeCount: number;
  unsubscribedCount: number;
  initialSearch?: string;
  initialStatus?: string;
  isSuperAdmin?: boolean;
}

export function SubscriberManager({
  subscribers,
  totalCount,
  activeCount,
  unsubscribedCount,
  initialSearch = '',
  initialStatus = 'ALL',
  isSuperAdmin = false,
}: SubscriberManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await toggleSubscriberStatusAction(id);
      if (res?.error) {
        setErrorMsg(res.error);
      }
    });
  };

  const handleDelete = (id: string, email: string) => {
    if (confirm(`Delete ${email} from the subscriber list? This cannot be undone.`)) {
      setErrorMsg(null);
      startTransition(async () => {
        const res = await deleteSubscriberAction(id);
        if (res?.error) {
          setErrorMsg(res.error);
        }
      });
    }
  };

  const tabs = [
    { label: 'All', key: 'ALL', count: totalCount },
    { label: 'Active', key: 'ACTIVE', count: activeCount },
    { label: 'Unsubscribed', key: 'UNSUBSCRIBED', count: unsubscribedCount },
  ];

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Note tone="error" onDismiss={() => setErrorMsg(null)}>
          {errorMsg}
        </Note>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <nav aria-label="Filter by status" className="flex items-center gap-6 border-b border-rule overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = initialStatus === tab.key;
            return (
              <Link
                key={tab.key}
                href={
                  tab.key === 'ALL'
                    ? `/admin/subscribers${initialSearch ? `?q=${initialSearch}` : ''}`
                    : `/admin/subscribers?status=${tab.key}${initialSearch ? `&q=${initialSearch}` : ''}`
                }
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  '-mb-px inline-flex items-baseline gap-2 border-b-2 pb-2 text-sm whitespace-nowrap transition-colors',
                  isActive ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'
                )}
              >
                {tab.label}
                <span className="font-sans tabular text-[0.71875rem] text-ink-4">{tab.count}</span>
              </Link>
            );
          })}
        </nav>

        <form method="GET" action="/admin/subscribers" className="flex items-end gap-2 w-full lg:w-auto">
          {initialStatus !== 'ALL' && <input type="hidden" name="status" value={initialStatus} />}
          <div className="flex-1 lg:w-72">
            <label htmlFor="sub-search" className="field-label">
              Search
            </label>
            <input
              id="sub-search"
              type="search"
              name="q"
              defaultValue={initialSearch}
              placeholder="Email address"
              className="field"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
          {initialSearch && (
            <Link
              href={`/admin/subscribers${initialStatus !== 'ALL' ? `?status=${initialStatus}` : ''}`}
              className="row-action pb-2"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="meta">{subscribers.length} shown</p>
        {isPending && <p className="meta">Saving…</p>}
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <div className="border-y border-rule py-10">
          <p className="font-serif text-lg text-ink">No subscribers found.</p>
          <p className="mt-1 text-sm text-ink-3">Try a different search or switch status.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table min-w-[720px]">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Consent given</th>
                <th>Subscribed</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => {
                const isActive = sub.status === SubscriberStatus.ACTIVE;

                return (
                  <tr key={sub.id}>
                    <td className="font-sans text-[0.8125rem] text-ink">{sub.email}</td>
                    <td className="whitespace-nowrap">
                      <StatusDot tone={isActive ? 'moss' : 'ink'}>{isActive ? 'Active' : 'Unsubscribed'}</StatusDot>
                    </td>
                    <td className="whitespace-nowrap font-sans tabular text-[0.8125rem] text-ink-3">
                      {formatDate(sub.consentGivenAt)}
                    </td>
                    <td className="whitespace-nowrap font-sans tabular text-[0.8125rem] text-ink-3">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(sub.id)}
                          disabled={isPending}
                          className="row-action disabled:opacity-50"
                        >
                          {isActive ? 'Unsubscribe' : 'Reactivate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sub.id, sub.email)}
                          disabled={isPending}
                          className="row-action-danger disabled:opacity-50"
                        >
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
      )}
    </div>
  );
}
