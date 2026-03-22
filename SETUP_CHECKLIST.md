# Simple  - Setup Checklist

Use this checklist to ensure your application is properly configured and ready to use.

## Pre-Setup
- [ ] Have a Supabase account (sign up at supabase.com)
- [ ] Node.js 18+ installed on your computer
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Code editor (VS Code recommended)

## Supabase Setup
- [ ] Created Supabase project named "simple-music"
- [ ] Copied Project URL to text editor
- [ ] Copied Anon Key to text editor
- [ ] Noted down database password (keep safe)

## Application Setup
- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to `.env.local`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Ran `pnpm install` to install dependencies
- [ ] No npm/pnpm errors during installation

## Database Setup
- [ ] Opened SQL Editor in Supabase dashboard
- [ ] Copied entire content from `scripts/DATABASE_SETUP.sql`
- [ ] Pasted into SQL Editor
- [ ] Clicked Run button
- [ ] Confirmed "Query executed successfully"
- [ ] No error messages in output

## Table Verification
In Supabase **Table Editor**, verify these tables exist:
- [ ] `profiles`
- [ ] `levels`
- [ ] `tasks`
- [ ] `task_completions`
- [ ] `transactions`
- [ ] `site_settings`
- [ ] `notifications`

## Data Verification
In Supabase **SQL Editor**, run these to verify seed data:
```sql
-- Should return 3 levels
SELECT COUNT(*) FROM levels;

-- Should return 4 sample tasks
SELECT COUNT(*) FROM tasks;

-- Should return 7 settings
SELECT COUNT(*) FROM site_settings;
```

- [ ] All queries returned expected results
- [ ] No errors in queries

## Application Launch
- [ ] Ran `pnpm dev` without errors
- [ ] Dev server started on http://localhost:3000
- [ ] No console errors in terminal

## Application Testing

### Sign Up Test
- [ ] Navigated to http://localhost:3000/auth/sign-up
- [ ] Filled in display name, email, password
- [ ] Clicked Sign Up button
- [ ] Redirected to login page
- [ ] Login with created credentials successful
- [ ] Home dashboard loaded correctly
- [ ] Display name appears in top section

### Navigation Test
- [ ] Home page (/) works and shows dashboard
- [ ] Tasks page (/app/tasks) shows task grid
- [ ] Wallet page (/app/wallet) shows balance
- [ ] Record page (/app/record) shows history
- [ ] Profile page (/app/profile) shows account settings
- [ ] Bottom navigation works on all pages

### Data Display Test
- [ ] Home shows balance card
- [ ] Home shows profit card
- [ ] Home shows recent activity
- [ ] Charts render without errors
- [ ] Task rewards display correctly
- [ ] Transaction amounts format as currency

## Admin Setup

### Make User Admin
In Supabase **SQL Editor**, run:
```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'your.email@example.com'
);
```

- [ ] Query executed successfully
- [ ] Logout and login again
- [ ] Admin dashboard link now appears

### Admin Dashboard Test
- [ ] Admin dashboard loads at `/admin`
- [ ] Stats cards display (Users, Balance, Profit, etc.)
- [ ] Users tab shows user list
- [ ] Transactions tab shows transactions
- [ ] Settings tab shows site controls
- [ ] Can view and interact with all sections

## Production Checklist (Before Deploying)

- [ ] All `.env.local` values verified correct
- [ ] No console errors in development
- [ ] All pages load without errors
- [ ] Authentication flow works end-to-end
- [ ] Database RLS policies working (can see own data only)
- [ ] Admin user verified and tested
- [ ] Ready to deploy to Vercel

## Troubleshooting

If you encounter issues, check:

**Module not found: '@supabase/ssr'**
- [ ] Run `pnpm install` again
- [ ] Delete `node_modules` folder and `.pnpm-lock.yaml`, then `pnpm install`

**NEXT_PUBLIC_SUPABASE_URL is not defined**
- [ ] Check `.env.local` exists in project root
- [ ] Verify both keys are present
- [ ] Restart dev server after adding env vars

**RLS policy violation**
- [ ] Ensure user email is confirmed
- [ ] Run DATABASE_SETUP.sql again if policies missing
- [ ] User must exist in profiles table

**Tables don't exist**
- [ ] Go to Supabase SQL Editor
- [ ] Run DATABASE_SETUP.sql completely
- [ ] Check for any error messages
- [ ] Refresh Table Editor view

**Admin dashboard not accessible**
- [ ] Run the "Make User Admin" SQL command above
- [ ] Logout and login again
- [ ] Check `is_admin` column in profiles table

## Next Steps

1. **Customize Colors**: Edit `app/globals.css` to change the theme
2. **Add Real Tasks**: Insert tasks into database via Supabase
3. **Configure Settings**: Update site_settings via admin panel
4. **Deploy to Vercel**: Push to GitHub and deploy
5. **Monitor Analytics**: Track user activity in Supabase

## Support Resources

- **README.md**: Comprehensive setup and feature documentation
- **v0_plans/strategic-approach.md**: Architecture and design details
- **scripts/DATABASE_SETUP.sql**: Database schema with comments
- **lib/actions/index.ts**: Server action documentation

## Deployment to Vercel

When ready to deploy:

1. [ ] Code pushed to GitHub
2. [ ] Vercel project created
3. [ ] Environment variables added to Vercel:
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. [ ] Initial deployment successful
5. [ ] Production URL working
6. [ ] Authentication working in production
7. [ ] Database connection working in production

---

**Completed**: ✅ (Mark this box when all items are done)

Once all items are checked, your Simple  application is ready for use!
