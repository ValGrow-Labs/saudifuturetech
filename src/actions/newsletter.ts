'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/guard';
import { checkNewsletterRateLimit, recordNewsletterAttempt } from '@/lib/newsletter/rate-limit';
import { SubscriberStatus } from '@prisma/client';

export interface NewsletterSubscriptionState {
  success?: boolean;
  message?: string;
  error?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Public action: Subscribe to newsletter with email validation and explicit consent.
 */
export async function subscribeNewsletterAction(
  prevState: NewsletterSubscriptionState | undefined,
  formData: FormData
): Promise<NewsletterSubscriptionState> {
  const rawEmail = formData.get('email') as string;
  const consent = formData.get('consent');

  if (!rawEmail || typeof rawEmail !== 'string') {
    return { error: 'Please enter a valid email address.' };
  }

  const email = rawEmail.trim().toLowerCase();

  // 1. Email format validation
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return { error: 'Please enter a valid corporate or personal email address.' };
  }

  // 2. Explicit consent check
  const hasConsent = consent === 'on' || consent === 'true' || consent === '1';
  if (!hasConsent) {
    return { error: 'You must agree to receive the executive briefing to subscribe.' };
  }

  // 3. Shared persistent rate limiting check (email + client IP)
  let clientIp: string | undefined;
  try {
    const headerList = await headers();
    clientIp =
      headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerList.get('x-real-ip') ||
      undefined;
  } catch {
    // If running in test harness where next/headers is not mounted
    clientIp = undefined;
  }

  const rateLimit = await checkNewsletterRateLimit(email, clientIp);
  if (!rateLimit.allowed) {
    return {
      error: `Too many subscription attempts. Please wait ${rateLimit.waitMinutes} minutes before trying again.`,
    };
  }
  await recordNewsletterAttempt(email, clientIp);

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === SubscriberStatus.ACTIVE) {
        return {
          success: true,
          message: 'You are already subscribed to the Saudi Future Tech Executive Briefing.',
        };
      }

      // Reactivate unsubscribed reader
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          status: SubscriberStatus.ACTIVE,
          consentGivenAt: new Date(),
          unsubscribedAt: null,
        },
      });

      revalidatePath('/admin/subscribers');
      return {
        success: true,
        message: 'Welcome back! Your subscription to the Executive Briefing has been reactivated.',
      };
    }

    // New Subscriber
    const unsubscribeToken = crypto.randomUUID();

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        status: SubscriberStatus.ACTIVE,
        consentGivenAt: new Date(),
        unsubscribeToken,
      },
    });

    revalidatePath('/admin/subscribers');
    return {
      success: true,
      message: 'Thank you for subscribing to Saudi Future Tech. You will receive our weekly intelligence dispatch.',
    };
  } catch (error: any) {
    console.error('[NewsletterAction] Subscription failed:', error);
    return {
      error: 'Unable to process subscription right now. Please try again later.',
    };
  }
}

/**
 * Public action: Unsubscribe using secure token
 */
export async function unsubscribeNewsletterAction(
  token: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Invalid or missing unsubscribe token.' };
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token.trim() },
    });

    if (!subscriber) {
      return { success: false, error: 'Unsubscribe link is invalid or has expired.' };
    }

    if (subscriber.status === SubscriberStatus.UNSUBSCRIBED) {
      return { success: true, email: subscriber.email };
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: SubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    });

    revalidatePath('/admin/subscribers');
    return { success: true, email: subscriber.email };
  } catch (error: any) {
    console.error('[NewsletterAction] Unsubscribe failed:', error);
    return { success: false, error: 'Failed to process unsubscription. Please try again.' };
  }
}

/**
 * Staff Action: Toggle Subscriber Status (Admin / Editor)
 */
export async function toggleSubscriberStatusAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentSessionUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'EDITOR')) {
    return { success: false, error: 'Permission denied: Staff authorization required.' };
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    });

    if (!subscriber) return { success: false, error: 'Subscriber not found.' };

    const newStatus =
      subscriber.status === SubscriberStatus.ACTIVE
        ? SubscriberStatus.UNSUBSCRIBED
        : SubscriberStatus.ACTIVE;

    await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        status: newStatus,
        unsubscribedAt: newStatus === SubscriberStatus.UNSUBSCRIBED ? new Date() : null,
      },
    });

    revalidatePath('/admin/subscribers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update subscriber status.' };
  }
}

/**
 * Staff Action: Delete Subscriber (Admin / Editor)
 */
export async function deleteSubscriberAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentSessionUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'EDITOR')) {
    return { success: false, error: 'Permission denied: Staff authorization required.' };
  }

  try {
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    revalidatePath('/admin/subscribers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete subscriber.' };
  }
}
