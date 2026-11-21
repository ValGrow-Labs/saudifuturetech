# Saudi Future Tech — Database Setup Guide

**Phase:** Phase 4 (Database Foundation & Content Data Migration)  
**Database Engine:** PostgreSQL 16+  
**ORM:** Prisma 6.x  
**Node.js:** v22.16+  

---

## 1. Overview

Saudi Future Tech uses **PostgreSQL** as its primary persistence engine and **Prisma ORM** for type-safe database queries, schema declarations, and migration tracking.

This document outlines the exact commands and configurations required to set up, migrate, seed, and manage the database across development and production environments.

---

## 2. Environment Variables Configuration

Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` is configured to point to your PostgreSQL instance:

```ini
# Standard PostgreSQL TCP Connection Format
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public"

# macOS Local Unix Domain Socket Format (e.g. Homebrew PostgreSQL)
DATABASE_URL="postgresql://<USER>@localhost:5433/saudi_future_tech?host=/tmp"

# Managed Cloud Provider (Neon / Supabase / AWS RDS with SSL and PgBouncer)
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>/<DATABASE>?sslmode=require&pgbouncer=true"
```

> [!CAUTION]
> Never commit `.env` or real database credentials to Git. Keep `.env` listed in `.gitignore` at all times.

---

## 3. Database Migration Instructions

### Initial Schema Migration
To apply the baseline schema migration to a fresh PostgreSQL database:

```bash
npx prisma migrate dev --name init
```

This command:
1. Reads `prisma/schema.prisma`.
2. Connects to the database specified by `DATABASE_URL`.
3. Creates all tables (`User`, `Author`, `Category`, `Article`, `Tag`, `ArticleTag`), enums (`UserRole`, `ArticleStatus`), foreign keys, and indexes.
4. Generates the latest `@prisma/client` TypeScript types into `node_modules/@prisma/client`.

### Applying Migrations in CI/CD or Production
In production deployment pipelines (e.g., Vercel, Railway, Docker):

```bash
npx prisma migrate deploy
```

### Direct Schema Prototyping (Without Migration Files)
If prototyping in an isolated sandbox database:

```bash
npx prisma db push
```

---

## 4. Seeding Demonstration Content

The seed script (`prisma/seed.ts`) populates the database with the approved demonstration editorial archive:
- **1 Administrative User** (prepared for future Phase 5 authentication)
- **6 Core Technology Categories** (`ai-deep-tech`, `govtech`, `cybersecurity`, `smart-cities-infra`, `fintech`, `clean-energy`)
- **4 Editorial Contributor Profiles** (Tariq Al-Mansoor, Zainab Al-Husseini, Fahad Al-Khatib, Reem Al-Dossari)
- **12 In-Depth Demonstration Articles** across all 6 pillars
- **1 Unpublished DRAFT Article** (used to verify that draft content is strictly hidden from public readers)
- **60+ Normalized Taxonomy Tags** and relational join records

### Execute Seed Command
Run either npm script:

```bash
npm run db:seed
```

Or invoke Prisma directly:

```bash
npx prisma db seed
```

> [!NOTE]
> The seed script is completely **idempotent**. All records use `upsert` with unique slugs, making it safe to re-run without creating duplicate records.

---

## 5. Prisma Studio (Visual GUI)

To inspect database records, relationships, and tags in a browser interface:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`.

---

## 6. Connection Pooling & Production Considerations

1. **Serverless Scaling:** When deploying to serverless platforms like Vercel, direct PostgreSQL connections can quickly exhaust connection pools during traffic spikes. Always enable connection pooling (PgBouncer, Supabase Pooler, or Neon pooling on port 6543).
2. **Global Client Singleton:** In Next.js development with Fast Refresh (HMR), `src/lib/prisma.ts` preserves a single instance attached to `globalThis` to prevent connection leaks.

