import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (client) return client

  client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token-money',
      },
    }
  )

  return client
}
