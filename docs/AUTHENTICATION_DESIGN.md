# Saudi Future Tech — Authentication & Security Architecture

**Document:** `docs/AUTHENTICATION_DESIGN.md`  
**System:** Saudi Future Tech Administrative Platform  
**Target Domain:** [https://saudifuturetech.com](https://saudifuturetech.com)  
**Security Standard:** Zero-Trust Editorial Backstage  

---

## 1. Overview & Security Principles

The Saudi Future Tech content management system provides authorized journalists, editors, and administrative directors with backstage access to manage national technology coverage. To safeguard editorial integrity, the platform implements a layered defense-in-depth security model:

1. **Zero-Trust Server Verification:** Authentication credentials and session tokens are strictly validated on the server. Client-provided tokens or role claims are never trusted implicitly.
2. **Brute-Force & Enumeration Mitigation:** Login attempts are metered in PostgreSQL, automatically locking out aggressive attack patterns while providing uniform failure responses to prevent user enumeration.
3. **Instant Account Revocation:** When an account is marked inactive (`isActive: false`), all active sessions are barred immediately upon their next server request without waiting for token expiry.
4. **Credential Isolation:** Passwords are never stored in plain text. Hashes use adaptive bcrypt key stretching with 12 rounds of salt.

---

## 2. Authentication Engine & Session Lifecycle

### 2.1. Framework & Libraries
- **Auth.js v5 (`next-auth@5.0.0-beta.32`):** Modern authentication engine designed for Next.js App Router and Edge runtime.
- **Provider:** `CredentialsProvider` configured in [`src/auth.ts`](file:///Users/rishivarma/saudi-future-tech/src/auth.ts).
- **Session Strategy:** Encrypted JSON Web Token (`strategy: "jwt"`).

### 2.2. Session Token Specifications
- **Cookie Name:**
  - Production (HTTPS): `__Secure-authjs.session-token`
  - Localhost (HTTP): `authjs.session-token`
- **Security Flags:**
  - `HttpOnly`: True (prevents JavaScript execution and XSS extraction).
  - `SameSite`: `Lax` (mitigates Cross-Site Request Forgery / CSRF while permitting top-level navigation).
  - `Secure`: True in production environments.
  - `Path`: `/`
  - `Max-Age`: 2,592,000 seconds (30 days).

### 2.3. JWT Payload Structure
The session token encapsulates the user's verified identity:
```typescript
interface JWT {
  id: string;               // Database user ID (CUID)
  email: string;            // User email
  name: string;             // User display name
  role: UserRole;           // SUPER_ADMIN | EDITOR | AUTHOR
  authorId: string | null;  // Linked contributor profile ID
  isActive: boolean;        // Active status at token issuance
}
```

---

## 3. Password Security & Storage

### 3.1. Hashing Algorithm
- **Algorithm:** `bcrypt` (via `bcryptjs`).
- **Cost Factor / Salt Rounds:** `12` rounds (approximately 250-300ms compute latency per attempt, sufficient to defeat offline dictionary and GPU rainbow table attacks).
- **Password Constraints:** Minimum 8 characters.

### 3.2. Verification Routine
Implemented in [`src/lib/auth/password.ts`](file:///Users/rishivarma/saudi-future-tech/src/lib/auth/password.ts):
```typescript
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}
```

---

## 4. Brute-Force Rate Limiting Engine

To prevent automated credential stuffing and dictionary attacks against staff accounts, the platform tracks authentication attempts using the `LoginAttempt` PostgreSQL table.

### 4.1. Lockout Parameters
- **Identifier:** Lowercase normalized email (`test@example.com`).
- **Lockout Threshold:** 5 consecutive failed attempts.
- **Lockout Window:** 15 minutes (900,000 ms).
- **Reset Trigger:** Successful password authentication resets the failed attempts counter to 0.

### 4.2. Verification Flow
1. **Pre-Authentication Check:** Prior to executing database queries or bcrypt comparisons, `checkRateLimit(email)` queries the `LoginAttempt` table:
   - If `lockedUntil` is in the future, the request is rejected with a rate limit error showing the remaining cooldown minutes.
   - If `lockedUntil` has elapsed, the lockout state is cleared.
2. **Credential Evaluation:** If password verification fails:
   - `recordFailedAttempt(email)` increments `failedAttempts`.
   - If `failedAttempts >= 5`, `lockedUntil` is set to `now() + 15 minutes`.
3. **Success Routine:** When credentials match:
   - `resetFailedAttempts(email)` resets `failedAttempts: 0` and `lockedUntil: null`.

---

## 5. Instant Deactivation Architecture

Unlike traditional stateless JWT systems where revoked users remain logged in until token expiration, Saudi Future Tech employs a **Zero-Trust Server Auth Guard** in [`src/lib/auth/guard.ts`](file:///Users/rishivarma/saudi-future-tech/src/lib/auth/guard.ts):

```typescript
export async function getCurrentSessionUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Real-time verification against PostgreSQL
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, authorId: true, isActive: true },
  });

  if (!dbUser || !dbUser.isActive) {
    return null; // Immediately drops revoked sessions
  }

  return dbUser;
}
```

When an administrator toggles an account to `Inactive` in `/admin/users`, the deactivated user's subsequent requests immediately fail authorization without delay.

---

## 6. Route Protection Architecture

Administrative access is gated across two complementary boundaries:

1. **Edge Middleware (`src/middleware.ts`):**
   - Intercepts requests matching `/admin` and `/admin/:path*`.
   - Inspects the encrypted session token.
   - If unauthenticated, redirects to `/admin/login?callbackUrl=<requested_path>`.
   - Excludes public routes (`/`, `/article/*`, `/category/*`, `/search`, etc.) and static assets.
2. **Server Action & Component Guards (`src/lib/auth/guard.ts`):**
   - `requireAuth()`: Guarantees authenticated session on server page render.
   - `requireRole(['SUPER_ADMIN', 'EDITOR'])`: Restricts sensitive operations (taxonomy, users, publishing) to authorized roles.
   - Granular permission checks: `canEditArticle()`, `canPublishArticle()`, `canDeleteArticle()`, `canManageUsers()`.

