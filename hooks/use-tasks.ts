import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface Task {
  id: string
  title: string
  description: string
  reward: number
  image_url: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  is_active: boolean
  created_at: string
}

export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR<{ tasks: Task[] }>(
    '/api/tasks',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    tasks: data?.tasks || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function createTask(taskData: {
  title: string
  description: string
  reward: string
  image_url: string
  category: string
  difficulty?: string
}) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  })

  if (!response.ok) {
    throw new Error('Failed to create task')
  }

  return response.json()
}
