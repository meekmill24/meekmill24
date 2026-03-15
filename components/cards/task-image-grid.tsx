'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface TaskGridProps {
  tasks: Array<{
    id: string
    title: string
    image_url: string
    reward?: number
  }>
  onTaskClick?: (taskId: string) => void
}

export function TaskImageGrid({ tasks, onTaskClick }: TaskGridProps) {
  return (
    <div className='grid grid-cols-3 gap-3'>
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onTaskClick?.(task.id)}
          className='group relative h-24 overflow-hidden rounded-xl'
        >
          <div className='relative h-full w-full overflow-hidden bg-muted'>
            {task.image_url ? (
              <Image
                src={task.image_url}
                alt={task.title}
                fill
                className='object-cover transition-transform group-hover:scale-110'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10'>
                <div className='text-center'>
                  <div className='text-xs font-medium text-muted-foreground'>{task.title}</div>
                </div>
              </div>
            )}
            {task.reward && (
              <div className='absolute bottom-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-white'>
                +${task.reward}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
