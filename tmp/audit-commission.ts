import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('--- DATABASE SCHEMA AUDIT ---');
    
    // Check profiles columns
    const { data: profileCols } = await supabase.from('profiles').select('*').limit(1);
    if (profileCols && profileCols.length > 0) {
        console.log('Profile Columns:', Object.keys(profileCols[0]));
    }

    // Check site_settings for welcome_bonus
    const { data: settings } = await supabase.from('site_settings').select('*');
    console.log('Current Settings:', JSON.stringify(settings, null, 2));
    
    // Ensure welcome_bonus exists
    const hasBonus = settings?.some(s => s.key === 'welcome_bonus');
    if (!hasBonus) {
        console.log('Creating welcome_bonus registry node...');
        await supabase.from('site_settings').insert({
            key: 'welcome_bonus',
            value: '15',
            data_type: 'number',
            description: 'Institutional Welcome Bonus for new agents.'
        });
    }
}

run();
