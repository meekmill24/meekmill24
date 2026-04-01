import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function run() {
    console.log('--- SITE SETTINGS AUDIT ---');
    const { data: settings } = await supabase.from('site_settings').select('*').limit(1);
    console.log('Site Settings:', JSON.stringify(settings, null, 2));

    console.log('\n--- LEVELS AUDIT ---');
    const { data: levels } = await supabase.from('levels').select('*').order('price', { ascending: true });
    console.log('Levels:', JSON.stringify(levels, null, 2));

    console.log('\n--- SAMPLE USER METADATA (FOR REFERRAL) ---');
    const { data: profiles } = await supabase.from('profiles').select('id, username, wallet_balance, referral_code_used, referral_code').limit(5);
    console.log('Sample Profiles:', JSON.stringify(profiles, null, 2));
}

run();
