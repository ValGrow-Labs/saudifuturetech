# Role-Based Access Control (RBAC) Permission Matrix

**System:** Saudi Future Tech Administrative Platform  
**Document:** `docs/ROLE_PERMISSION_MATRIX.md`  
**Security Model:** Three-Tier Editorial Governance  

---

## 1. Editorial Role Hierarchy

Saudi Future Tech models real-world digital newsroom operations through three distinct role tiers:

1. **`SUPER_ADMIN` (Executive Editor / Editorial Operations Lead):** Total system ownership, security policy governance, staff account provisioning, and unrestricted editorial authority across all desks.
2. **`EDITOR` (Section Editor / Desk Chief):** Editorial desk leadership, content approval, publication scheduling, and taxonomy management. Cannot alter system staff credentials.
3. **`AUTHOR` (Journalist / Columnist / Contributor):** Focused writing desk. Drafts, edits, and submits stories linked specifically to their own journalist byline. Cannot publish without editorial review.

---

## 2. Comprehensive Permission Matrix

| Module & Functional Capability | `SUPER_ADMIN` | `EDITOR` | `AUTHOR` | Enforcing Guard Function |
| :--- | :---: | :---: | :---: | :--- |
| **Authentication & Portal Access** | | | | |
| Access Admin Backstage (`/admin`) | ✅ | ✅ | ✅ | `requireAuth()` / Middleware |
| View Platform Overview & KPI Cards | ✅ | ✅ | ✅ | `requireAuth()` |
| Receive Review Queue Action Alerts | ✅ | ✅ | ❌ | Checked by role in dashboard |
| **Article Management & Publishing** | | | | |
| View All Published & Draft Articles in Grid | ✅ | ✅ | ✅ | `requireAuth()` |
| Create New Draft Article | ✅ | ✅ | ✅ | `requireAuth()` |
| Edit Own Draft Stories | ✅ | ✅ | ✅ | `canEditArticle()` |
| Edit Other Authors' Stories | ✅ | ✅ | ❌ | `canEditArticle()` |
| Select / Change Author Byline on Story | ✅ | ✅ | ❌ (Locked to Self) | `createArticleAction()` |
| Submit Story for Editorial Review (`IN_REVIEW`) | ✅ | ✅ | ✅ | `submitForReviewAction()` |
| Direct Publish Story to Production (`PUBLISHED`) | ✅ | ✅ | ❌ | `canPublishArticle()` |
| Unpublish Live Story to Draft (`DRAFT`) | ✅ | ✅ | ❌ | `canPublishArticle()` |
| Delete Own Draft Story | ✅ | ✅ | ✅ | `canDeleteArticle()` |
| Delete Published or Other Authors' Stories | ✅ | ✅ | ❌ | `canDeleteArticle()` |
| View Authenticated Canvas Preview (`/preview`) | ✅ | ✅ | ✅ (Own or Desk) | `requireAuth()` |
| **Taxonomy & Category Desks** | | | | |
| Access Categories Desk (`/admin/categories`) | ✅ | ✅ | ❌ | `requireRole(['SUPER_ADMIN', 'EDITOR'])` |
| Create / Edit Coverage Pillar Categories | ✅ | ✅ | ❌ | `canManageTaxonomy()` |
| Delete Category Pillar (Safe Deletion) | ✅ | ✅ | ❌ | `deleteCategoryAction()` |
| Access Taxonomy Tags Desk (`/admin/tags`) | ✅ | ✅ | ❌ | `requireRole(['SUPER_ADMIN', 'EDITOR'])` |
| Create, Edit, or Delete Taxonomy Tags | ✅ | ✅ | ❌ | `canManageTaxonomy()` |
| **Contributor Byline Management** | | | | |
| Access Authors Desk (`/admin/authors`) | ✅ | ✅ | ❌ | `requireRole(['SUPER_ADMIN', 'EDITOR'])` |
| Create New Contributor Profile | ✅ | ✅ | ❌ | `canManageAuthors()` |
| Edit Journalist Bios, Avatars & Social Links | ✅ | ✅ | ❌ | `canManageAuthors()` |
| Delete Contributor Profile (Safe Deletion) | ✅ | ✅ | ❌ | `deleteAuthorAction()` |
| **Staff & User Administration** | | | | |
| Access Staff & Roles Desk (`/admin/users`) | ✅ | ❌ | ❌ | `requireRole(['SUPER_ADMIN'])` |
| Provision New Staff User Accounts | ✅ | ❌ | ❌ | `canManageUsers()` |
| Assign or Change User Roles (`SUPER_ADMIN`, etc.) | ✅ | ❌ | ❌ | `canManageUsers()` |
| Link User Account to Journalist Byline | ✅ | ❌ | ❌ | `canManageUsers()` |
| Activate / Deactivate Staff User Accounts | ✅ | ❌ | ❌ | `toggleUserActiveAction()` |
| Self-Deactivation or Self-Demotion Safeguard | 🛡️ Blocked | — | — | Hard-coded self-protection in action |
| Delete Staff Account (Cannot Delete Self) | ✅ | ❌ | ❌ | `deleteUserAction()` |

---

## 3. Enforcement Implementation

All authorization checks are evaluated **server-side**:

1. **Route Level:** `requireAuth()` and `requireRole()` enforce route accessibility in server components.
2. **Mutation Level:** Server actions in `src/actions/` re-evaluate `canEditArticle()`, `canPublishArticle()`, and `canManageUsers()` directly against verified session user data prior to executing any Prisma query.
3. **Database Level:** Foreign key relationships and cascade constraints ensure data integrity (e.g. deleting an author profile with assigned articles is prevented by database restriction).

