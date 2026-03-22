import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual env loading
const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        env[key.trim()] = values.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing configuration in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const defaultSettings = [
    { key: 'site_name', value: 'Captiv8', data_type: 'text', description: 'Platform Headline' },
    { key: 'primary_color', value: '#6366f1', data_type: 'color', description: 'Primary Brand Color' },
    { key: 'support_link', value: 'https://t.me/captiv8_support', data_type: 'text', description: 'Support Telegram/URL' },
    { key: 'default_language', value: 'en', data_type: 'text', description: 'Default Platform Language' },
    { key: 'default_currency', value: 'USD', data_type: 'text', description: 'Base Currency Package' }
];

async function seedSettings() {
    console.log('Seeding site settings...');
    
    for (const setting of defaultSettings) {
        // Use a simpler approach for checking existence
        const { data, error } = await supabase
            .from('site_settings')
            .select('key')
            .eq('key', setting.key);
            
        if (error) {
            console.error(`Error checking key ${setting.key}:`, error);
            continue;
        }
        
        if (!data || data.length === 0) {
            console.log(`Inserting missing key: ${setting.key}`);
            const { error: insError } = await supabase
                .from('site_settings')
                .insert(setting);
            if (insError) console.error(`Error inserting ${setting.key}:`, insError);
        } else {
            console.log(`Key exists: ${setting.key}`);
        }
    }
    
    console.log('Seeding complete.');
}

seedSettings().catch(console.error);
