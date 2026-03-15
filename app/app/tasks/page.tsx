'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'

interface TaskImage {
  id: string
  url: string
  title: string
}

export default function TasksPage() {
  const [currentSet, setCurrentSet] = useState(1)
  const [progress, setProgress] = useState(0)
  const totalTasks = 40

  // Placeholder task images
  const taskImages: TaskImage[] = Array.from({ length: 12 }).map((_, i) => ({
    id: `task-${i}`,
    url: '',
    title: `Task ${i + 1}`,
  }))

  return (
    <main className='pb-32'>
      {/* Header */}
      <div className='bg-gradient-to-b from-gray-950 to-gray-900 text-white px-6 pt-6 pb-6 sticky top-0 z-20'>
        <div className='flex items-center justify-between mb-4'>
          <Link href='/app' className='hover:opacity-80 transition-opacity'>
            <ChevronLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-xl font-bold'>Simple Music Task</h1>
          <div className='w-6' />
        </div>

        {/* Tab Navigation */}
        <div className='flex gap-2 overflow-x-auto'>
          {[1, 2, 3].map((set) => (
            <button
              key={set}
              onClick={() => setCurrentSet(set)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                currentSet === set
                  ? 'bg-white text-gray-950'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Set {set}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className='px-6 py-6'>
        {/* Progress Stats */}
        <div className='bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs text-muted-foreground mb-1'>SET {currentSet} OF 3</p>
              <p className='text-2xl font-bold text-primary'>{progress} / {totalTasks}</p>
            </div>
            <div className='text-right'>
              <p className='text-3xl font-bold text-foreground'>{Math.round((progress / totalTasks) * 100)}%</p>
              <p className='text-xs text-muted-foreground'>Complete</p>
            </div>
          </div>
        </div>

        {/* Task Grid */}
        <div className='mb-8'>
          <h2 className='font-bold text-lg mb-3'>Match the Music</h2>
          <div className='grid grid-cols-4 gap-3'>
            {taskImages.map((image, idx) => (
              <div
                key={image.id}
                className='aspect-square rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group'
              >
                <div className='w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white relative'>
                  <div className='absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity' />
                  <span className='text-2xl font-bold'>{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
          <h3 className='font-semibold text-sm text-blue-900 mb-2'>How it works</h3>
          <p className='text-xs text-blue-800 leading-relaxed'>
            Match 40 music tracks to their corresponding images. Each correct match earns you rewards. Complete all sets to unlock higher earning levels.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active='task' />
    </main>
  )
}
