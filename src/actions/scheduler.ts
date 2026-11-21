'use server';

import { getCurrentSessionUser, canPublishArticle } from '@/lib/auth/guard';
import { publishScheduledArticles, SchedulerExecutionResult } from '@/lib/scheduler/publisher';

export interface TriggerSchedulerState {
  success?: boolean;
  error?: string;
  result?: SchedulerExecutionResult;
}

/**
 * Manually trigger the publishing scheduler from the admin dashboard or articles view.
 * Restricted to Editors and Super Admins.
 */
export async function triggerScheduledPublisherAction(): Promise<TriggerSchedulerState> {
  const user = await getCurrentSessionUser();
  if (!user || !canPublishArticle(user)) {
    return { error: 'Permission denied: Only Editors and Super Admins can trigger the publishing scheduler.' };
  }

  try {
    const result = await publishScheduledArticles();
    return {
      success: true,
      result,
    };
  } catch (error: any) {
    console.error('[SchedulerAction] Manual trigger failed:', error);
    return {
      error: error.message || 'Failed to execute publishing scheduler.',
    };
  }
}

