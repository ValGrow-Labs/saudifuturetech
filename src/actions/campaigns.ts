'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/guard';
import { CampaignStatus, SubscriberStatus } from '@prisma/client';
import { Resend } from 'resend';

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

    // Format HTML email
    const paragraphs = lockedCampaign.content.split(/\n\s*\n/).filter(Boolean);
    const bodyHtml = paragraphs.map((p) => `<p style="margin-bottom: 16px; line-height: 1.6; color: #333333;">${p.replace(/\n/g, '<br/>')}</p>`).join('');

    // In production, batch send or send per subscriber with individualized unsubscribe link
    let dispatchedCount = 0;

    for (const sub of activeSubscribers) {
      const unsubLink = `${siteUrl}/unsubscribe?token=${sub.unsubscribeToken}`;
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 4px; overflow: hidden;">
          <div style="background-color: #25282B; padding: 24px 32px; border-bottom: 3px solid #F4C542;">
            <div style="display: inline-block; background: #F4C542; color: #25282B; font-weight: 900; font-size: 14px; padding: 4px 8px; border-radius: 2px; margin-bottom: 8px;">SAUDI FUTURE TECH</div>
            <h1 style="color: #F5F6F3; font-size: 20px; margin: 0; font-weight: 800;">${lockedCampaign.subject}</h1>
            ${lockedCampaign.previewText ? `<p style="color: #8C96A0; font-size: 13px; margin: 6px 0 0 0;">${lockedCampaign.previewText}</p>` : ''}
          </div>
          <div style="padding: 32px; font-size: 15px;">
            ${bodyHtml}
          </div>
          <div style="background: #F5F6F3; padding: 20px 32px; font-size: 11px; color: #666666; border-top: 1px solid #e5e5e5;">
            <p style="margin: 0 0 8px 0;">You received this briefing because you subscribed to Saudi Future Tech executive intelligence.</p>
            <p style="margin: 0;"><a href="${unsubLink}" style="color: #666666; text-decoration: underline;">Unsubscribe from future briefings</a> | <a href="${siteUrl}/privacy" style="color: #666666; text-decoration: underline;">Privacy Policy</a></p>
          </div>
        </div>
      `;

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

