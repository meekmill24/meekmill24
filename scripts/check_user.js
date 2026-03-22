const { createClient } = require('@supabase/supabase-js');

const url = 'https://zgrroyfdwubgtiooqhjs.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncnJveWZkd3ViZ3Rpb29xaGpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4ODAwOSwiZXhwIjoyMDg5MDY0MDA5fQ.hbeRZCIzZZ8OcaFsD2WB_WEwZukdw_hH27h_nI2PXD0';

const supabase = createClient(url, serviceKey);

async function checkUser() {
    const email = 'mariacolon054@gmail.com';
    console.log(`Checking profile for: ${email}`);
    
    // Find profile by email
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

    // Fix balance and info as needed
    if (profile.wallet_balance < 200 || !profile.username) {
        console.log("Fixing profile state...");
        const updateData = {};
        if (profile.wallet_balance < 200) updateData.wallet_balance = 200.68;
        if (!profile.username) updateData.username = 'Maria';
        if (!profile.display_name) updateData.display_name = 'Maria Colon';

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', profile.id);
        
        if (updateError) {
            console.error("Error updating balance:", updateError);
        } else {
            console.log("Successfully updated profile");
        }
    }
}

checkUser();
