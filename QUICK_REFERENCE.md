# Simple Music - Quick Reference Card

## Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Setup verification
bash verify-setup.sh
```

## URLs

| Route | Purpose | Access |
|-------|---------|--------|
| http://localhost:3000 | Home | Public (redirects) |
| http://localhost:3000/auth/login | Login | Public |
| http://localhost:3000/auth/sign-up | Sign up | Public |
| http://localhost:3000/app | Home dashboard | Logged in users |
| http://localhost:3000/app/tasks | Task center | Logged in users |
| http://localhost:3000/app/wallet | Wallet | Logged in users |
| http://localhost:3000/app/record | History | Logged in users |
| http://localhost:3000/app/profile | Settings | Logged in users |
| http://localhost:3000/admin | Admin overview | Admins only |
| http://localhost:3000/admin/users | User management | Admins only |
| http://localhost:3000/admin/transactions | Transactions | Admins only |
| http://localhost:3000/admin/settings | Site settings | Admins only |

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User accounts |
| levels | User tier levels |
| tasks | Available work items |
| task_completions | User task records |
| transactions | Financial ledger |
| site_settings | Platform config |
| notifications | User alerts |

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Setup & documentation |
| `SETUP_CHECKLIST.md` | Configuration checklist |
| `BUILD_SUMMARY.md` | Project overview |
| `scripts/DATABASE_SETUP.sql` | Database schema |
| `lib/actions/index.ts` | Server actions |
| `lib/supabase/client.ts` | Supabase browser client |
| `middleware.ts` | Auth middleware |
| `.env.local` | Environment variables |

## Setup Steps (5 minutes)

1. Create Supabase project
2. Copy Project URL & Anon Key
3. Create `.env.local` with credentials
4. Run `pnpm install`
5. Run `pnpm dev`
6. Copy `scripts/DATABASE_SETUP.sql` into Supabase SQL Editor
7. Click Run
8. Open http://localhost:3000/auth/sign-up
9. Sign up with test account
10. Login and test

## Make User Admin

In Supabase SQL Editor:
```sql
UPDATE profiles SET is_admin = TRUE 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'user@email.com');
```

## Add Sample Data

Tasks already included in DATABASE_SETUP.sql:
- Music Matching ($1.00)
- Audio Categorization ($1.50)
- Music Rating ($2.00)
- Genre Identification ($2.50)

## Color Palette

| Color | Hex | Purpose |
|-------|-----|---------|
| Purple | #7C3AED | Primary accent |
| Blue | #0EA5E9 | Charts, info |
| Orange | #EA580C | Charts, warnings |
| Green | #22C55E | Charts, success |
| Red | #EF4444 | Destructive |
| Gray | #94A3B8 | Neutral |
| White | #FFFFFF | Background |

## Architecture

```
Next.js 16 (Frontend)
    ↓
Middleware (Auth Check)
    ↓
App Router Pages
    ↓
Server Actions
    ↓
Supabase Client (Browser & Server)
    ↓
PostgreSQL Database (RLS Protected)
```

## Common Issues & Fixes

### Module not found: '@supabase/ssr'
```bash
pnpm install
```

### .env.local not found
Create file in project root with Supabase credentials

### RLS policy error
- Ensure email is confirmed
- Run DATABASE_SETUP.sql again
- Check user exists in profiles table

### Admin dashboard not accessible
- Run SQL: `UPDATE profiles SET is_admin = TRUE WHERE email = '...'`
- Logout and login again

### Tables don't exist
- Go to Supabase SQL Editor
- Copy DATABASE_SETUP.sql
- Paste and run

## File Locations

```
Project Root/
├── app/                    Page routes
├── components/             React components
├── lib/                    Utilities and actions
├── scripts/                SQL migrations
├── middleware.ts           Auth middleware
├── .env.local              Credentials (YOU CREATE)
├── package.json            Dependencies
├── README.md               Full documentation
└── SETUP_CHECKLIST.md      Verification checklist
```

## Performance Tips

- Database queries are indexed
- RLS policies are optimized
- Images are lazy-loaded
- Code splitting is automatic
- CSS is purged of unused rules

## Support

1. Check README.md
2. Check SETUP_CHECKLIST.md
3. Review Supabase logs
4. Check browser console (F12)
5. Verify .env.local credentials

## Deployment to Vercel

```bash
git push              # Push to GitHub
# → Vercel auto-deploys
# → Add env vars in Vercel settings
# → App is live!
```

## Version

**Simple Music v1.0.0**
- Next.js 16.1.6
- React 19.2.4
- Supabase PostgreSQL
- Tailwind CSS v4
- shadcn/ui Components

**Status**: Production Ready ✅

---

**Last Updated**: March 14, 2026
