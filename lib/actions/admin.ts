'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLevels() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('id', { ascending: true })
  
  if (error) throw error
  return data
}

export async function updateLevel(id: number, updates: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('levels')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  revalidatePath('/admin/levels')
  return data
}

export async function getAdminTasks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function upsertAdminTask(task: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .upsert(task)
    .select()
    .single()
  
  if (error) throw error
  revalidatePath('/admin/tasks')
  revalidatePath('/app/tasks')
  return data
}

export async function deleteAdminTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/admin/tasks')
  revalidatePath('/app/tasks')
}

export async function updateTransactionStatus(id: string, status: 'approved' | 'rejected' | 'completed', adminId: string) {
  const supabase = await createClient()
  
  // Start transaction update
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()
  
  if (fetchError) throw fetchError
  if (transaction.status !== 'pending') throw new Error('Transaction is already processed')

  const { data, error } = await supabase
    .from('transactions')
    .update({ 
      status, 
      processed_by: adminId,
      processed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error

  // If it was a deposit and was approved, we need to update the user balance?
  // Actually, usually the RPC add_transaction handles this or a trigger.
  // But for simple-money parity, we might need manual logic if not handled by DB triggers.
  
  revalidatePath('/admin/transactions')
  return data
}
