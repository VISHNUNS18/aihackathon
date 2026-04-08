# CX Intelligence Panel

An AI-powered support dashboard for CookieYes CX agents. Load a Zendesk ticket, run a multi-step skill pipeline (account lookup, billing check, site debug, docs, AI draft), and action it — raise a Jira bug, escalate to Slack, send a reply — all from one interface.

---

## Architecture

```
CX Intelligence Panel/        ← monorepo root (npm workspaces)
├── frontend/                 ← React 18 + TypeScript + Vite  (port 5173)
├── backend/                  ← Express + TypeScript           (port 4000)
├── .env.example              ← environment variable template
├── CLAUDE.md                 ← AI assistant context file
└── package.json              ← root scripts (concurrently)
```

Frontend proxies all `/api/*` requests to `localhost:4000` via Vite config — no CORS issues in dev.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend UI | React 18, TypeScript, Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| Build | Vite 5 |
| Backend | Express 4, TypeScript, Node.js |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| Auth | JWT (Bearer tokens) |
| Database | MongoDB via Mongoose (optional) |
| Icons | Lucide React |
| HTTP client | Axios |

---

## Prerequisites

- Node.js 18+
- npm 9+
- A `.env` file (copy from `.env.example`)

---

## Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd "CX Intelligence panel"
npm install

# 2. Configure environment
cp .env.example .env
# Fill in values — see Environment Variables section below

# 3. Start both servers
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000  
Health check: http://localhost:4000/health

---

## Scripts

```bash
npm run dev              # start frontend + backend concurrently
npm run dev:frontend     # frontend only
npm run dev:backend      # backend only
npm run build            # type-check + build frontend to dist/
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Frontend
VITE_API_BASE_URL=http://localhost:4000
VITE_ANTHROPIC_API_KEY=sk-ant-xxxx
VITE_APP_ENV=development

# Backend
PORT=4000
JWT_SECRET=change-me-in-production
ALLOWED_ORIGINS=http://localhost:5173

# Zendesk
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=agent@cookieyes.com
ZENDESK_API_TOKEN=xxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Jira
JIRA_BASE_URL=https://cookieyes.atlassian.net
JIRA_EMAIL=dev@cookieyes.com
JIRA_API_TOKEN=xxxx
JIRA_PROJECT_KEY=CY

# Slack
SLACK_BOT_TOKEN=xoxb-xxxx
SLACK_BUGS_CHANNEL=#cx-bugs
SLACK_ALERTS_CHANNEL=#cx-alerts

# MongoDB (optional)
MONGODB_URI=mongodb://localhost:27017/cxpanel
```

> All integrations have **demo/mock fallbacks** when credentials are absent — the app runs without any API keys for testing.

---

## Skill Pipeline

When a ticket is loaded, up to 8 skills run automatically in an optimised parallel schedule:

| # | Skill | Trigger | What it does |
|---|---|---|---|
| 1 | Zendesk Loader | Always | Fetches ticket + full conversation thread |
| 2 | Account Lookup | Always | Resolves customer account, plan, domain |
| 3 | Stripe Billing | Billing tickets | Subscriptions, invoices, refund eligibility |
| 4 | Site Debugger | Technical tickets | Banner check, plugin conflicts |
| 5 | Docs Lookup | Always | Matches relevant CookieYes documentation |
| 6 | Jira | Manual (confirmed bug) | Raise bug, notify Slack, link ticket |
| 7 | AI Analyser | Always (last) | Claude-powered analysis + draft reply |
| 8 | Cert Lookup | Cert request tickets | Searches Google Drive for certificates |

**Execution order** (optimised for speed):

```
Stage 1:  Skill 1 (Zendesk)
Stage 2:  Skill 2 (Account) + Skill 5 (Docs)   ← parallel
Stage 3:  Skill 3 (Stripe)  + Skill 4 (Debug)   ← parallel, needs account
Stage 4:  Skill 7 (AI)      + Skill 8 (Cert)    ← parallel, AI throttled
Skill 6:  Manual only — triggered by agent via "Raise Bug" button
```

Multiple tickets run simultaneously. Claude calls are self-throttled via a semaphore (`maxConcurrent` in ticketQueueStore).

---

