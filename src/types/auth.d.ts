import { DefaultSession } from 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id?: string;
    role?: UserRole;
    authorId?: string | null;
    isActive?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      authorId: string | null;
      isActive: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
    authorId?: string | null;
    isActive?: boolean;
  }
}

