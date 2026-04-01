import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log('--- SITE SETTINGS KEY SCAN ---');
    const { data: settings } = await supabase.from('site_settings').select('key, value');
    console.log(JSON.stringify(settings, null, 2));
}

run();
