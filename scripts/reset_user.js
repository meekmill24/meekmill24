const { createClient } = require('@supabase/supabase-js');

const url = 'https://zgrroyfdwubgtiooqhjs.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncnJveWZkd3ViZ3Rpb29xaGpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4ODAwOSwiZXhwIjoyMDg5MDY0MDA5fQ.hbeRZCIzZZ8OcaFsD2WB_WEwZukdw_hH27h_nI2PXD0';

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetUserPassword() {
    const email = 'mariacolon054@gmail.com';
    const newPassword = 'Password123!';
    
    console.log(`Searching for user: ${email}`);
    
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
        console.error("Error listing users:", listError);
        return;
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
        console.error("User not found in Auth.");
        return;
    }
    
    console.log(`Found user: ${user.id}. Updating password to ${newPassword}...`);
    
    const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );
    
    if (error) {
        console.error("Error updating password:", error);
    } else {
        console.log("Successfully updated password!");
    }
}

resetUserPassword();