## Key Frontend Files

```
frontend/src/
├── pages/
│   ├── Dashboard.tsx          # Home — recent tickets, metrics
│   ├── TicketDesk.tsx         # Main ticket view with skill pipeline
│   ├── TicketHistory.tsx      # Processed ticket log
│   ├── TeamView.tsx           # Team overview
│   └── Settings.tsx           # Agent settings, tone preferences
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx       # Sidebar + layout wrapper
│   │   └── Header.tsx         # Top bar — jump-to-ticket search
│   ├── ticket/
│   │   ├── SkillsPipeline.tsx # Pipeline progress bar + Raise Bug / Escalate buttons
│   │   ├── TicketHeader.tsx   # Ticket subject, requester, tags
│   │   └── ConversationThread.tsx
│   └── workflow/
│       ├── WorkflowPanel.tsx  # Orchestrates skill execution
│       ├── AgentGate.tsx      # Shows AI output + Open in Jira button
│       ├── DraftEditor.tsx    # Editable reply draft + variant picker
│       ├── JiraModal.tsx      # Create Jira issue form
│       └── SlackModal.tsx     # Escalate to Slack form
├── hooks/
│   ├── useTicketQueue.ts      # Multi-ticket pipeline runner (main logic)
│   └── useWorkflow.ts         # Single-ticket pipeline (legacy/TicketDesk)
├── store/
│   ├── ticketQueueStore.ts    # Per-ticket state for batch mode
│   ├── workflowStore.ts       # Single-ticket workflow state
│   ├── agentStore.ts          # Logged-in agent + tone preference
│   └── historyStore.ts        # Processed ticket history
└── constants/
    ├── skills.ts              # Skill definitions + trigger conditions
    └── systemPrompt.ts        # Claude system prompt
```

---

## Backend API Reference

All routes are prefixed with `/api`. Auth-protected routes require `Authorization: Bearer <token>`.

| Route | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Login → returns JWT |
| `/api/ticket/:id` | GET | Fetch Zendesk ticket bundle |
| `/api/account` | GET | Customer account by `?email=` |
| `/api/stripe/customer` | GET | Stripe data by `?email=` |
| `/api/debug` | GET | Site debug by `?domain=` or `?website=` |
| `/api/docs/search` | GET | Docs search by `?q=` |
| `/api/jira/issue` | POST | Create Jira issue |
| `/api/analyze` | POST | AI analysis (SSE streaming) |
| `/health` | GET | Server + DB status |

### Example: Load a ticket

```bash
curl http://localhost:4000/api/ticket/12345 \
  -H "Authorization: Bearer <token>"
```

### Example: Create a Jira issue

```bash
curl -X POST http://localhost:4000/api/jira/issue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "ticketId": "12345",
    "summary": "Banner not showing on Safari",
    "description": "Reported by 3 customers this week...",
    "domain": "example.com"
  }'
```

### Example: Stream AI analysis

```bash
curl -X POST http://localhost:4000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ticket": { ... },
    "account": { ... },
    "tone": "friendly"
  }'
# Returns SSE stream: data: {"text": "..."}\n\n ... data: [DONE]
```

---

## Authentication

Login to get a JWT, then pass it as a Bearer token on all requests:

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "agent@cookieyes.com", "password": "..." }'

# Returns: { "token": "eyJ..." }

# Use token
curl http://localhost:4000/api/ticket/12345 \
  -H "Authorization: Bearer eyJ..."
```

Dev fallback secret: `dev-secret` (never use in production).

---

## Demo / Test Tickets

The app includes a hardcoded demo variant for ticket `12366` (Google Consent Mode v2 scenario). Load it to see the multi-variant draft picker in action.

---

## Project Status

- [x] Multi-ticket batch processing with parallel skill execution
- [x] Claude AI streaming analysis + draft generation
- [x] Multi-variant draft picker (up to 3 interpretations)
- [x] Jira bug creation with Zendesk link
- [x] Slack escalation
- [x] Stripe refund eligibility check
- [x] Site banner debugger
- [x] Certification / document lookup (Skill 8)
- [x] Ticket history log
- [ ] Test suite
- [ ] Production deployment config
- [ ] Multi-product support (Product B) — in progress
