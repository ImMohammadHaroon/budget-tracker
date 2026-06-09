# BudgetFlow — Technical Documentation

> **Product name:** BudgetFlow (branded in UI) / `budget-tracker` (npm package name)  
> **Version:** 1.0.0  
> **Last reviewed:** June 2026 — based on the current codebase

**Scope:** This app tracks **income and expenses only**. It does **not** use savings goals or spending categories. Transactions are recorded as income or expense with amount, description, and date.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture & System Design](#3-architecture--system-design)
4. [Project Structure](#4-project-structure)
5. [Features (Detailed)](#5-features-detailed)
6. [API Reference](#6-api-reference)
7. [Database / Data Models](#7-database--data-models)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [State Management & Data Flow](#9-state-management--data-flow)
10. [Environment Variables & Configuration](#10-environment-variables--configuration)
11. [Installation & Local Setup](#11-installation--local-setup)
12. [Deployment](#12-deployment)
13. [Known Issues / Limitations](#13-known-issues--limitations)
14. [Future Improvements](#14-future-improvements)

---

## 1. Project Overview

### What this project does

BudgetFlow is a **single-page web application (SPA)** for personal finance management. Users sign up or sign in with email and password, then:

- Add **income** and **expense** transactions
- View a **dashboard** with monthly balance and recent activity
- Browse, filter, search, and delete transactions
- View **reports** with income vs expenses and savings trends

Data is stored in **Supabase** (PostgreSQL + Auth). The UI uses a dark glassmorphism theme and works on desktop and mobile.

### Core problem it solves

A lightweight alternative to spreadsheets for:

- Recording day-to-day money in and out
- Seeing monthly net balance (income minus expenses)
- Reviewing recent activity and 6-month trends

There is **no custom backend server**—the frontend talks directly to Supabase with **Row Level Security (RLS)** for per-user data isolation.

### Target users and use cases

| User | Use case |
|------|----------|
| Individual budgeters | Log purchases and paychecks, see monthly net balance |
| Mobile-first users | Bottom navigation, FAB-style add button, responsive layout |
| Developers learning React + Supabase | Reference SPA with auth, RLS, and Realtime |

**Default currency:** Pakistani Rupee (**PKR**), `en-PK` formatting — hardcoded in `src/lib/supabase.js`.

---

## 2. Tech Stack

### Languages and runtime

| Technology | Role |
|------------|------|
| **JavaScript (ES modules)** | Application language |
| **JSX** | React components |
| **SQL** | Supabase schema (PostgreSQL) |
| **HTML / CSS** | Shell and styling |

### Frontend dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **React** | ^18.3.1 | UI library |
| **React DOM** | ^18.3.1 | DOM rendering |
| **Vite** | ^6.2.0 | Dev server and bundler |
| **@vitejs/plugin-react** | ^4.3.4 | JSX / Fast Refresh |
| **React Router DOM** | ^7.2.0 | Routing and protected routes |
| **Tailwind CSS** | ^3.4.17 | Utility-first styling |
| **PostCSS + Autoprefixer** | ^8.5.3 / ^10.4.20 | CSS pipeline |
| **@supabase/supabase-js** | ^2.49.1 | Auth, database, Realtime |
| **Framer Motion** | ^12.4.7 | Animations and transitions |
| **Recharts** | ^2.15.1 | Dashboard sparkline and report charts |
| **date-fns** | ^4.1.0 | Date formatting and aggregation |
| **lucide-react** | ^1.17.0 | Icons |
| **react-hot-toast** | ^2.5.2 | Toast notifications |

### External services

| Service | Role |
|---------|------|
| **Supabase Auth** | Email/password signup, sign-in, JWT sessions |
| **Supabase PostgreSQL** | `profiles`, `transactions` (app tables in use) |
| **Supabase Realtime** | Live updates on `transactions` |

### Fonts (CDN)

- **DM Sans** — body text
- **Clash Display** — headings and balance display

---

## 3. Architecture & System Design

### High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                            │
│  React 18 + React Router + Tailwind + Framer Motion + Recharts │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (REST + WebSocket)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Project                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Auth (JWT)   │  │ PostgreSQL   │  │ Realtime             │  │
│  │ Email/Pass   │  │ + RLS        │  │ postgres_changes     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Pattern:** Jamstack / BaaS frontend — no custom API. Single Vite app organized as **pages + components + hooks**.

### Major layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Entry | `src/main.jsx` | Mount React, global CSS |
| App shell | `src/App.jsx` | Auth, router, protected routes, toasts |
| Layout | `src/components/layout/` | Sidebar, navbar, bottom nav, add-transaction modal |
| Pages | `src/pages/` | Auth, Dashboard, Transactions, Reports |
| Data hooks | `src/hooks/` | Supabase fetch/mutate, Realtime |
| Lib | `src/lib/` | Supabase client, currency helpers, invalidation |

### Data flow: add transaction

1. User opens `AddTransactionModal` (navbar, bottom nav, or desktop FAB).
2. User enters amount, description, type (`income` | `expense`), and date.
3. `ensureUserProfile(user)` upserts a `profiles` row (required for FK).
4. `supabase.from('transactions').insert(...)` runs with the user's JWT.
5. RLS ensures `user_id` matches `auth.uid()`.
6. `invalidateQueries()` refreshes dashboard widgets; Realtime may also refetch via `useTransactions`.
7. Toast confirms success; modal closes.

### Refresh mechanisms

- **Supabase Realtime** — `useTransactions` listens for changes on `transactions`.
- **Manual invalidation** — `AddTransactionModal` calls `invalidateQueries()`; `HeroCard` and `TransactionList` subscribe via `useInvalidate`.

Dashboard widgets fetch their own data (not always through `useTransactions`), which can mean duplicate queries.

---

## 4. Project Structure

### Active application files

```
budget-tracker/
├── index.html                 # HTML shell, fonts, #root
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite + React plugin
├── tailwind.config.js         # Theme, animations
├── postcss.config.js          # Tailwind pipeline
├── .env.example               # Supabase env template
├── README.md                  # Quick start
├── DOCUMENTATION.md           # This file
│
├── supabase/
│   ├── setup.sql              # Full DB setup (run once)
│   ├── schema.sql             # Schema reference
│   └── fix-profiles.sql       # Profile trigger/backfill patch
│
└── src/
    ├── main.jsx               # React entry
    ├── App.jsx                # Router, auth guard, Toaster
    ├── index.css              # Tailwind, CSS variables, .glass
    │
    ├── lib/
    │   ├── supabase.js        # Client, PKR formatters, ensureUserProfile
    │   └── invalidate.js      # Pub/sub cache invalidation
    │
    ├── hooks/
    │   ├── useAuth.jsx        # AuthProvider (session, signIn/up/out)
    │   ├── useAuth.js         # Re-export barrel
    │   ├── useTransactions.js # Transactions, totals, Realtime
    │   └── useInvalidate.js   # Subscribe to invalidateQueries()
    │
    ├── pages/
    │   ├── Auth.jsx           # Login / signup
    │   ├── Dashboard.jsx      # HeroCard + TransactionList
    │   ├── Transactions.jsx   # Full list, filter, search, delete
    │   └── Reports.jsx        # Income/expense/savings charts
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx     # Shell, modal, Outlet
    │   │   ├── Sidebar.jsx    # Desktop nav, logout
    │   │   ├── Navbar.jsx     # Header, add transaction
    │   │   └── BottomNav.jsx  # Mobile nav + add button
    │   ├── dashboard/
    │   │   ├── HeroCard.jsx         # Monthly balance + sparkline
    │   │   └── TransactionList.jsx  # Recent 10 transactions
    │   ├── modals/
    │   │   └── AddTransactionModal.jsx
    │   └── ui/
    │       ├── Button.jsx
    │       ├── GlassCard.jsx
    │       └── LiquidBlob.jsx
    │
    └── styles/
        └── globals.css        # Shared keyframes
```

### Routes

| Path | Page | Access |
|------|------|--------|
| `/auth` | Auth | Public |
| `/` | Dashboard | Protected |
| `/transactions` | Transactions | Protected |
| `/reports` | Reports | Protected |
| `/settings` | — | Linked in nav but **not implemented** (redirects to `/`) |
| `*` | — | Redirects to `/` |

### Out of scope (not documented as features)

The repo may contain unused files from earlier iterations (`Goals.jsx`, `CategoryCards.jsx`, `useGoals.js`, etc.). They are **not** registered in the router and **not** part of this product.

---

## 5. Features (Detailed)

### 5.1 Authentication

| Aspect | Detail |
|--------|--------|
| **What it does** | Email/password sign up and sign in via Supabase |
| **User experience** | Toggle Sign up ↔ Sign in on `/auth`; redirect to `/` when logged in; clear errors for unconfirmed email or bad credentials |
| **Files** | `Auth.jsx`, `useAuth.jsx`, `supabase.js` |
| **Flow** | `signUp` stores `full_name` in metadata; DB trigger creates `profiles`; client calls `ensureUserProfile` on session init |

Sign out: Sidebar (navigates to `/auth`) and Navbar desktop button.

---

### 5.2 Dashboard

| Aspect | Detail |
|--------|--------|
| **What it does** | Monthly balance summary and 10 most recent transactions |
| **User experience** | Month picker; animated PKR balance; income/expense pills; desktop sparkline; “View All” link to transactions |
| **Files** | `Dashboard.jsx`, `HeroCard.jsx`, `TransactionList.jsx` |

---

### 5.3 Add Transaction

| Aspect | Detail |
|--------|--------|
| **What it does** | Creates income or expense records |
| **User experience** | Modal: type toggle, amount, description, date; toast on success |
| **Entry points** | Navbar, bottom-nav FAB, desktop FAB, empty state on transaction list |
| **Files** | `AddTransactionModal.jsx`, `Layout.jsx` |
| **Fields stored** | `user_id`, `type`, `amount`, `description`, `date` (`category_id` always `null`) |

**Not implemented:** Edit existing transactions.

---

### 5.4 Transactions

| Aspect | Detail |
|--------|--------|
| **What it does** | Full transaction history with filter, search, and delete |
| **User experience** | All / Income / Expense tabs; search by description; delete on hover |
| **Files** | `Transactions.jsx`, `useTransactions.js` |

Create is via the global modal, not on this page.

---

### 5.5 Reports

| Aspect | Detail |
|--------|--------|
| **What it does** | Visualizes last **6 months** of financial activity |
| **Charts** | Income vs Expenses (bar), Savings trend (area), Net cash flow (line) |
| **Files** | `Reports.jsx`, `useTransactions.js` |
| **Logic** | Client-side aggregation by month: `savings = income - expenses` |

No category or goal breakdowns.

---

### 5.6 UI / UX

| Feature | Files |
|---------|-------|
| Dark glassmorphism | `GlassCard`, `index.css`, Tailwind tokens |
| Animated backgrounds | `LiquidBlob` |
| Route transitions | `Layout.jsx` + Framer Motion |
| Mobile layout | `BottomNav`, responsive sidebar |
| Toasts | `react-hot-toast` in `App.jsx` |

---

## 6. API Reference

No custom REST server. All access is via **Supabase Auth** and **PostgREST** through `@supabase/supabase-js`.

### 6.1 Auth (client SDK)

| Method | Called from | Auth required |
|--------|-------------|---------------|
| `supabase.auth.getSession()` | `useAuth.jsx` | No |
| `supabase.auth.onAuthStateChange()` | `useAuth.jsx` | No |
| `supabase.auth.signUp({ email, password, options })` | `Auth.jsx` | No |
| `supabase.auth.signInWithPassword({ email, password })` | `Auth.jsx` | No |
| `supabase.auth.signOut()` | Sidebar, Navbar | Session |

Session options in `supabase.js`: `persistSession`, `autoRefreshToken`, `detectSessionInUrl`.

---

### 6.2 Database operations (in use)

All require a valid JWT. RLS restricts rows to the current user.

#### `profiles`

| Operation | Where | Payload |
|-----------|-------|---------|
| UPSERT | `ensureUserProfile`, DB trigger | `{ id, full_name, currency: 'PKR' }` |

#### `transactions`

| Operation | Where | Details |
|-----------|-------|---------|
| SELECT | `useTransactions` | `*, categories(...)` join (unused in UI); ordered by `date DESC` |
| SELECT | `HeroCard` | `type, amount, date` |
| SELECT | `TransactionList` | `*`, limit 10, `date DESC` |
| INSERT | `AddTransactionModal` | `{ user_id, type, amount, description, date, category_id: null }` |
| DELETE | `Transactions.jsx` | `.eq('id', id)` |

---

### 6.3 Realtime

| Channel | Table | Hook |
|---------|-------|------|
| `transactions:{userId}` | `transactions` | `useTransactions` |

Filter: `user_id=eq.{user.id}`.

---

### 6.4 Client helpers

| Function | Module | Description |
|----------|--------|-------------|
| `ensureUserProfile(user)` | `supabase.js` | Upsert profile for FK compliance |
| `formatCurrency(amount)` | `supabase.js` | PKR, 0–2 decimals |
| `formatCurrencyCompact(amount)` | `supabase.js` | PKR, 0 decimals |
| `formatCurrencyBalance(amount)` | `supabase.js` | PKR, 2 decimals |
| `invalidateQueries()` | `invalidate.js` | Notify invalidation subscribers |
| `subscribeInvalidation(fn)` | `invalidate.js` | Register subscriber |

---

## 7. Database / Data Models

Run **`supabase/setup.sql`** once in the Supabase SQL Editor.

### Tables used by the app

```
auth.users (Supabase)
    │
    │ 1:1
    ▼
profiles
    │
    │ 1:N
    └──► transactions
```

`setup.sql` also creates `categories` and `goals` tables. The **current app does not read or write them**. They can remain in the database harmlessly or be dropped in a future schema cleanup.

### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK, FK → `auth.users` | Same as auth user ID |
| `full_name` | `text` | From signup metadata |
| `avatar_url` | `text` | Not used in UI |
| `currency` | `text` | Default `'PKR'`; not editable in UI |
| `created_at` | `timestamptz` | Auto |

### `transactions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Auto-generated |
| `user_id` | `uuid` FK → `profiles` | Owner |
| `category_id` | `uuid` FK → `categories`, nullable | Always `null` from app |
| `type` | `text` | `'income'` or `'expense'` |
| `amount` | `numeric(10,2)` | Positive in UI |
| `description` | `text` | Required in modal |
| `date` | `date` | User-selected |
| `created_at` | `timestamptz` | Auto |

### RLS (relevant policies)

| Table | Policy | Rule |
|-------|--------|------|
| `profiles` | `own profile` | `auth.uid() = id` |
| `transactions` | `own transactions` | `auth.uid() = user_id` |

### Trigger

`handle_new_user()` — after insert on `auth.users`, creates a `profiles` row with `full_name` and `currency = 'PKR'`.

`fix-profiles.sql` backfills profiles and recreates the trigger if missing.

---

## 8. Authentication & Authorization

- **Provider:** Supabase email/password.
- **Guard:** `ProtectedRoute` wraps all main routes except `/auth`.
- **Roles:** Single authenticated user; no admin or RBAC.
- **Authorization:** Postgres RLS on all tables.

| Route | Access |
|-------|--------|
| `/auth` | Public |
| `/`, `/transactions`, `/reports` | Protected |

Email confirmation depends on Supabase project settings; `Auth.jsx` handles both immediate session and “check your email” flows.

---

## 9. State Management & Data Flow

**No Redux, Zustand, or React Query.**

| Mechanism | Usage |
|-----------|-------|
| React Context | Auth only (`AuthProvider`) |
| Custom hooks | `useTransactions` for list + totals + Realtime |
| Local state | Forms, filters, modal, selected month |
| Invalidation pub/sub | Dashboard refetch after add transaction |

### Transaction data paths

**Shared hook** (Transactions, Reports):

```
useTransactions → SELECT → state → useMemo (income, expenses, balance)
                → Realtime → refetch()
```

**Local fetch** (Dashboard):

```
HeroCard / TransactionList → SELECT → useInvalidate on modal save
```

`Layout` passes `{ openAddTransaction }` through React Router `Outlet` context.

---

## 10. Environment Variables & Configuration

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for client SDK |

Copy `.env.example` to `.env`. Restart the dev server after changes.

`isSupabaseConfigured` in `supabase.js` detects missing or placeholder values; `Auth.jsx` shows a warning banner when false.

**Supabase dashboard:** run `setup.sql`, enable Email auth provider.

---

## 11. Installation & Local Setup

### Prerequisites

- **Node.js** 18+ or 20+ (LTS recommended)
- **npm**
- **Supabase account**

### Steps

```bash
git clone <repository-url>
cd budget-tracker
npm install
cp .env.example .env
# Edit .env with Supabase URL and anon key
npm run dev
```

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run **`supabase/setup.sql`** in SQL Editor.
3. Enable **Email** under Authentication → Providers.
4. Open [http://localhost:5173](http://localhost:5173).

**Build:**

```bash
npm run build
npm run preview
```

### Troubleshooting

| Issue | Fix |
|-------|-----|
| FK error on insert | Run `supabase/fix-profiles.sql` |
| Supabase not configured | Check `.env`, restart dev server |
| Email not confirmed | Confirm user in Supabase Dashboard → Authentication |

---

## 12. Deployment

Deploy the static **`dist/`** folder; keep Supabase as the backend.

| Platform | Notes |
|----------|-------|
| Vercel / Netlify / Cloudflare Pages | `npm run build`, output `dist` |
| GitHub Pages | May need `base` in `vite.config.js` |

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host environment.

**Production checklist:**

- Configure Supabase Auth **Site URL** and redirect URLs
- Use only the **anon** key in the frontend (never service role)
- RLS enabled via `setup.sql`

---

## 13. Known Issues / Limitations

| Issue | Details |
|-------|---------|
| **Settings not implemented** | Nav links to `/settings`; no page exists |
| **No transaction edit** | Create and delete only |
| **Duplicate fetching** | Dashboard widgets fetch separately from `useTransactions` |
| **Currency hardcoded** | PKR in formatters; `profiles.currency` not used in UI |
| **Navbar signOut** | Does not explicitly navigate to `/auth` |
| **Notifications bell** | Decorative only on mobile navbar |
| **Legacy DB tables** | `categories` / `goals` in SQL but unused by app |
| **Duplicate CSS** | Keyframes in `index.css` and `styles/globals.css` |

---

## 14. Future Improvements

Suggestions aligned with **income/expense-only** scope:

1. **Settings page** — profile name, optional currency from `profiles.currency`
2. **Transaction edit** — update amount, description, type, date
3. **Consolidate data fetching** — single source via `useTransactions` or React Query
4. **Optimistic updates** — faster add/delete UX
5. **Pagination** — large transaction histories
6. **Export** — CSV of monthly summaries
7. **Password reset** — Supabase recovery flow
8. **E2E tests** — auth and transaction CRUD
9. **CI/CD** — build on push
10. **Schema cleanup** — optional migration to drop unused `categories` / `goals` tables

---

## Appendix: npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Development server |
| `build` | `vite build` | Production bundle → `dist/` |
| `preview` | `vite preview` | Preview production build |

---

## Appendix: Quick Reference

| File | Role |
|------|------|
| `App.jsx` | Router, auth gate, toasts |
| `useAuth.jsx` | Session and auth methods |
| `useTransactions.js` | Transaction data + Realtime |
| `AddTransactionModal.jsx` | Create transaction |
| `HeroCard.jsx` | Monthly balance dashboard |
| `Reports.jsx` | 6-month charts |
| `setup.sql` | Database bootstrap |

---

*Documentation reflects the app scope: auth, transactions, dashboard, and reports — without goals or categories.*
