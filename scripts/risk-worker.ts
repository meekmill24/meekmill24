import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { runRiskAutomationCycle } from '@/lib/risk/orchestration';
import { processPendingRiskEvents } from '@/lib/risk/runtime';
import { activateRiskModel, processQueuedTrainingRuns } from '@/lib/risk/training';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

async function main() {
    const mode = process.argv[2] || 'all';
    const limit = Number(process.argv[3] || (mode === 'events' ? 25 : 1));

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const output: Record<string, unknown> = {};
    if (mode === 'cycle') {
        output.cycle = await runRiskAutomationCycle(adminClient, {
            eventBatchSize: Number(process.argv[3] || 25),
            maxEventBatches: Number(process.argv[4] || 4),
            maxTrainingRuns: Number(process.argv[5] || 1),
            forceQueueTraining: process.argv.includes('--force-queue'),
        });
    }

    if (mode === 'events' || mode === 'all') {
        output.events = await processPendingRiskEvents(adminClient, limit);
    }

    if (mode === 'training' || mode === 'all') {
        output.training = await processQueuedTrainingRuns(adminClient, mode === 'all' ? 1 : limit);
    }

    if (mode === 'activate') {
        const modelIdArg = process.argv[3];
        const modelId = modelIdArg ? Number(modelIdArg) : undefined;
        output.activation = await activateRiskModel(adminClient, Number.isFinite(modelId) ? modelId : undefined);
    }

    console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
