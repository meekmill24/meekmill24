import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

export class AdminAuthorizationError extends Error {
    status: number;

    constructor(message: string, status = 403) {
        super(message);
        this.name = 'AdminAuthorizationError';
        this.status = status;
    }
}

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    }

    if (!key) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    return createServiceClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

export function requireAutomationSecret(request: Request) {
    const secret = process.env.AI_RISK_AUTOMATION_SECRET || process.env.CRON_SECRET;

    if (!secret) {
        throw new AdminAuthorizationError('Automation secret is not configured', 503);
    }

    const authorization = request.headers.get('authorization');
    const directSecret = request.headers.get('x-risk-automation-secret');

    if (authorization === `Bearer ${secret}` || directSecret === secret) {
        return {
            adminClient: createAdminClient(),
        };
    }

    throw new AdminAuthorizationError('Forbidden', 403);
}

export async function requireAdminAccess() {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw new AdminAuthorizationError(userError.message, 401);
    }

    if (!user) {
        throw new AdminAuthorizationError('Unauthorized', 401);
    }

    const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('id, username, role, is_admin')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        throw new AdminAuthorizationError('Admin profile not found', 403);
    }

    if (!(profile.is_admin || profile.role === 'admin')) {
        throw new AdminAuthorizationError('Forbidden', 403);
    }

    return {
        user,
        profile,
        supabase,
        adminClient,
    };
}
