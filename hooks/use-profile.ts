import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface UserProfile {
  id: string
  display_name: string
  email: string
  level_id: string | null
  wallet_balance: number
  total_earned: number
  completed_tasks_count: number
  referral_code?: string
  credit_rating?: number
  is_secure?: boolean
  created_at?: string
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<{ profile: UserProfile }>(
    '/api/profile',
    fetcher
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
