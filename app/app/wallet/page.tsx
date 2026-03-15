'use client'

import { ChevronLeft, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { BalanceCard } from '@/components/cards/stat-cards'
import { TransactionHistory } from '@/components/cards/transaction-history'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/use-profile'
import { useTransactions } from '@/hooks/use-transactions'
import { Spinner } from '@/components/ui/spinner'

export default function WalletPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const { transactions, isLoading: transLoading } = useTransactions()

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
      <div className='bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-6 pt-6 pb-8 sticky top-0 z-20'>
        <div className='flex items-center justify-between mb-4'>
          <Link href='/app' className='hover:opacity-80 transition-opacity'>
            <ChevronLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-xl font-bold'>Wallet</h1>
          <div className='w-6' />
        </div>
      </div>

      {/* Main Content */}
      <div className='px-6 py-6 space-y-6'>
        {/* Balance Cards */}
        <div className='space-y-3'>
          <BalanceCard
            label='Wallet balance'
            amount={profile?.wallet_balance || 0}
            icon={ArrowDownLeft}
            variant='primary'
          />
          <BalanceCard
            label='Total Earned'
            amount={profile?.total_earned || 0}
            icon={TrendingUp}
            variant='success'
          />
        </div>

        {/* Action Buttons */}
        <div className='grid grid-cols-2 gap-3'>
          <Button className='bg-blue-500 hover:bg-blue-600'>
            <ArrowDownLeft className='w-4 h-4 mr-2' />
            Deposit
          </Button>
          <Button className='bg-orange-500 hover:bg-orange-600'>
            <ArrowUpRight className='w-4 h-4 mr-2' />
            Withdraw
          </Button>
        </div>

        {/* Transactions */}
        <div>
          <h2 className='font-bold text-lg mb-3'>Transaction History</h2>
          {transLoading ? (
            <div className='flex justify-center py-8'>
              <Spinner className='h-6 w-6' />
            </div>
          ) : (
            <TransactionHistory transactions={transactions} />
          )}
        </div>

        {/* Info Card */}
        <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
          <p className='text-xs text-blue-800 leading-relaxed'>
            Minimum withdrawal: $10. Your funds are secured and processed within 24 hours.
          </p>
        </div>
      </div>
    </main>
  )
}
