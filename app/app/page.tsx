'use client'

import { useEffect, useState } from 'react'
import { BarChart3, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { BalanceCard, TransactionItem } from '@/components/cards/stat-cards'
import { TransactionHistory } from '@/components/cards/transaction-history'
import { TaskImageGrid } from '@/components/cards/task-image-grid'
import { useProfile } from '@/hooks/use-profile'
import { useTransactions } from '@/hooks/use-transactions'
import { useTasks } from '@/hooks/use-tasks'
import { Spinner } from '@/components/ui/spinner'

export default function HomePage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const { transactions, isLoading: transLoading } = useTransactions()
  const { tasks, isLoading: tasksLoading } = useTasks()
  
  const recentTransactions = transactions.slice(0, 3)

  if (profileLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner className='h-8 w-8' />
      </div>
    )
  }

  return (
    <main className='pb-32'>
      {/* Header */}
      <div className='bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-6 pt-8 pb-6'>
        <div className='flex items-center justify-between mb-2'>
          <h1 className='text-2xl font-bold'>Simple Music</h1>
          <button className='bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors'>
            <AlertCircle className='w-5 h-5' />
          </button>
        </div>
        <p className='text-sm text-white/80'>1-5000 USDT reward available now</p>
      </div>

      {/* Main Content */}
      <div className='px-6 py-6 space-y-6'>
        {/* User Profile Section */}
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold'>
            {profile?.display_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className='font-semibold'>Hello, {profile?.display_name || 'User'}</p>
            <p className='text-xs text-muted-foreground'>{profile?.email}</p>
          </div>
        </div>

        {/* Balance Cards Grid */}
        <div className='grid grid-cols-1 gap-3'>
          <BalanceCard
            label='Wallet balance'
            amount={profile?.wallet_balance || 0}
            icon={DollarSign}
            variant='primary'
          />
          <BalanceCard
            label='Profit'
            amount={profile?.total_earned || 0}
            icon={TrendingUp}
            variant='success'
          />
          <BalanceCard
            label='Tasks Completed'
            amount={profile?.completed_tasks_count || 0}
            icon={AlertCircle}
          />
        </div>

        {/* Credit Rating */}
        <div className='bg-gray-900 text-white rounded-2xl p-4'>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-sm font-semibold text-gray-400'>CREDIT RATING</span>
            <span className='text-sm font-semibold text-green-400'>100% SECURE</span>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex-1 bg-gray-800 rounded-full h-2 overflow-hidden'>
              <div className='bg-gradient-to-r from-purple-400 to-cyan-400 h-full w-full'></div>
            </div>
          </div>
        </div>

        {/* Task Section */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='font-bold text-lg'>Simple Music Task</h2>
            <span className='text-xs font-semibold text-primary'>
              {profile?.completed_tasks_count || 0} / 40
            </span>
          </div>

          {/* Task Grid */}
          {tasksLoading ? (
            <div className='flex justify-center py-8'>
              <Spinner className='h-6 w-6' />
            </div>
          ) : tasks.length > 0 ? (
            <TaskImageGrid tasks={tasks.slice(0, 12)} />
          ) : (
            <div className='text-center py-8 text-muted-foreground'>No tasks available</div>
          )}

          {/* Important Notes */}
          <div className='bg-white border-l-4 border-primary rounded-lg p-4 mt-4'>
            <div className='flex items-start gap-2'>
              <AlertCircle className='w-5 h-5 text-primary flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-semibold text-sm mb-1'>IMPORTANT NOTES</p>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Hours of operation (Eastern Time): 09:00 AM - 09:00 PM.
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed mt-1'>
                  If you have any questions, please contact Customer Service within the Customer Service hours.
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed mt-1'>
                  Matching tasks optimization finalized by AI matching protocol. Secure transactions guaranteed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentTransactions.length > 0 && (
          <div>
            <h2 className='font-bold text-lg mb-3'>Recent Activity</h2>
            <TransactionHistory transactions={recentTransactions} />
          </div>
        )}
      </div>
    </main>
  )
}
