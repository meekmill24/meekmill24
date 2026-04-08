import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugReferral() {
  console.log('--- DEBUG REFERRAL SYSTEM ---');
  
  // 1. Check Meek (Referrer)
  const { data: meek, error: meekErr } = await supabase
    .from('profiles')
    .select('id, username, referral_code, wallet_balance, referral_earned')
    .eq('username', 'meek')
    .single();
    
  if (meekErr) console.error('Meek profile not found:', meekErr);
  else console.log('Meek profile:', meek);

  // 2. Check Test4 (Referree)
  const { data: test4, error: test4Err } = await supabase
    .from('profiles')
    .select('id, username, referred_by, wallet_balance')
    .eq('username', 'test4')
    .single();

  if (test4Err) console.error('Test4 profile not found:', test4Err);
  else {
    console.log('Test4 profile:', test4);
    if (meek && test4.referred_by !== meek.id) {
        console.error(`BUG: test4.referred_by (${test4.referred_by}) does NOT match meek.id (${meek.id})`);
    } else {
        console.log('SUCCESS: Referral link verified.');
    }
  }

  // 3. Check Settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .in('key', ['referral_commission_rate']);
    
  console.log('Settings:', settings);

  // 4. Check Test4 all tasks
  const { data: tasks } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', test4?.id)
    .order('created_at', { ascending: false });

  console.log('Test4 all tasks:', tasks?.map(t => ({ id: t.id, status: t.status, earned_amount: t.earned_amount, completed_at: t.completed_at })));


  // 5. Check for commission transactions for Meek
  const { data: commissions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', meek?.id)
    .eq('type', 'commission')
    .order('created_at', { ascending: false })
    .limit(10);
    
  console.log('Meek latest commissions:', commissions?.map(c => ({ amount: c.amount, desc: c.description })));

}

debugReferral();
