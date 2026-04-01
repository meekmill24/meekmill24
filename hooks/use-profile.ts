import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface UserProfile {
  id: string
  username: string
  display_name: string
  email: string
  phone_number: string
  level_id: string | null
  wallet_balance: number
  total_earned: number
  completed_tasks_count: number
  referral_code?: string
  credit_rating?: number
  is_secure?: boolean
  created_at?: string
  profit: number
  yesterday_profit: number
  freeze_balance: number
  total_volume: number
  last_reset_at?: string
  completed_count: number
  current_set: number
  referral_earned: number
  salary_days_count: number
  last_work_day_at?: string
  pending_bundle?: any
  withdrawal_wallet_address?: string
  avatar_url?: string
  referred_users_count: number
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<{ profile: UserProfile }>(
    '/api/profile',
    fetcher,
    {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 10000 // 10 seconds
    }
  )

  return {
    profile: data?.profile,
    isLoading,
    isError: error,
    mutate,
  }
}

export async function updateProfile(displayName: string) {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: displayName }),
  })

  if (!response.ok) {
    throw new Error('Failed to update profile')
  }

  return response.json()
}
