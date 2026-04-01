'use client'

import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TransactionHistoryProps {
  transactions: Array<{
    id: string
    type: string
    amount: number
    description: string
    created_at: string
    status?: string
  }>
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '📥'
      case 'withdrawal':
        return '📤'
      case 'task_reward':
        return '✨'
      default:
        return '💳'
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-blue-100 text-blue-700'
      case 'withdrawal':
        return 'bg-orange-100 text-orange-700'
      case 'task_reward':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const isIncoming = (type: string) => {
    return type === 'deposit' || type === 'task_reward'
  }

  if (transactions.length === 0) {
    return (
      <Card className='p-4 text-center'>
        <p className='text-sm text-muted-foreground'>No transactions yet</p>
      </Card>
    )
  }

  return (
    <div className='space-y-3'>
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className='flex items-center justify-between rounded-lg border border-border bg-card p-4'
        >
          <div className='flex items-center gap-3'>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${getTransactionColor(
                transaction.type
              )}`}
            >
              <span className='text-lg'>{getTransactionIcon(transaction.type)}</span>
            </div>
            <div>
              <p className='font-medium capitalize'>
                {transaction.description || transaction.type.replace('_', ' ')}
              </p>
              <p className='text-xs text-muted-foreground'>
                {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className='text-right'>
            <p
              className={`font-semibold ${
                isIncoming(transaction.type) ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isIncoming(transaction.type) ? '+' : '-'}${transaction.amount.toFixed(2)}
            </p>
            {transaction.status && (
              <Badge
                variant='outline'
                className='text-xs'
              >
                {transaction.status}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
