'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'

export default function RecordPage() {
  return (
    <main className='pb-32'>
      {/* Header */}
      <div className='bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-6 pt-6 pb-8 sticky top-0 z-20'>
        <div className='flex items-center justify-between'>
          <Link href='/app' className='hover:opacity-80 transition-opacity'>
            <ChevronLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-xl font-bold'>Record</h1>
          <div className='w-6' />
        </div>
      </div>

      {/* Main Content */}
      <div className='px-6 py-6'>
        {/* Empty State */}
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
            <span className='text-2xl'>📋</span>
          </div>
          <h2 className='font-bold text-lg mb-2'>No Records Yet</h2>
          <p className='text-muted-foreground text-sm mb-6'>
            Your task history and records will appear here
          </p>
          <Link href='/app/tasks'>
            <Button className='bg-primary text-primary-foreground'>
              Start Your First Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active='record' />
    </main>
  )
}
