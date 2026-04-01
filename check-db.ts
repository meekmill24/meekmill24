
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
    console.log('--- AUDITING PROFILES TABLE STRUCTURE ---');
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Database Protocol Failure:', error.message);
        return;
    }

    if (profiles && profiles.length > 0) {
        console.log('DETECTED COLUMNS:', Object.keys(profiles[0]).join(', '));
    } else {
        console.log('No participant data found to audit structure.');
    }
}

checkSchema();
