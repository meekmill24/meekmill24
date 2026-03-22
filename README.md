# Simple Music - Task-Based Earning Platform

A comprehensive full-stack web application for a task-based earning platform with mobile-first design, built with Next.js 16, Supabase, and modern React patterns.

## Project Overview

Simple Music is a platform where users complete tasks (like music matching) to earn money. The application features:

- **User App**: Mobile-first interface with home dashboard, task center, wallet, transaction history, and profile management
- **Admin Dashboard**: Complete platform management including user management, transaction oversight, and site controls
- **Real-time Data**: Supabase backend with Row Level Security (RLS) policies
- **Responsive Design**: Purple accent color scheme with clean, modern UI

## Architecture

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **State Management**: React hooks with SWR for client-side data fetching
- **Mobile-First**: Optimized for mobile devices with responsive breakpoints

### Backend
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (email/password)
- **Server Actions**: Next.js Server Actions for secure operations
- **API Routes**: RESTful endpoints for complex operations

### Database Schema
- **profiles**: User profiles with wallet and stats
- **levels**: Tier system for earning multipliers
- **tasks**: Available tasks with rewards
- **task_completions**: User task completion records
- **transactions**: Financial transactions (deposits, withdrawals, rewards)
- **site_settings**: Platform configuration
- **notifications**: User notifications

## ⚡ Quick Start (5 Minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project** button
3. Fill in:
   - Organization: (select existing)
   - Project Name: `simple-music`
   - Database Password: (create and save this!)
   - Region: (closest to you)
4. Click **Create New Project** and wait 2-3 minutes

### Step 2: Get Your Credentials
1. Go to **Settings** (gear icon, bottom left)
2. Click **API** tab
3. Copy these values to a text editor:
   - **Project URL** → Save as `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Set Up Environment
1. In your project root, create `.env.local` file
2. Add these lines (replace with your values from Step 2):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 4: Create Database Tables
1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query** button
3. **Copy everything** from `scripts/DATABASE_SETUP.sql` in this project
4. **Paste it** into the SQL Editor
5. Click **Run** button or press `Ctrl+Enter`
6. ✅ Wait for success message (no errors should appear)

### Step 5: Run the App
```bash
pnpm install
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

## Detailed Setup Instructions

### Full Step-by-Step Guide

#### 1. Create Supabase Project

**Sign Up (if needed)**
1. Go to [supabase.com](https://supabase.com)
2. Click **Sign Up** → use email or GitHub
3. Verify your email

**Create Project**
1. After login, click **New Project** (top right area)
2. Choose organization (or create new)
3. Project Details:
   - **Name**: `simple-music` (or your preference)
   - **Database Password**: Create a strong password and **save it** (you may need it later)
   - **Region**: Select region closest to you (e.g., `us-west-1`)
4. Click **Create New Project**
5. ⏳ Wait 2-3 minutes for project initialization

**Verify Creation**
- You'll see a "Project created successfully" message
- Dashboard will show your project name

#### 2. Retrieve API Credentials

1. In your Supabase project dashboard, click **Settings** icon (⚙️ at bottom left)
2. Click the **API** tab (top menu)
3. You'll see two important values:

**Copy These Two Values:**

```
Project URL: https://[project-id].supabase.co
Anon Key: eyJhbGc....[long string]...
```

**Example:**
```
Project URL: https://abcdefgh.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Keep these handy for next steps.

#### 3. Create `.env.local` File

1. In your project root directory (same level as `package.json`):
2. Create a new file named `.env.local` (note the dot at start)
3. Add these lines with YOUR values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

4. Save the file
5. **Important**: When you start the dev server, it will pick up these values

#### 4. Create Database Tables & Schema

This is critical - follow carefully!

**In Supabase Dashboard:**
1. Click **SQL Editor** on the left sidebar
2. Click **New Query** (top left, white button)
3. You'll see an empty SQL editor

**Copy the SQL Script:**
1. Open `scripts/DATABASE_SETUP.sql` in this repository
2. Select **ALL** the text (Ctrl+A)
3. Copy it (Ctrl+C)

**Paste into Supabase:**
1. Click in the SQL editor
2. Paste everything (Ctrl+V)
3. You should see all the CREATE TABLE statements

**Run the Script:**
1. Click the **Run** button (blue button, bottom right)
   - Or press `Ctrl+Enter`
2. ⏳ Wait 5-10 seconds

**Success Indicators:**
- ✅ No error messages appear
- ✅ You see "Query executed successfully"
- ✅ The editor shows completion

**Verify Tables Created:**
1. Click **Table Editor** on left sidebar
2. Expand the schema dropdown
3. You should see these tables:
   - `levels`
   - `profiles`
   - `tasks`
   - `task_completions`
   - `transactions`
   - `site_settings`
   - `notifications`

If any are missing, scroll up in your SQL output and look for errors.

#### 5. Install Dependencies

```bash
cd your-project-directory
pnpm install
```

This installs all npm packages including Supabase client.

#### 6. Start Development Server

```bash
pnpm dev
```

You should see:
```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
```

#### 7. Test the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click **Sign Up**
3. Enter:
   - Display Name: `Test User`
   - Email: `test@example.com`
   - Password: anything (8+ characters)
4. Click **Sign Up**
5. You'll be redirected to login
6. Login with the credentials you just created
7. ✅ You should see the home dashboard!

### Initial Credentials for Admin

To make your first account an admin:

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this (replace email with yours):
```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'your.email@example.com');
```
4. Click **Run**
5. Logout and login again
6. You'll now see the admin dashboard link

## Install Dependencies

```bash
pnpm install
```

## Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
project/
├── app/
│   ├── app/                    # User application routes
│   │   ├── page.tsx           # Home dashboard
│   │   ├── tasks/page.tsx     # Task center
│   │   ├── wallet/page.tsx    # Wallet & transactions
│   │   ├── record/page.tsx    # Task history
│   │   └── profile/page.tsx   # User profile
│   ├── admin/                  # Admin dashboard routes
│   │   ├── page.tsx           # Admin overview
│   │   ├── users/page.tsx     # User management
│   │   ├── transactions/page.tsx # Transaction management
│   │   └── settings/page.tsx  # Site controls
│   ├── auth/                   # Authentication routes
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── error/page.tsx
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles with design tokens
├── components/
│   ├── navigation/             # Navigation components
│   │   └── bottom-nav.tsx      # Mobile bottom navigation
│   ├── cards/                  # Card components
│   │   └── stat-cards.tsx      # Stats, balance, and transaction cards
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── actions/                # Server actions
│   │   └── index.ts            # Auth, user, and admin actions
│   └── supabase/               # Supabase client utilities
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── middleware.ts               # Next.js middleware for auth
├── scripts/
│   └── DATABASE_SETUP.sql      # Database schema and seed data
└── v0_plans/
    └── strategic-approach.md   # Detailed project architecture
```

