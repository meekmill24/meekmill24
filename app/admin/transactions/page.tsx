'use client'

import { ChevronLeft, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminTransactionsPage() {
  return (
    <main>
      {/* Header */}
      <div className='bg-gradient-to-r from-gray-950 to-gray-900 text-white px-6 py-8 sticky top-0 z-20'>
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/admin' className='hover:opacity-80 transition-opacity'>
            <ChevronLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-3xl font-bold'>Transaction Management</h1>
        </div>

        {/* Filters */}
        <div className='flex gap-3 flex-wrap'>
          <Input
            type='text'
            placeholder='Search transactions...'
            className='flex-1 min-w-[200px] bg-gray-800 border-gray-700 text-white'
          />
          <Button className='bg-gray-700 hover:bg-gray-600 text-white'>
            <Filter className='w-4 h-4 mr-2' />
            Filter
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='bg-card rounded-lg border border-border overflow-hidden'>
          <table className='w-full'>
            <thead className='border-b border-border bg-muted'>
              <tr>
                <th className='px-6 py-3 text-left text-sm font-semibold'>User</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Type</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Amount</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Status</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Date</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              <tr className='hover:bg-muted/50 transition-colors'>
                <td colSpan={5} className='px-6 py-8 text-center text-muted-foreground'>
                  No transactions yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
