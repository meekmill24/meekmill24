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

const supabase = createClient(url, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runCheck() {
    const targetEmail = 'mariacolon054@gmail.com';
    console.log(`Checking user: ${targetEmail}`);

    // Step 1: Check auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error("Error listing users:", authError);
        return;
    }

    const user = users.find(u => u.email === targetEmail);
    if (!user) {
        console.error(`User with email ${targetEmail} not found in auth.users.`);
        return;
    }

    console.log(`Found auth user! ID: ${user.id}`);

    // Step 2: Check public.profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError) {
        console.error("Error fetching profile:", profileError);
    }

    if (!profile) {
        console.log("Profile not found. Creating it...");
        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: targetEmail,
                username: targetEmail.split('@')[0],
                display_name: targetEmail.split('@')[0],
                role: 'admin',
                is_admin: true
            });
        if (insertError) {
            console.error("Error creating profile:", insertError);
        } else {
            console.log("Successfully created admin profile!");
        }
    } else {
        console.log("Profile exists. Current state:", {
            role: profile.role,
            is_admin: profile.is_admin
        });
        if (profile.role !== 'admin' || !profile.is_admin) {
            console.log("Promoting existing profile to admin...");
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'admin', is_admin: true })
                .eq('id', user.id);
            if (updateError) {
                console.error("Error promoting user:", updateError);
            } else {
                console.log("Successfully promoted to admin!");
            }
        } else {
            console.log("User is already an admin!");
        }
    }
}

runCheck().catch(console.error);
