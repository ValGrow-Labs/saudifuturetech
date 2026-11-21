import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@prisma/client';

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isLoginPage = nextUrl.pathname === '/admin/login';

      if (isOnAdmin && !isLoginPage) {
        if (!isLoggedIn) {
          return false; // Automatically redirects to /admin/login
        }
        if (auth?.user?.isActive === false) {
          return false;
        }
        return true;
      } else if (isLoginPage && isLoggedIn && auth?.user?.isActive !== false) {
        return Response.redirect(new URL('/admin', nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.authorId = user.authorId;
        token.isActive = user.isActive;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.authorId = (token.authorId as string | null) ?? null;
        session.user.isActive = (token.isActive as boolean) ?? true;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
