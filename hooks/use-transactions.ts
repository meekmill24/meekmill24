import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface Transaction {
  id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'task_reward'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export function useTransactions(userId?: string) {
  const url = userId ? `/api/transactions?userId=${userId}` : '/api/transactions'

  const { data, error, isLoading, mutate } = useSWR<{ transactions: Transaction[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    transactions: data?.transactions || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createTransaction(transactionData: {
  type: string
  amount: string
  description: string
}) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData),
  })

  if (!response.ok) {
    throw new Error('Failed to create transaction')
  }

  return response.json()
}
