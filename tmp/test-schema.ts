import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
    const { data, error } = await supabase.from('profiles').select('id, username, phone, referral_code, referral_earned').limit(1);
    console.log("Error:", error);
    console.log("Data:", data);
}
check();