## Features Overview

### User Application

#### Home Dashboard (`/app`)
- Real-time balance display with purple accent styling
- User greeting with avatar
- Profit and earnings cards
- Recent activity feed (tasks completed, withdrawals)
- Quick stats: User Growth chart, Transaction Distribution chart
- Navigation to other sections

#### Task Center (`/app/tasks`)
- Grid of available tasks with images
- Task difficulty levels (easy, medium, hard)
- Reward amounts clearly displayed
- Task counter (0/40 progress)
- Click to complete tasks

#### Wallet (`/app/wallet`)
- Wallet balance with USD formatting
- Profit earned display
- Frozen amount (pending verification)
- Action buttons: Deposit, Withdraw
- Real-time balance updates

#### Transaction Record (`/app/record`)
- Complete history of all transactions
- Filter by type (deposits, withdrawals, task earnings)
- Timestamp for each transaction
- Amount and status

#### User Profile (`/app/profile`)
- Display user information and avatar
- Security settings (password, 2FA, biometric)
- Privacy and notification preferences
- Dark mode toggle
- App version and about information
- Logout button

#### Bottom Navigation
- Home, Record, Task (floating action button), Wallet, Profile
- Mobile-optimized with persistent footer
- Purple highlight for active route

### Admin Dashboard

#### Overview (`/admin`)
- Key metrics cards:
  - Total Users
  - Platform Balance
  - Total Profit
  - Transaction Count
  - Pending Items
  - Today's Activity
- User Growth chart
- Tab navigation: Dashboard, Users, Transactions, Settings

#### User Management (`/admin/users`)
- Search users by name or email
- User list with:
  - Avatar and display name
  - Email address
  - User level
  - Account balance
  - Edit and delete actions

#### Transactions (`/admin/transactions`)
- View all platform transactions
- Filter and search capabilities
- Transaction details and status

#### Site Settings (`/admin/settings`)
- Site Controls:
  - Maintenance Mode toggle
  - New Registrations toggle
  - Deposits toggle
  - Withdrawals toggle
- Financial Settings:
  - Minimum Withdrawal amount input
  - Referral Bonus amount input
- Admin Notifications:
  - Pending withdrawal count
  - New transaction alerts

## Security & RLS Policies

All tables have Row Level Security enabled:

| Table | Users See | Admins See |
|-------|-----------|-----------|
| profiles | Own only | All + edit |
| transactions | Own only | All |
| task_completions | Own only | All |
| notifications | Own only | All |
| tasks | Active only | All + edit |
| levels | All | All |
| site_settings | All | All + edit |

**Admin Verification**: The `middleware.ts` checks `is_admin` flag before routing to `/admin` routes.

## Database Schema Details

### Profiles Table
```sql
id (UUID)                 - User ID (links to auth.users)
username (TEXT)           - Unique username
display_name (TEXT)       - User's display name
avatar_url (TEXT)         - Profile picture URL
bio (TEXT)                - User bio
is_admin (BOOLEAN)        - Admin access flag
level_id (UUID FK)        - Links to levels table
wallet_balance (DECIMAL)  - Current balance
total_earned (DECIMAL)    - Lifetime earnings
total_withdrawn (DECIMAL) - Total withdrawn
completed_tasks_count     - Task completion count
credit_rating (INTEGER)   - Credit score (0-100)
security_status (TEXT)    - "100% SECURE" or other
created_at, updated_at
```

