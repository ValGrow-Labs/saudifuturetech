import React from 'react';
import Link from 'next/link';
import { Plus, Mail, Eye, Edit2, Send, Clock, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/auth/guard';
import { PageHeading } from '@/components/ui/PageHeading';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { CampaignRowActions } from '@/components/admin/CampaignRowActions';
import { CampaignStatus, SubscriberStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignsPage() {
  await requireRole(['SUPER_ADMIN', 'EDITOR']);

  const [campaigns, activeSubscribersCount] = await Promise.all([
    prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.newsletterSubscriber.count({
      where: { status: SubscriberStatus.ACTIVE },
    }),
  ]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-editorial-hairline">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted font-sans mb-1">
            Audience & Distribution
          </div>
          <PageHeading
            title="Newsletter Campaigns"
            description="Compose, preview, and dispatch curated technology briefings to verified subscribers."
          />
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/campaigns/new">
            <Button
              variant="primary"
              size="md"
              className="font-sans uppercase tracking-wider text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Campaign</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscriber Health Pill */}
      <div className="p-4 bg-editorial-pure rounded-none border border-editorial-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-editorial-sand border border-editorial-hairline flex items-center justify-center text-ink-high shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold font-serif text-ink-high text-sm">
              {activeSubscribersCount} Active Subscribers Ready for Dispatch
            </span>
            <p className="text-[11px] text-ink-muted font-sans">
              Campaigns will be transmitted strictly to active recipients with recorded consent.
            </p>
          </div>
        </div>

        <Link
          href="/admin/subscribers"
          className="text-xs font-bold text-ink-high hover:text-amber-800 font-sans uppercase tracking-wider shrink-0"
        >
          Manage Subscribers &rarr;
        </Link>
      </div>

      {/* Campaigns Table */}
      {campaigns.length === 0 ? (
        <div className="p-12 bg-editorial-pure border border-dashed border-editorial-hairline rounded-none text-center space-y-3 shadow-xs">
          <Mail className="w-8 h-8 text-ink-muted mx-auto" />
          <h3 className="text-base font-bold text-ink-high font-serif">No Campaigns Created Yet</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto font-sans">
            Draft your first executive briefing to share weekly intelligence with subscribers.
          </p>
          <div className="pt-2">
            <Link href="/admin/campaigns/new">
              <Button variant="primary" size="sm" className="font-sans uppercase text-xs">
                Draft First Campaign
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-editorial-pure rounded-none border border-editorial-hairline overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-editorial-hairline bg-editorial-sand text-ink-muted font-sans uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-bold">Campaign Subject & Title</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Recipients</th>
                <th className="py-3 px-4 font-bold">Created By</th>
                <th className="py-3 px-4 font-bold">Sent / Created Date</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-hairline">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-editorial-sand/40 text-ink-body transition-editorial">
                  <td className="py-3 px-4 max-w-sm sm:max-w-md">
                    <div className="font-bold font-serif line-clamp-1 hover:text-amber-800 transition-colors">
                      <Link href={`/admin/campaigns/${camp.id}/preview`}>
                        {camp.subject}
                      </Link>
                    </div>
                    <div className="text-[11px] text-ink-muted mt-0.5 truncate font-sans">
                      Internal: {camp.title}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-sans font-bold uppercase ${
                        camp.status === CampaignStatus.SENT
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : camp.status === CampaignStatus.SENDING
                          ? 'bg-sky-50 text-sky-800 border border-sky-300'
                          : camp.status === CampaignStatus.SCHEDULED
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : camp.status === CampaignStatus.FAILED
                          ? 'bg-rose-50 text-rose-800 border border-rose-300'
                          : 'bg-editorial-sand text-ink-body border border-editorial-hairline'
                      }`}
                    >
                      {camp.status === CampaignStatus.SENT && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {camp.status === CampaignStatus.FAILED && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {camp.status === CampaignStatus.SCHEDULED && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{camp.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    {camp.status === CampaignStatus.SENT ? (
                      <span className="text-emerald-800 font-bold">{camp.recipientCount} sent</span>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-ink-muted font-sans">
                    {camp.createdBy?.name || 'Editorial Team'}
                  </td>

                  <td className="py-3 px-4 text-ink-muted font-mono text-[11px]">
                    <div>{formatDate(camp.sentAt || camp.createdAt)}</div>
                    <div className="text-[10px] text-ink-muted/70">
                      {camp.sentAt ? 'Dispatched' : 'Drafted'}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <CampaignRowActions
                      campaignId={camp.id}
                      status={camp.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

