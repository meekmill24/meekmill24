import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use globalThis to maintain singleton in Next.js dev mode/hot reloads
const globalForSupabase = globalThis as unknown as {
    supabase?: SupabaseClient;
};

export const supabase: SupabaseClient = globalForSupabase.supabase || (() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    console.log("Supabase Client URL:", supabaseUrl);
    const client = createBrowserClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key',
    );

    globalForSupabase.supabase = client;

    return client;
})();
