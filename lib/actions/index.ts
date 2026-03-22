'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(email: string, password: string, displayName: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        display_name: displayName,
        is_admin: false,
      },
    },
  })

  if (error) throw error
  return data
}

export async function login(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  redirect('/auth/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const user = await getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function getAdminStatus() {
  const profile = await getUserProfile()
  return profile?.is_admin || false
}

export async function getTasksForUser() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function completeTask(taskId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('task_completions')
    .insert({
      user_id: userId,
      task_id: taskId,
      status: 'completed',
    })
    .select()
    .single()

  if (error) throw error

  // Get task reward and update user balance
  const { data: task } = await supabase
    .from('tasks')
    .select('reward_amount')
    .eq('id', taskId)
    .single()

  if (task) {
    const { error: updateError } = await supabase.rpc('add_transaction', {
      p_user_id: userId,
      p_type: 'task_reward',
      p_amount: task.reward_amount,
      p_description: `Reward for completing task`,
      p_task_id: taskId,
    })

    if (updateError) throw updateError
  }

  return data
}

export async function getUserTransactions(userId: string, limit = 20) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getAllUsers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, email, wallet_balance, total_earned, level_id, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getDashboardStats() {
  const supabase = await createClient()
  
  const [users, transactions, completions] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('transactions').select('amount'),
    supabase.from('task_completions').select('id', { count: 'exact' }),
  ])

  const totalBalance = transactions.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  return {
    totalUsers: users.count || 0,
    totalBalance,
    totalTransactions: transactions.data?.length || 0,
    completedTasks: completions.count || 0,
  }
}

export async function updateSiteSettings(key: string, value: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key, value }, { onConflict: 'key' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSiteSettings(key?: string) {
  const supabase = await createClient()
  
  let query = supabase.from('site_settings').select('*')
  
  if (key) {
    query = query.eq('key', key)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}
