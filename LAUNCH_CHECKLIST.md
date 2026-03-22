# Simple Music - Setup & Launch Checklist

## Pre-Launch Checklist

Use this checklist to ensure everything is properly set up before launching the application.

## 🔴 REQUIRED: Database Setup

- [ ] Create Supabase project at supabase.com
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Copy entire content from `DATABASE_SETUP.md`
- [ ] Paste into SQL Editor and run
- [ ] Verify all 7 tables were created (check Table Editor)
- [ ] Verify RLS policies are enabled on all tables
- [ ] Verify indexes were created for performance

**Verification SQL** (run in SQL Editor to verify):
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```
Should show: levels, notifications, profiles, site_settings, task_completions, tasks, transactions

## 🔴 REQUIRED: Environment Variables

- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL` from Supabase Settings → API
- [ ] Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Settings → API
- [ ] Create `.env.local` in project root
- [ ] Add both variables to `.env.local`
- [ ] Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

**Example `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🟡 STRONGLY RECOMMENDED: Initial Setup

- [ ] Run `pnpm install` to install dependencies
- [ ] Run `pnpm dev` to start development server
- [ ] Verify app loads at `http://localhost:3000`
- [ ] Navigate to signup page
- [ ] Create a test account (any email works)
- [ ] Verify you're redirected to home dashboard after signup
- [ ] Sign out and test login

**Test Account Credentials:**
- Display Name: `Test User`
- Email: `test@example.com`
- Password: `TestPass123`

## 🟡 STRONGLY RECOMMENDED: Admin Setup

- [ ] Create an admin account by signing up normally
- [ ] Go to Supabase dashboard
- [ ] Click on Users in Authentication
- [ ] Find your admin account
- [ ] Click to view details
- [ ] Under "User Metadata", add: `{"is_admin": true}`
- [ ] Click Update
- [ ] Go back to app and sign out/sign in again
- [ ] Verify `/admin` is now accessible

**Admin Verification:** You should see a purple "Admin Dashboard" header and tabs for: Dashboard, Users, Transactions, Settings

## 🟢 OPTIONAL: Production Readiness

- [ ] Review all environment variables are correct
- [ ] Test authentication flow (signup → verify email → login)
- [ ] Test user permissions (regular user can't access `/admin`)
- [ ] Test admin permissions (can access all admin pages)
- [ ] Verify transaction history appears after test activity
- [ ] Check bottom navigation is working on mobile view
- [ ] Test responsive design on tablet and desktop
- [ ] Verify all images load properly
- [ ] Test error handling (try invalid login)
- [ ] Clear browser cache and test again

## 🟢 OPTIONAL: Deployment Preparation

### For Vercel Deployment:

- [ ] Push code to GitHub
- [ ] Connect GitHub repo to Vercel
- [ ] Add environment variables in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL` = your production domain
- [ ] Deploy
- [ ] Test production deployment

### For Self-Hosted:

- [ ] Build production bundle: `pnpm build`
- [ ] Start production server: `pnpm start`
- [ ] Configure production domain in `.env.local` or environment
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS if needed in Supabase

## 🎯 Feature Verification Checklist

### User Features

- [ ] **Signup**: Can create account with display name
- [ ] **Login**: Can login with email/password
- [ ] **Home Dashboard**: Shows user profile, balance, tasks
- [ ] **Task Grid**: 12 tasks display with images
- [ ] **Recent Activity**: Recent transactions show
- [ ] **Wallet**: Balance displays correctly
- [ ] **Balance Cards**: Wallet, Profit, Tasks Completed show values
- [ ] **Transaction History**: Can see past transactions
- [ ] **Profile**: Can view account settings
- [ ] **Bottom Nav**: All 5 tabs accessible (Home, Record, Task, Wallet, Profile)
- [ ] **Logout**: Can sign out successfully

### Admin Features

- [ ] **Admin Access**: `/admin` loads (admin only)
- [ ] **Dashboard Stats**: Shows 6 stat cards with values
- [ ] **User Search**: Can search for users
- [ ] **User List**: Shows all users with email and level
- [ ] **Transactions Tab**: Shows all platform transactions
- [ ] **Settings**: Can toggle maintenance mode, registrations, etc.
- [ ] **Financial Settings**: Can set min withdrawal and referral bonus
- [ ] **Admin Nav Tabs**: All 4 tabs work (Dashboard, Users, Transactions, Settings)

### Data Features

- [ ] **Profile Auto-Creation**: New user profile created on signup
- [ ] **Transactions Record**: Transaction entries saved to database
- [ ] **Real-time Updates**: Data updates without page refresh
- [ ] **RLS Protection**: Can't access other users' data directly
- [ ] **Admin Access**: Admin can see all data

## 🐛 Troubleshooting Guide

### "Unauthorized" when accessing `/app`
- [ ] Check you're logged in
- [ ] Verify NEXT_PUBLIC_SUPABASE_URL and KEY are correct
- [ ] Check middleware.ts exists in root

### "Profile not created" after signup
- [ ] Check trigger in Supabase SQL Editor
- [ ] Manually create profile in SQL Editor:
```sql
INSERT INTO profiles (id, display_name, email)
VALUES ('USER_ID', 'Display Name', 'email@example.com');
```

### "Can't access admin panel"
- [ ] Verify user has `"is_admin": true` in metadata
- [ ] Sign out and sign back in
- [ ] Check RLS policies for admin access

### Tables not created
- [ ] Re-run all SQL from DATABASE_SETUP.md
- [ ] Check for errors in SQL Editor output
- [ ] Verify syntax is correct (PostgreSQL, not MySQL)

### Environment variables not loading
- [ ] Verify `.env.local` file exists (not `.env` or `.env.example`)
- [ ] Check variables start with `NEXT_PUBLIC_` for client-side
- [ ] Restart dev server after adding variables
- [ ] Verify no typos in variable names

### Bottom nav not appearing
- [ ] Check device width (mobile < 640px should show nav)
- [ ] Open DevTools and use mobile emulation
- [ ] Verify `bottom-nav.tsx` component is imported in layout

## 📱 Mobile Testing Checklist

- [ ] Bottom navigation appears on mobile
- [ ] All text is readable without zooming
- [ ] Buttons are large enough to tap (48px minimum)
- [ ] No horizontal scrolling
- [ ] Cards stack vertically
- [ ] Images load and display properly
- [ ] Forms are easy to fill on mobile
- [ ] Keyboard doesn't hide important content

## 🔐 Security Verification Checklist

- [ ] Passwords are hashed (never visible in code)
- [ ] Admin panel checks `is_admin` role
- [ ] RLS policies prevent unauthorized data access
- [ ] Session cookies are HTTP-only
- [ ] API endpoints validate user ownership
- [ ] No sensitive data in client-side code
- [ ] Error messages don't reveal database structure

## 📊 Data Verification Checklist

- [ ] Can view own profile data
- [ ] Can't view other users' profiles
- [ ] Transactions show with correct amounts
- [ ] Timestamps are accurate
- [ ] Balance calculations are correct
- [ ] Admin can see all data
- [ ] Deleted users' data is cleaned up

## ✅ Final Sign-Off

- [ ] All required items completed
- [ ] All strongly recommended items completed
- [ ] All feature verification passed
- [ ] No critical bugs found
- [ ] Application is ready for production

**Prepared By**: _________________ **Date**: _________

**Approved By**: _________________ **Date**: _________

---

**Once you've completed this checklist, your Simple Music platform is ready to launch! 🚀**
