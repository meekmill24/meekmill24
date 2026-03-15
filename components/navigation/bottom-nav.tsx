import Link from 'next/link'
import { Home, Clock, Wallet, User, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  active?: string
}

export function BottomNav({ active = 'home' }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', href: '/app', icon: Home },
    { id: 'record', label: 'Record', href: '/app/record', icon: Clock },
    { id: 'task', label: 'Task', href: '/app/tasks', icon: Play, isCenter: true },
    { id: 'wallet', label: 'Wallet', href: '/app/wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', href: '/app/profile', icon: User },
  ]

  return (
    <nav className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md lg:max-w-4xl bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-border px-4 py-3 z-40 transform-gpu'>
      <div className='flex items-center justify-between gap-2'>
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.isCenter) {
            return (
              <div key={item.id} className='flex-1' />
            )
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 rounded-lg transition-colors',
                active === item.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className='w-6 h-6' />
              <span className='text-xs mt-1 font-medium'>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Floating Action Button (Task) */}
      <Link
        href='/app/tasks'
        className='absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow active:scale-95'
      >
        <Play className='w-6 h-6 fill-current' />
      </Link>
    </nav>
  )
}
