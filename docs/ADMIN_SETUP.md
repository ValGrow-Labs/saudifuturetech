# Saudi Future Tech — Super Administrator Setup & Operations Guide

**System:** Super Administrator Backstage Console  
**Document:** `docs/ADMIN_SETUP.md`  
**Security Tier:** Platform Governance & System Administration  

---

## 1. System Requirements & Prerequisites

Prior to initializing or provisioning the Saudi Future Tech CMS platform, ensure the following dependencies are installed and running:

- **Node.js:** `>= 20.0.0` (Node.js v22.16.0 verified)
- **Database:** PostgreSQL 16
- **Package Manager:** `npm`

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env` and configure the following parameters:

```bash
# Relational Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/saudi_future_tech"

# NextAuth / Auth.js Encryption Secret (Generate with: openssl rand -base64 32)
AUTH_SECRET="your-32-character-random-secret"

# Host URL for session validation
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

> [!IMPORTANT]
> The `AUTH_SECRET` is used to encrypt JWT session cookies. Never expose this secret or commit it to version control.

---

## 3. Database Initialization & Migrations

Deploy all Prisma database migrations to apply the relational schema:

```bash
# Apply migrations non-interactively to PostgreSQL
npx prisma migrate deploy

# Generate the TypeScript Prisma Client
npx prisma generate
```

To seed the core editorial pillars, contributor profiles, taxonomy tags, demonstration stories, and baseline staff accounts:

```bash
npm run db:seed
```

---

## 4. Super Admin Provisioning via CLI

If you are setting up a fresh environment or need to recover administrative access, execute the dedicated administrative bootstrap CLI:

```bash
npm run db:admin
```

### Custom Credentials via Environment Variables:
```bash
ADMIN_EMAIL="ops@saudifuturetech.com" \
ADMIN_PASSWORD="YourStrongSecurePassword2026!" \
ADMIN_NAME="Chief Technology Officer" \
npm run db:admin
```

This script will safely upsert the user record in PostgreSQL, hash the password using bcrypt with 12 salt rounds, assign the `SUPER_ADMIN` role, and activate the account.

---

## 5. Staff Management & Governance (`/admin/users`)

Super Administrators can manage all staff credentials directly from the backstage console:

1. Navigate to **Users & Roles** (`/admin/users`).
2. **Provisioning New Accounts:**
   - Click **Create Staff Account**.
   - Enter full name, corporate email address, initial password (min 8 characters), and assign an RBAC tier (`SUPER_ADMIN`, `EDITOR`, or `AUTHOR`).
   - If provisioning an author, select their verified contributor byline to link their writing desk.
3. **Deactivating Staff Members:**
   - Click the green **Active** badge next to any user to toggle their status to **Deactivated**.
   - Thanks to real-time database checks in server guards, deactivated users are barred immediately upon their next request without waiting for session token expiration.
4. **Built-in Administrative Safeguards:**
   - Super Administrators are prevented from deactivating their own active account.
   - Super Administrators are prevented from deleting their own account or demoting their own role.

---

## 6. Production Security Checklist

- [x] Enforce HTTPS in production so `__Secure-authjs.session-token` cookies are transmitted only over encrypted TLS channels.
- [x] Configure strong, random `AUTH_SECRET` (minimum 32 bytes).
- [x] Ensure PostgreSQL port (5432 / 5433) is not exposed to the public internet.
- [x] Verify rate limiting in `LoginAttempt` is operational to neutralize brute-force attacks.
- [x] Regularly audit staff accounts in `/admin/users` and deactivate former contributors.

