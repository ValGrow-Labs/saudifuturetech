'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export interface LoginActionResult {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: LoginActionResult | undefined,
  formData: FormData
): Promise<LoginActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const callbackUrl = (formData.get('callbackUrl') as string) || '/admin';

  if (!email || !password) {
    return { error: 'Please provide both email address and password.' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl.startsWith('/admin') ? callbackUrl : '/admin',
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      const customMessage = (error as any).cause?.err?.message;
      if (customMessage) {
        return { error: customMessage };
      }
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password credentials. Please verify and try again.' };
        default:
          return { error: 'Authentication failed. Please verify credentials or contact administrator.' };
      }
    }

    // Next.js redirection throws an internal error (NEXT_REDIRECT) which must be rethrown
    const isRedirect = (error as any)?.digest?.startsWith('NEXT_REDIRECT') || (error as any)?.message === 'NEXT_REDIRECT';
    if (isRedirect) {
      throw error;
    }

    console.error('[AuthAction] Unexpected login failure:', error);
    return { error: 'An unexpected authentication error occurred. Please try again.' };
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/login' });
}

