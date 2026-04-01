
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncLevels() {
    console.log('--- MATRIX LEVEL SYNC INITIATED ---');

    const expectedLevels = [
        { 
            name: 'JUNIOR NODE AGENT', 
            price: 100, 
            commission_rate: 0.00, 
            tasks_per_set: 40,
            description: 'Optimal Entry node for high-frequency pulse verification and basic yield capture.'
        },
        { 
            name: 'ASSOCIATE NODE AGENT', 
            price: 500, 
            commission_rate: 0.001, 
            tasks_per_set: 45,
            description: 'Advanced institutional node with expanded capacity for professional agents.'
        }
    ];

    for (let i = 0; i < expectedLevels.length; i++) {
        const level = expectedLevels[i];
        const levelId = i + 1;

        console.log(`Syncing Node ${levelId}: ${level.name}...`);
        
        const { data, error } = await supabase
            .from('levels')
            .upsert({ 
                id: levelId, 
                ...level 
            }, { onConflict: 'id' });

        if (error) console.error(`Error syncing level ${levelId}:`, error);
        else console.log(`Node ${levelId} SUCCESSFUL.`);
    }

    console.log('--- MATRIX LEVEL SYNC COMPLETE ---');
}

syncLevels();
