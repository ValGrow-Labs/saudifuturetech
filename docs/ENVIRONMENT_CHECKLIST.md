# Saudi Future Tech — Environment & Credentials Checklist

**Document Version:** 1.0.0  
**Phase:** Phase 0 (Discovery & Architecture)  
**Status:** Approved Operational Checklist  

---

## 1. Required External Accounts & Access Inventory

Before implementation proceeds into Phase 4 (Database), Phase 6 (Publishing & Media), and Phase 8 (Production Deployment), the following external services and access rights must be provisioned by the project stakeholders.

| Service / Resource | Purpose | Required By Phase | Status / Action Item |
| :--- | :--- | :--- | :--- |
| **Domain Registrar** | Access to DNS management for `saudifuturetech.com` | Phase 8 | **Pending:** Registrar credentials or nameserver delegation required. |
| **Hosting Platform (Vercel)** | Next.js application hosting, Edge CDN, and SSL certificates | Phase 1 / Phase 8 | **Pending:** Vercel team/account setup required. |
| **Managed PostgreSQL** | Relational database (Neon, Supabase, or AWS RDS) | Phase 4 | **Pending:** PostgreSQL 16+ instance with connection pooling needed. |
| **Media CDN (Cloudinary)** | Cloudinary account for signed direct image uploads and transformations | Phase 5 / Phase 6 | **Pending:** Cloud name, API Key, and API Secret needed. |
| **Transactional Email (Resend)**| Double opt-in newsletter confirmation and editorial alerts | Phase 6 | **Pending:** Resend account and DNS domain verification for sender. |
| **Error Monitoring (Sentry)** | Real-time crash reporting and performance tracing | Phase 7 | **Optional / Recommended:** DSN token. |

---

## 2. Environment Variables Specification (`.env.example`)

The following variables are required to configure the application in local development and production environments.

```bash
# ==============================================================================
# SAUDI FUTURE TECH — ENVIRONMENT VARIABLES TEMPLATE
# Copy to .env.local for local development. Never commit sensitive keys to git!
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. APPLICATION & CANONICAL DOMAIN CONFIGURATION
# ------------------------------------------------------------------------------
# In local development: http://localhost:3000
# In production: https://saudifuturetech.com
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Saudi Future Tech"
NEXT_PUBLIC_SITE_TAGLINE="The Future Is Being Built Today."

# ------------------------------------------------------------------------------
# 2. DATABASE (PostgreSQL 16+ via Prisma ORM)
# ------------------------------------------------------------------------------
# Connection string with connection pooling (e.g., PgBouncer / Neon pooler)
DATABASE_URL="postgresql://user:password@pooler.region.neon.tech/sft_db?sslmode=require&pgbouncer=true"

# Direct connection string for executing Prisma schema migrations
DIRECT_URL="postgresql://user:password@ep-direct.region.neon.tech/sft_db?sslmode=require"

# ------------------------------------------------------------------------------
# 3. AUTHENTICATION (Auth.js / NextAuth v5)
# ------------------------------------------------------------------------------
# Generate with: openssl rand -base64 33
AUTH_SECRET="your-super-secret-random-32-char-key-here"

# Canonical auth URL
AUTH_URL="http://localhost:3000"

# Trust host in serverless/edge environments
AUTH_TRUST_HOST="true"

# Initial Super Admin Seed Credentials (used only during prisma db seed)
INITIAL_ADMIN_EMAIL="admin@saudifuturetech.com"
INITIAL_ADMIN_PASSWORD="CHANGE_ME_IN_PRODUCTION_SECURE_PASSWORD"
INITIAL_ADMIN_NAME="Chief Technology Editor"

# ------------------------------------------------------------------------------
# 4. MEDIA & IMAGE CDN (Cloudinary)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# ------------------------------------------------------------------------------
# 5. TRANSACTIONAL EMAIL & NEWSLETTER (Resend API)
# ------------------------------------------------------------------------------
RESEND_API_KEY="re_1234567890abcdef"
NEWSLETTER_FROM_EMAIL="newsletter@saudifuturetech.com"
EDITORIAL_CONTACT_EMAIL="editorial@saudifuturetech.com"

# ------------------------------------------------------------------------------
# 6. CRON WORKER SECURITY
# ------------------------------------------------------------------------------
# Secret token to authenticate scheduled publishing cron endpoint (/api/cron/publish)
CRON_SECRET="your-random-cron-secret-token"

# ------------------------------------------------------------------------------
# 7. ANALYTICS & MONITORING (Optional / Phase 7)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="saudifuturetech.com"
NEXT_PUBLIC_SENTRY_DSN=""
```

---

## 3. DNS Configuration Plan for `saudifuturetech.com`

When registrar access is obtained in Phase 8, the following DNS records will be configured:

| Record Type | Host / Name | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (Apex) | `76.76.21.21` (Vercel Anycast IP) | 3600 | Apex domain routing |
| **CNAME** | `www` | `cname.vercel-dns.com.` | 3600 | Subdomain redirect to apex |
| **TXT** | `@` | `resend._domainkey...` | 3600 | SPF / DKIM verification for newsletter delivery |
| **CNAME** | `resend._domainkey` | `dkim.resend.com.` | 3600 | Resend email authentication |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine;` | 3600 | Email deliverability & anti-spoofing policy |

---

## 4. Operational Secrets Management Rules

1. **Strictly No Secrets in Git:**
   * `.env`, `.env.local`, `.env.production` are strictly ignored via `.gitignore`.
   * Any developer or agent who commits a plain-text secret must immediately invalidate and rotate the credential.
2. **Encrypted Production Storage:**
   * All production environment variables will be injected via Vercel’s encrypted environment variable dashboard.
   * Preview deployments will utilize isolated staging database credentials to prevent test operations from polluting production records.
3. **Database Access Security:**
   * Production PostgreSQL will require SSL connection (`sslmode=require`).
   * Direct connection ports will be firewalled, allowing incoming traffic exclusively from Vercel edge function IP ranges or secured via SSL certificate verification.

