# PrimeContractorOS

**Your Guided Operating System for Government Contracting**

PrimeContractorOS is a full-stack web application that helps prime contractors and subcontractors manage the complete government contracting lifecycle — from opportunity tracking to proposal building, contract management, compliance, and closeout.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Express 4, tRPC 11 |
| Database | MySQL / TiDB (via Drizzle ORM) |
| Auth | Manus OAuth |
| Language | TypeScript (end-to-end) |
| Build | Vite 6, esbuild |
| Testing | Vitest |

---

## Features

- **Opportunities** — Track and manage government contracting opportunities with status workflows
- **Proposals** — Build and manage proposals linked to opportunities
- **Contracts** — Full contract lifecycle management with Contract Hub
- **Files, Contacts, Messages** — Linked records for each workspace
- **Finance & Invoicing** — Invoice and payment tracking
- **Tasks & Alerts** — Workspace-level task and alert management
- **AI Guidance** — LLM-powered suggestions and compliance insights
- **Platform Admin** — Owner-level workspace directory, plans, discounts, billing, and support management
- **Onboarding** — Mandatory guided setup for new workspaces

---

## Prerequisites

- Node.js 22+
- pnpm 9+
- MySQL or TiDB database
- Manus OAuth credentials (or compatible OAuth provider)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/domogotu/primecontractoros.git
cd primecontractoros
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/primecontractoros

# Auth
JWT_SECRET=your-jwt-secret-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner info (set after first login)
OWNER_OPEN_ID=
OWNER_NAME=

# Manus built-in APIs (optional, for AI features)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
```

### 4. Push database schema

```bash
pnpm db:push
```

### 5. Start the development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

---

## Project Structure

```
prime-contractor-os/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/           # Page-level components
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/trpc.ts      # tRPC client binding
│   │   ├── App.tsx          # Routes & layout
│   │   └── index.css        # Global styles
│   └── public/              # Static assets
├── drizzle/                 # Database schema & migrations
│   └── schema.ts            # All table definitions
├── server/                  # Express backend
│   ├── _core/               # Framework plumbing (auth, tRPC, OAuth)
│   ├── routers.ts           # Main tRPC router
│   ├── platformRouter.ts    # Platform admin procedures
│   ├── db.ts                # Database query helpers
│   └── storage.ts           # S3 file storage helpers
└── shared/                  # Shared types and constants
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run Vitest tests |
| `pnpm db:push` | Generate and apply database migrations |
| `pnpm format` | Format code with Prettier |

---

## Authentication

The app uses **Manus OAuth** for authentication. When a user logs in:

1. They are redirected to the Manus OAuth portal
2. After authentication, they are redirected back to `/api/oauth/callback`
3. A session cookie is set and the user is routed to onboarding (first time) or dashboard

**Platform admin access** is determined by `user.role === 'admin'` in the database. To promote a user to admin, update the `role` field in the `users` table.

---

## Platform Admin

The platform admin area (`/platform`) is accessible only to users with `role = 'admin'`. It provides:

- **Workspace Directory** — View and manage all customer workspaces
- **Plans** — Create and manage subscription plans
- **Discounts** — Manage promotional codes
- **Billing** — Track workspace activations and billing
- **Support Inbox** — Manage customer support tickets
- **Overrides** — Admin-level configuration overrides

---

## License

Private — Reed Solutions LLC. All rights reserved.
