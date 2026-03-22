const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
    console.log('--- STARTING RESET ---');
    try {
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', 'mariacolon054@gmail.com')
            .single();

        if (pError || !profile) {
            console.error('User search failed:', pError?.message || 'USER NOT FOUND');
            process.exit(1);
        }

        console.log('ID FOUND:', profile.id);

        const { data, error } = await supabase.auth.admin.updateUserById(
            profile.id,
            { password: '12345678' }
        );

        if (error) {
            console.error('UPDATE ERROR:', error.message);
            process.exit(1);
        }

        console.log('--- RESET SUCCESSFUL ---');
        process.exit(0);
    } catch (err) {
        console.error('CRITICAL ERROR:', err.message);
        process.exit(1);
    }
}

reset();
