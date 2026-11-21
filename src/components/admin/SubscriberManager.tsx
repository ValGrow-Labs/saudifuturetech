'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  AlertTriangle,
  Mail,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { toggleSubscriberStatusAction, deleteSubscriberAction } from '@/actions/newsletter';
import { SubscriberStatus } from '@prisma/client';

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
    if (confirm(`Permanently remove subscriber "${email}" from the database?`)) {
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
    { label: 'All Subscribers', key: 'ALL', count: totalCount },
    { label: 'Active', key: 'ACTIVE', count: activeCount },
    { label: 'Unsubscribed', key: 'UNSUBSCRIBED', count: unsubscribedCount },
  ];

  return (
    <div className="space-y-6 font-sans">
      {errorMsg && (
        <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-sm text-xs text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="font-sans text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b sm:border-b-0 border-editorial-hairline pb-2 sm:pb-0">
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-sans font-bold transition-editorial shrink-0 ${
                  isActive
                    ? 'bg-editorial-pure text-ink-high border border-editorial-hairline shadow-xs'
                    : 'text-ink-body hover:text-ink-high hover:bg-editorial-sand/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-none text-[10px] font-mono ${
                    isActive ? 'bg-editorial-sand text-ink-high border border-editorial-hairline' : 'bg-editorial-sand/40 text-ink-muted'
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* CSV Export Action Button (Super Admin Only under PDPL) */}
        <div className="flex items-center gap-2 shrink-0">
          {isSuperAdmin ? (
            <a
              href="/api/admin/subscribers/export"
              download
              className="inline-flex items-center gap-2 px-3 py-2 rounded-none bg-editorial-pure hover:bg-editorial-sand border border-editorial-hairline text-ink-high text-xs font-sans font-bold transition-editorial shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-ink-high" />
              <span>Export Active CSV ({activeCount})</span>
            </a>
          ) : (
            <span className="text-[11px] text-ink-faint italic font-sans">
              Super Admin role required for CSV export
            </span>
          )}
        </div>
      </div>

      {/* Search Input */}
      <form method="GET" action="/admin/subscribers" className="flex items-center gap-2 max-w-md">
        {initialStatus !== 'ALL' && <input type="hidden" name="status" value={initialStatus} />}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={initialSearch}
            placeholder="Search subscriber email address..."
            className="w-full bg-editorial-pure border border-editorial-hairline rounded-none pl-9 pr-3 py-2 text-xs text-ink-high placeholder-ink-muted/60 focus:outline-none focus:border-ink-high transition-editorial font-sans shadow-xs"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" className="font-sans uppercase text-xs">
          Search
        </Button>
        {initialSearch && (
          <Link
            href={`/admin/subscribers${initialStatus !== 'ALL' ? `?status=${initialStatus}` : ''}`}
            className="text-xs text-ink-muted hover:text-ink-high px-2 py-1 font-sans font-medium"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Subscribers Table */}
      {subscribers.length === 0 ? (
        <div className="p-8 bg-editorial-pure border border-dashed border-editorial-hairline rounded-none text-center space-y-2 shadow-xs">
          <p className="text-sm font-bold text-ink-high font-serif">No subscribers found</p>
          <p className="text-xs text-ink-muted font-sans">
            Try adjusting your search query or switching to another status tab.
          </p>
        </div>
      ) : (
        <div className="bg-editorial-pure rounded-none border border-editorial-hairline overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-editorial-hairline bg-editorial-sand text-ink-muted font-sans uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-bold">Subscriber Email</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Consent Verified</th>
                <th className="py-3 px-4 font-bold">Subscribed Date</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-hairline">
              {subscribers.map((sub) => {
                const isActive = sub.status === SubscriberStatus.ACTIVE;

                return (
                  <tr key={sub.id} className="hover:bg-editorial-sand/40 text-ink-body transition-editorial">
                    <td className="py-3 px-4 font-mono font-medium text-ink-high">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                        <span>{sub.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-sans font-bold uppercase ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-editorial-sand text-ink-muted border border-editorial-hairline'
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-ink-muted" />}
                        <span>{sub.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-ink-muted font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-amber-700" />
                        <span>{formatDate(sub.consentGivenAt)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-ink-muted font-mono text-[11px]">
                      {formatDate(sub.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggle(sub.id)}
                        disabled={isPending}
                        className="px-2.5 py-1 rounded-none bg-editorial-sand hover:bg-editorial-stone border border-editorial-hairline text-[11px] font-sans text-ink-body hover:text-ink-high transition-editorial cursor-pointer"
                        title={isActive ? 'Deactivate subscription' : 'Reactivate subscription'}
                      >
                        {isActive ? 'Mark Unsubscribed' : 'Reactivate'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id, sub.email)}
                        disabled={isPending}
                        className="p-1.5 rounded-none hover:bg-rose-50 text-rose-700 hover:text-rose-800 transition-editorial"
                        title="Delete Subscriber"
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
      )}
    </div>
  );
}

