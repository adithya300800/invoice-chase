# Invoice Chase / AR Follow-Up Copilot

## 1. Concept & Vision

**Invoice Chase** connects to Gmail and QuickBooks Online, finds overdue invoices, and uses AI to draft personalized follow-up emails — sent with one click.

**Core pitch:** "Stop chasing overdue invoices manually. We draft the emails, you send them."

**Personality:** Professional, warm, confident. Not aggressive collections — friendly reminders that get you paid.

---

## 2. Target Customer

- Bookkeepers managing 10-50 client accounts
- Fractional CFOs at 5-30 person companies
- Agency owners with recurring invoicing
- US-focused (QuickBooks Online is US-centric)

**Willing to pay:** $149/mo

---

## 3. Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js API Routes (serverless)
- **Database:** Neon PostgreSQL
- **ORM:** Prisma
- **LLM:** OpenAI GPT-4o-mini
- **Email:** Resend
- **Auth:** NextAuth.js
- **Hosting:** Vercel

---

## 4. Data Model

```
User: id, email, name, createdAt
Connection: id, userId, provider (gmail|quickbooks), accessToken, refreshToken, expiresAt, status
Invoice: id, userId, connectionId, clientName, invoiceNumber, amount, issueDate, dueDate, status (pending|overdue|paid), quickbooksId
FollowUpDraft: id, invoiceId, draftedAt, emailBody, tone, status (draft|sent|ignored)
SentLog: id, followUpDraftId, sentAt, recipientEmail, subject
```

---

## 5. Pages

- `/` — Landing page
- `/dashboard` — Main invoice dashboard
- `/settings` — OAuth connections
- `/api/*` — API routes

---

## 6. Build Phases

1. Repo + Landing Page + Auth
2. Database + Schema
3. OAuth Integrations
4. Dashboard + Follow-up Composer
5. LLM + Email
6. Deploy + Launch

---

## 7. Pricing

- $149/mo
- 30-day free trial
- First 5 users: 50% lifetime discount ($75/mo)
