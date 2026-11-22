'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/guard';
import { CampaignStatus, SubscriberStatus } from '@prisma/client';
import { Resend } from 'resend';
import { renderCampaignEmail } from '@/lib/newsletter/email-template';

export interface CampaignActionState {
  success?: boolean;
  campaignId?: string;
  error?: string;
  warning?: string;
}

export async function createCampaignAction(
  prevState: CampaignActionState | undefined,
  formData: FormData
): Promise<CampaignActionState> {
  const user = await getCurrentSessionUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'EDITOR')) {
    return { error: 'Permission denied: Staff authorization required.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const subject = (formData.get('subject') as string)?.trim();
  const previewText = (formData.get('previewText') as string)?.trim() || null;
  const content = (formData.get('content') as string)?.trim();

  if (!title || !subject || !content) {
    return { error: 'Campaign internal title, subject line, and content body are required.' };
  }

  try {
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        title,
        subject,
        previewText,
        content,
        status: CampaignStatus.DRAFT,
        createdById: user.id,
      },
    });

    revalidatePath('/admin/campaigns');
    return { success: true, campaignId: campaign.id };
  } catch (error: any) {
    return { error: error.message || 'Failed to create campaign.' };
  }
}

export async function updateCampaignAction(
  prevState: CampaignActionState | undefined,
  formData: FormData
): Promise<CampaignActionState> {
  const user = await getCurrentSessionUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'EDITOR')) {
    return { error: 'Permission denied: Staff authorization required.' };
  }

  const id = formData.get('id') as string;
  const title = (formData.get('title') as string)?.trim();
  const subject = (formData.get('subject') as string)?.trim();
  const previewText = (formData.get('previewText') as string)?.trim() || null;
  const content = (formData.get('content') as string)?.trim();

  if (!id || !title || !subject || !content) {
    return { error: 'All fields are required to update campaign.' };
  }

  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });
  if (!campaign) return { error: 'Campaign not found.' };

  if (campaign.status === CampaignStatus.SENT || campaign.status === CampaignStatus.SENDING) {
    return { error: 'Cannot modify a campaign that has already been dispatched.' };
  }

  try {
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        title,
        subject,
        previewText,
        content,
      },
    });

    revalidatePath('/admin/campaigns');
    revalidatePath(`/admin/campaigns/${id}/preview`);
    return { success: true, campaignId: id };
  } catch (error: any) {
    return { error: error.message || 'Failed to update campaign.' };
  }
}

export async function deleteCampaignAction(id: string): Promise<CampaignActionState> {
  const user = await getCurrentSessionUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'EDITOR')) {
    return { error: 'Permission denied.' };
  }

  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });
  if (!campaign) return { error: 'Campaign not found.' };

  if (campaign.status === CampaignStatus.SENDING) {
    return { error: 'Cannot delete a campaign that is currently transmitting.' };
  }

  try {
    await prisma.newsletterCampaign.delete({ where: { id } });
    revalidatePath('/admin/campaigns');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete campaign.' };
  }
}

/**
 * Dispatch newsletter campaign to all active subscribers.
 * Implements atomic status locking to prevent duplicate transmission.
 */
export async function sendCampaignAction(id: string): Promise<CampaignActionState> {
  const user = await getCurrentSessionUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'EDITOR')) {
    return { error: 'Permission denied: Super Admin or Editor privileges required.' };
  }

  // 1. Concurrency and status check with atomic lock
  const lockedCampaign = await prisma.$transaction(async (tx) => {
    const target = await tx.newsletterCampaign.findUnique({ where: { id } });
    if (!target) return null;
    if (target.status !== CampaignStatus.DRAFT && target.status !== CampaignStatus.FAILED) {
      return null;
    }

    // Atomically transition to SENDING
    return tx.newsletterCampaign.update({
      where: { id },
      data: { status: CampaignStatus.SENDING },
    });
  });

  if (!lockedCampaign) {
    return { error: 'Campaign cannot be dispatched. It is either already sent, sending, or not found.' };
  }

  // 2. Query eligible active subscribers
  const activeSubscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: SubscriberStatus.ACTIVE },
    select: { id: true, email: true, unsubscribeToken: true },
  });

  if (activeSubscribers.length === 0) {
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.DRAFT,
        failureReason: 'No active subscribers found in database.',
      },
    });
    return { error: 'Cannot send campaign: There are currently no active subscribers.' };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || 'briefing@saudifuturetech.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saudifuturetech.com';

  // 3. Provider Configuration Validation
  if (!resendApiKey) {
    // Revert status to DRAFT with clear diagnostic message
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.DRAFT,
        failureReason:
          'Email provider unconfigured: RESEND_API_KEY environment variable is missing.',
      },
    });

    revalidatePath('/admin/campaigns');
    return {
      warning:
        'Live email transmission requires a valid RESEND_API_KEY in .env. Campaign remains saved as Draft. The full email template and unsubscribe footer can be previewed in the Campaign Preview screen.',
    };
  }

  // 4. Dispatch using Resend SDK
  try {
    const resend = new Resend(resendApiKey);

    // In production, batch send or send per subscriber with individualized unsubscribe link
    let dispatchedCount = 0;

    for (const sub of activeSubscribers) {
      const unsubLink = `${siteUrl}/unsubscribe?token=${sub.unsubscribeToken}`;
      const emailHtml = renderCampaignEmail({
        subject: lockedCampaign.subject,
        previewText: lockedCampaign.previewText,
        content: lockedCampaign.content,
        siteUrl,
        unsubscribeUrl: unsubLink,
      });

      try {
        await resend.emails.send({
          from: `Saudi Future Tech <${fromEmail}>`,
          to: sub.email,
          subject: lockedCampaign.subject,
          html: emailHtml,
        });
        dispatchedCount++;
      } catch (sendErr) {
        console.warn(`[Campaigns] Failed to send to ${sub.email}:`, sendErr);
      }
    }

    // 5. Update campaign status to SENT
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.SENT,
        sentAt: new Date(),
        recipientCount: dispatchedCount,
        failureReason: null,
      },
    });

    revalidatePath('/admin/campaigns');
    return { success: true, campaignId: id };
  } catch (err: any) {
    console.error('[Campaigns] Provider transmission failed:', err);
    await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.FAILED,
        failureReason: err.message || 'Email provider API error',
      },
    });

    revalidatePath('/admin/campaigns');
    return { error: `Email dispatch failed: ${err.message}` };
  }
}

