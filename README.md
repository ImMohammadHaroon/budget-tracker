# BudgetFlow — Full-Stack Budget Tracker

A modern budget tracking web app built with React 18, Vite, Tailwind CSS, Supabase, Framer Motion, and Recharts.

## Features

- **Dashboard** — Monthly balance overview, income/expense summary, recent transactions
- **Transactions** — Add (modal), list, search, filter (income/expense), delete
- **Reports** — Monthly income vs expenses, savings trend, net cash flow
- **Auth** — Email/password sign up and sign in via Supabase

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- Supabase (auth + PostgreSQL)
- Framer Motion
- Recharts
- React Router DOM
- date-fns
- react-hot-toast

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run **`supabase/setup.sql`** (full database setup in one file)
3. Enable **Email** provider under Authentication → Providers
4. Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
  components/
    layout/       Sidebar, Navbar, BottomNav, Layout
    dashboard/    HeroCard, TransactionList
    modals/       AddTransactionModal
    ui/           LiquidBlob, GlassCard, Button
  hooks/          useTransactions, useAuth
  lib/            supabase.js, invalidate.js
  pages/          Dashboard, Transactions, Reports, Auth
  styles/         globals.css
```

See **[DOCUMENTATION.md](./DOCUMENTATION.md)** for full technical documentation.

## Build

```bash
npm run build
npm run preview
```
