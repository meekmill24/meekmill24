import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  // Get the access token from cookies if available
  // It matches the storageKey: 'sb-auth-token-money' in lib/supabase.ts
  const tokenData = cookieStore.get('sb-auth-token-money')?.value
  let accessToken = null;
  
  if (tokenData) {
    try {
        const parsed = JSON.parse(tokenData);
        accessToken = parsed.access_token;
    } catch (e) {
        accessToken = tokenData;
    }
  }
  
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : undefined,
    }
  )

  return supabase
}
