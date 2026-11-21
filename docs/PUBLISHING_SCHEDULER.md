# Publishing Scheduler Architecture & Automation Guide

**Saudi Future Tech** — [https://saudifuturetech.com](https://saudifuturetech.com)  
**Publication Focus:** Technology news, sovereign computing, AI, and Vision 2030 developments.  
**System Component:** Automated Future Article Publishing Engine

---

## 1. Overview & Architecture

The Saudi Future Tech Publishing Scheduler enables editors to schedule article drops in advance (e.g., synchronized with morning press embargoes, regional conference announcements, or Riyadh market open).

Articles configured for scheduled release are maintained in the database with status `SCHEDULED` and a `scheduledFor` UTC timestamp. When the target time arrives, the scheduling engine atomically transitions the article to `PUBLISHED`, clears the `scheduledFor` date, sets `publishedAt`, logs an audit entry, and purges public Next.js caches.

```mermaid
flowchart TD
    A["Scheduled Article in DB<br/>status: SCHEDULED, scheduledFor: T"] --> B["Cron Job Trigger<br/>(Vercel Cron / External HTTP Worker)"]
    B --> C["/api/cron/publish-scheduled<br/>(Verifies Bearer CRON_SECRET)"]
    C --> D["publishScheduledArticles() Core Function"]
    D --> E{"Query Eligible Articles<br/>status == SCHEDULED && scheduledFor <= now()"}
    E -->|Found >= 1| F["Run Prisma $transaction per article"]
    E -->|None due| G["Return { processed: 0, published: 0 }"]
    F --> H["Conditional Update<br/>where: { id, status: SCHEDULED }"]
    H --> I["Log Review History Audit Entry"]
    I --> J["Revalidate Next.js Paths<br/>/, /latest, /article/[slug]"]
    J --> K["Return Execution Summary Report"]
```

---

## 2. Concurrency Safety & Race Condition Prevention

In high-concurrency environments or when redundant cron workers fire simultaneously, duplicate publishing or conflicting state transitions must be mathematically impossible.

To guarantee this:
1. **Isolated Database Transactions:** Each due article is updated inside an independent `prisma.$transaction`.
2. **Conditional Count Check (`updateMany`):**
   ```typescript
   const updateResult = await tx.article.updateMany({
     where: {
       id: article.id,
       status: ArticleStatus.SCHEDULED, // Concurrency guard
     },
     data: {
       status: ArticleStatus.PUBLISHED,
       publishedAt: now,
       scheduledFor: null,
     },
   });

   if (updateResult.count === 0) {
     // A concurrent process already published this article
     return false;
   }
   ```
   If two cron triggers evaluate the same article at the exact same millisecond, only the first transaction increments the update count; the second observes `count === 0` and exits safely without creating duplicate audit records or executing redundant cache clears.

---

## 3. Invocation Interfaces

### 3.1. Protected HTTP Endpoint (`/api/cron/publish-scheduled`)
- **HTTP Methods:** `GET`, `POST`
- **Authentication:**
  1. Header: `Authorization: Bearer <CRON_SECRET>`
  2. URL Query Param: `?key=<CRON_SECRET>`
  3. Session: Authenticated `SUPER_ADMIN` or `EDITOR` session cookie
- **Sample Request:**
  ```bash
  curl -X GET https://saudifuturetech.com/api/cron/publish-scheduled \
    -H "Authorization: Bearer saudi_future_tech_cron_secret_vision2030_secure_key"
  ```
- **Sample Response (200 OK):**
  ```json
  {
    "success": true,
    "timestamp": "2026-11-15T08:40:00.000Z",
    "processed": 1,
    "published": 1,
    "failed": 0,
    "publishedArticles": [
      {
        "id": "cm3e...",
        "title": "Saudi Space Agency Low-Earth Orbit Constellation",
        "slug": "falcon-heavy-payload-satellite-constellation"
      }
    ],
    "errors": []
  }
  ```

### 3.2. Manual Staff Trigger in Admin Backstage
Editors and administrators can trigger an immediate check directly from the Admin interface:
- **Button:** `Run Scheduler Now` (located on `/admin` and `/admin/articles`)
- **Action:** `triggerScheduledPublisherAction()` server action
- **Feedback:** Immediate inline badge indicating how many articles were published or whether the pipeline is clear.

---

## 4. Production Cron Configuration

### Vercel Cron Configuration (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "* * * * *"
    }
  ]
}
```
*Note: Vercel automatically sends the `CRON_SECRET` environment variable in the `Authorization` header on every invocation.*

### Linux / Crontab Configuration
```crontab
* * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://saudifuturetech.com/api/cron/publish-scheduled > /dev/null 2>&1
```

