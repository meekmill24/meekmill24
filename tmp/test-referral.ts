import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runTest() {
  console.log('--- STARTING REFERRAL TEST ---');

  // 1. Look up Admin
  const { data: { users }, error: errAdmin } = await supabaseAdmin.auth.admin.listUsers();
  if (errAdmin) throw errAdmin;
  
  const adminUser = users.find(u => u.email === 'mariacolon054@gmail.com');
  if (!adminUser) {
     console.log('Admin user not found!');
     return;
  }
  
  console.log('Admin found:', adminUser.email, '| ID:', adminUser.id);
  
  // 2. Check Admin Profile
  let { data: adminProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', adminUser.id).single();
  
  if (!adminProfile) {
     console.log('Admin profile not found!');
     return;
  }
  
  // Let's ensure the referral code is exactly MEEK
  const targetCode = 'MEEK';
  if (adminProfile.referral_code?.toUpperCase() !== targetCode) {
      console.log(`Updating admin referral code from ${adminProfile.referral_code} to ${targetCode}`);
      await supabaseAdmin.from('profiles').update({ referral_code: targetCode }).eq('id', adminUser.id);
      adminProfile.referral_code = targetCode;
  }
  console.log(`Admin Referral Code Ready: ${adminProfile.referral_code}`);

  // 3. Create a test user via Admin API
  const testUsername = `testuser_${Date.now()}`;
  const testEmail = `${testUsername}@captiv8.io`;
  
  console.log(`\nCreating new user: ${testUsername} with referral code: ${targetCode}`);
  
  const { data: newUserObj, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'password123',
      email_confirm: true,
      user_metadata: {
          username: testUsername,
          referral_code_used: targetCode
      }
  });
  
  if (createErr) throw createErr;
  console.log('User created:', newUserObj.user.id);
  
  // Wait for trigger
  console.log('Waiting 2 seconds for DB trigger to create profile...');
  await new Promise(r => setTimeout(r, 2000));
  
  // Trigger the same logic block used in our API
  console.log('Running API Profile Linking Logic...');
  const { data: referrerProfile } = await supabaseAdmin.from('profiles').select('id').eq('referral_code', targetCode).single();
  
  if (referrerProfile) {
     await supabaseAdmin.from('profiles').update({
        referred_by: referrerProfile.id
     }).eq('id', newUserObj.user.id);
     console.log('API Logic applied: profile linked.');
  }

  // 4. Verify linking
  const { data: testProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', newUserObj.user.id).single();
  
  if (testProfile?.referred_by === adminProfile.id) {
     console.log(`\n✅ SUCCESS! Target user profile updated. referred_by matches admin's ID (${adminProfile.id})`);
  } else {
     console.log(`\n❌ FAILED! referred_by mismatch. Expected ${adminProfile.id}, got ${testProfile?.referred_by}`);
  }

}

runTest().catch(console.error);
