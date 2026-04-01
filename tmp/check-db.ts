
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSync() {
    console.log('--- MATRIX DATABASE INTEGRITY AUDIT ---');

    console.log('1. Checking LEVELS table content...');
    const { data: levels } = await supabase.from('levels').select('*').order('id', { ascending: true });
    console.table(levels);

    console.log('\n2. Random Sample Check for Profile Level Joins...');
    const { data: profileCheck } = await supabase
        .from('profiles')
        .select(`
            email,
            level_id,
            level:levels (
                id,
                name,
                price,
                tasks_per_set
            )
        `)
        .limit(3);
    
    console.log(JSON.stringify(profileCheck, null, 2));

    console.log('--- AUDIT COMPLETE ---');
}

checkSync();
