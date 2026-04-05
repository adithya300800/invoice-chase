# 💸 Invoice Chase

> AI-powered AR follow-up copilot — drafts personalized invoice follow-up emails from Gmail + QuickBooks, send with one click.

## What it does

1. **Connect Gmail + QuickBooks Online** via OAuth
2. **AI finds overdue invoices** and drafts personalized follow-up emails
3. **You review → one click send** → get paid faster

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js |
| AI | OpenAI GPT-4o-mini |
| Email | Resend |
| Hosting | Vercel (frontend) + Railway (backend) |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/adithya300800/invoice-chase
cd invoice-chase/apps/web
npm install
```

### 2. Set up environment

```bash
cp .env.local.example .env.local
# Fill in all values (see Configuration below)
```

### 3. Set up database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Gmail + Sign-in)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# QuickBooks Online OAuth
QUICKBOOKS_CLIENT_ID="..."
QUICKBOOKS_CLIENT_SECRET="..."
QUICKBOOKS_REDIRECT_URI="..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Resend (email)
RESEND_API_KEY="re_..."
FROM_EMAIL="Invoice Chase <chase@invoicechase.app>"
```

## Getting OAuth Credentials

### Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → APIs & Services → OAuth consent screen
3. Add Scopes: `gmail.readonly`, `gmail.send`
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect: `http://localhost:3000/api/auth/google`

### QuickBooks Online
1. Go to [developer.intuit.com](https://developer.intuit.com)
2. Create app → QuickBooks Online API
3. Add OAuth redirect: `http://localhost:3000/api/auth/quickbooks/callback`
4. Copy Client ID + Secret

## Deploy

### Frontend (Vercel)

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repo at [vercel.com](https://vercel.com) for auto-deploy.

### Database (Neon)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string into `DATABASE_URL`

## Architecture

```
apps/web/
├── app/
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Main dashboard
│   ├── settings/          # OAuth connections
│   └── api/
│       ├── auth/          # NextAuth routes
│       ├── invoices/      # Invoice CRUD
│       └── drafts/       # AI draft generation
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   └── auth.ts           # NextAuth config
└── prisma/
    └── schema.prisma      # Data model
```

## Data Model

```
User → Connection (Gmail/QuickBooks OAuth)
     → Invoice (from QuickBooks AR)
     → FollowUpDraft (AI-generated)
     → SentLog (sent emails)
```

## Roadmap

- [ ] Multi-user team access
- [ ] Xero integration
- [ ] Custom email templates
- [ ] Automated follow-up sequences
- [ ] Payment link in emails (Stripe)
- [ ] Mobile app

## License

MIT © 2026 Invoice Chase