### Transactions Table
```sql
id (UUID)              - Transaction ID
user_id (UUID FK)      - Links to profiles
type (TEXT)            - 'earning', 'deposit', 'withdrawal'
amount (DECIMAL)       - Transaction amount
status (TEXT)          - 'pending', 'completed', 'failed'
description (TEXT)     - Human-readable description
task_id (UUID FK)      - Links to tasks (optional)
metadata (JSONB)       - Additional data
created_at, updated_at
```

### Levels Table
```sql
id (UUID)                  - Level ID
level_number (INTEGER)     - 1, 2, 3, etc.
name (TEXT)                - "Level 1 Collector"
description (TEXT)         - Level description
min_tasks_required         - Minimum tasks to reach level
earning_multiplier         - Commission multiplier (1.0, 1.2, 1.5)
color_hex (TEXT)           - UI color for level
created_at, updated_at
```

### Tasks Table
```sql
id (UUID)                - Task ID
title (TEXT)             - Task name
description (TEXT)       - Task description
category (TEXT)          - 'music_matching', 'rating', etc.
image_url (TEXT)         - Task image/preview
reward_amount (DECIMAL)  - Payment for completion
difficulty_level (TEXT)  - 'easy', 'medium', 'hard'
time_estimate_minutes    - Expected completion time
is_active (BOOLEAN)      - Visible to users
requires_verification    - Needs admin verification
created_by (UUID FK)     - Admin who created task
created_at, updated_at
```

### Task Completions Table
```sql
id (UUID)           - Record ID
user_id (UUID FK)   - Links to profiles
task_id (UUID FK)   - Links to tasks
status (TEXT)       - 'completed', 'pending', 'verified'
reward_earned       - Amount paid for this completion
completed_at        - When user completed
verified_at         - When admin verified
verified_by         - Admin who verified
notes (TEXT)        - Admin notes
created_at
```

## API & Server Actions

All backend operations are in `lib/actions/index.ts`:

### Authentication
```typescript
signUp(email, password, displayName) -> Creates account
logIn(email, password) -> Authenticates user
logOut() -> Ends session
```

### User Operations
```typescript
getProfile() -> Fetch user profile
updateProfile(data) -> Update user info
getTransactions() -> Get user transactions
completeTask(taskId) -> Mark task complete
withdraw(amount) -> Request withdrawal
```

### Admin Operations
```typescript
getUsers(page) -> Paginated user list
updateUserLevel(userId, levelId) -> Change user tier
verifyTransaction(transactionId) -> Approve transaction
updateSettings(key, value) -> Change platform settings
```

## Development Workflow

1. **Local Development**: `pnpm dev`
2. **Database Changes**: Use Supabase SQL Editor
3. **Component Updates**: Edit files in `/components`
4. **Server Actions**: Modify `/lib/actions/index.ts`
5. **Add Pages**: Create new files in `/app`
6. **Testing**: Use browser DevTools (F12)

## Customization Guide

### Change Color Scheme
Edit `/app/globals.css`:
```css
:root {
  --primary: oklch(0.58 0.24 264.4);  /* Purple */
  --chart-1: oklch(0.62 0.18 264);    /* Chart colors */
  /* ... more colors ... */
}
```

### Add New Task Category
1. Add to tasks table via Supabase
2. Update type definitions if needed

### Modify Minimum Withdrawal
1. Go to Supabase SQL Editor
2. Run:
```sql
UPDATE site_settings 
SET value = '5' 
WHERE key = 'minimum_withdrawal';
```

### Make User Admin
1. In Supabase SQL Editor:
```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE display_name = 'User Name';
```

## Deployment to Vercel

### Quick Deploy

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New** → **Project**
4. Import your GitHub repo
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

Your app is live! 🎉

## Troubleshooting

### Issue: "Module not found: '@supabase/ssr'"
**Solution**: Run `pnpm install` to ensure all dependencies are installed

### Issue: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solution**: 
- Create `.env.local` file in project root
- Add your Supabase URL and Anon Key
- Restart dev server

### Issue: "RLS policy error" when inserting data
**Solution**:
- Ensure user email is confirmed in Supabase Auth
- Check that user has a profile record
- Run DATABASE_SETUP.sql if tables don't exist

### Issue: Admin dashboard not accessible
**Solution**:
- User must have `is_admin = TRUE` in profiles table
- Run this in Supabase SQL Editor:
```sql
UPDATE profiles SET is_admin = TRUE 
WHERE id = 'YOUR_USER_ID';
```

### Issue: Tasks not appearing on dashboard
**Solution**:
- Check tasks have `is_active = TRUE`
- Verify tasks table was created (run DATABASE_SETUP.sql)
- Query in Supabase: `SELECT COUNT(*) FROM tasks WHERE is_active = TRUE;`

## Performance Tips

- Use **Supabase Caching**: RLS policies cache user data
- **Database Indexes**: Already configured in migration
- **Next.js Code Splitting**: Automatic with App Router
- **Image Optimization**: Use Next.js Image component
- **Monitor Logs**: Check Supabase logs for slow queries

## Documentation Links

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
