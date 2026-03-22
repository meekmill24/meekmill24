import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !serviceKey) {
    console.error("Missing env vars in .env.local");
    process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function promoteAdmin() {
    const email = 'mariacolon054@gmail.com';
    console.log(`Checking profile for: ${email}`);
    
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        return;
    }

    if (!profile) {
        console.error(`Profile with email ${email} not found.`);
        return;
    }

    console.log("Current profile state:", {
        id: profile.id,
        role: profile.role,
        is_admin: profile.is_admin
    });

    if (profile.role === 'admin' && profile.is_admin === true) {
        console.log("User is already an admin!");
        return;
    }

    console.log(`Promoting ${email} to admin...`);
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', is_admin: true })
        .eq('id', profile.id);

    if (updateError) {
        console.error("Error promoting user:", updateError);
    } else {
        console.log("Successfully promoted to admin!");
    }
}

promoteAdmin();
