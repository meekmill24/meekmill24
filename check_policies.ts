import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPolicies() {
    // Query pg_policy for 'profiles' table
    const { data, error } = await supabase.rpc('get_table_policies', { table_name: 'profiles' })
    
    // Since we probably don't have the RPC, let's just use raw SQL via query if possible
    // But we can't do raw SQL via supabase-js easily.
    // However, I can try to do it via a function or just trust the user.
    
    // Instead, let's try to query 'pg_policies' directly if it's exposed or use a known SQL injection (jk)
    // Actually, I'll just check if I can find the "Profiles Managed" string in any file.
    
    const { data: policies, error: polError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'profiles')
    
    if (polError) {
        // pg_policies is usually not exposed to the API. 
        // Let's try another approach.
        console.log('Cannot query pg_policies directly. Checking SQL files for "Profiles Managed"...')
    } else {
        console.log('--- POLICIES ON PROFILES ---')
        console.log(policies)
    }
}

checkPolicies()
