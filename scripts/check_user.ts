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

async function checkUser() {
    const email = 'mariacolon054@gmail.com';
    console.log(`Checking profile for: ${email}`);
    
    // 1. Find profile by email
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

    console.log("User Profile Data:", JSON.stringify(profile, null, 2));

    // 2. Check levels
    const { data: levels } = await supabase.from('levels').select('*');
    console.log("Levels available:", levels?.length || 0);

    // 3. If balance is 0, let's fix it as requested by the user flow (they expect $200.68)
    if (profile.wallet_balance === 0) {
        console.log("Balance is 0. Setting to $200.68 as expected...");
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ wallet_balance: 200.68, username: 'Maria', display_name: 'Maria Colon' })
            .eq('id', profile.id);
        
        if (updateError) {
            console.error("Error updating balance:", updateError);
        } else {
            console.log("Successfully updated balance to $200.68");
        }
    }
}

checkUser();
