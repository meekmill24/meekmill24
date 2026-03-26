# Simple Music — Task-Based Earning Platform

A comprehensive full-stack web application for a task-based earning platform with mobile-first design, built with Next.js 16, Supabase, and modern React patterns.

## Project Overview
Simple Music is a platform where users complete tasks (like music matching) to earn money. The application features:

- **User App:** Mobile-first interface with home dashboard, task center, wallet, transaction history, and profile management
- **Admin Dashboard:** Complete platform management including user management, transaction oversight, and site controls
- **Real-time Data:** Supabase backend with Row Level Security (RLS) policies
- **Responsive Design:** Purple accent color scheme with clean, modern UI

## Stack

- **Frontend:** Next.js 16 (App Router), shadcn/ui, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + RLS), Next.js Server Actions

---

## Quick Start

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com), create a new project, and wait for initialization (~2 min).

### 2. Set Up Environment

In **Settings → API**, copy your Project URL and Anon Key, then create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the Database Schema

In Supabase **SQL Editor**, paste and run the contents of `scripts/DATABASE_SETUP.sql`, found here:

[Database Setup](./DATABASE_SETUP.md)

Verify success by checking **Table Editor** for these tables: `profiles`, `levels`, `tasks`, `task_completions`, `transactions`, `site_settings`, `notifications`.

### 4. Install & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Create an Admin Account

Sign up normally, then run this in SQL Editor (replace with your email):

```sql
UPDATE profiles SET is_admin = TRUE
WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
```

---

## Project Structure

```
app/
  app/          # User routes (home, tasks, wallet, record, profile)
  admin/        # Admin routes (overview, users, transactions, settings)
  auth/         # Login, sign-up, error
components/
  navigation/   # Bottom nav
  cards/        # Stat, balance, transaction cards
  ui/           # shadcn/ui components
lib/
  actions/      # Server actions (auth, user, admin ops)
  supabase/     # Client, server, middleware helpers
middleware.ts   # Auth + admin route protection
scripts/
  DATABASE_SETUP.sql
```

---

## Features

**User App**
- Dashboard with balance, earnings, and activity feed
- Task center with difficulty levels and rewards
- Wallet with deposit/withdraw actions
- Full transaction history
- Profile with security and notification settings

**Admin Dashboard**
- Platform metrics and user growth charts
- User management (search, edit, delete)
- Transaction oversight and approval
- Site settings: maintenance mode, registration, deposits/withdrawals, minimum withdrawal amount

---

## Security

All tables use Row Level Security. Users see only their own data; admins see everything. The `is_admin` flag is checked in middleware before any `/admin` route is served.

---
## Documentation
[Quick Reference](./QUICK_REFERENCE.md)

[Setup Checklist](./SETUP_CHECKLIST.md)

[Launch Checklist](./LAUNCH_CHECKLIST.md)

[Database Setup](./DATABASE_SETUP.md)

[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

[Build Summary](./BUILD_SUMMARY.md)


## Troubleshooting

| Problem | Fix |
|---|---|
| `@supabase/ssr` not found | Run `pnpm install` |
| Env vars undefined | Create `.env.local` and restart the dev server |
| RLS errors | Confirm email in Supabase Auth; ensure a profile row exists |
| Admin panel inaccessible | Set `is_admin = TRUE` in the `profiles` table |
| Tasks not showing | Ensure `is_active = TRUE` on task rows |

---

## Deploy to Vercel

Push to GitHub → import on [vercel.com](https://vercel.com) → add the two env vars → deploy.

## External Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Documentation](https://react.dev)

## Support & Feedback

For issues:
1. Check the troubleshooting section above
2. Review Supabase logs in dashboard
3. Check browser console for errors (F12)
4. Verify `.env.local` has correct credentials
5. Ensure all tables exist in Supabase

## License

Proprietary - All rights reserved

---

**Version**: 1.0.0  
**Last Updated**: March 14, 2026  
**Built with**: Next.js 16, Supabase, shadcn/ui

