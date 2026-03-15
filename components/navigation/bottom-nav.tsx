import Link from 'next/link'
import { Home, Clock, Wallet, User, Play, ListTodo, History, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  active?: string
}

export function BottomNav({ active = 'home' }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'HOME', href: '/app', icon: Home },
    { id: 'record', label: 'RECORD', href: '/app/record', icon: History },
    { id: 'task', label: 'TASK', href: '/app/tasks', icon: Play, isCenter: true },
    { id: 'wallet', label: 'WALLET', href: '/app/wallet', icon: CreditCard },
    { id: 'profile', label: 'MINE', href: '/app/profile', icon: User },
  ]

  return (
    <nav className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md lg:max-w-4xl bg-black/90 backdrop-blur-xl border-t border-white/5 px-2 py-4 z-50'>
      <div className='flex items-center justify-around'>
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.isCenter) {
            return (
              <div key={item.id} className='relative w-16 h-12'>
                   <Link
                      href={item.href}
                      className='absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.4)] border-4 border-black hover:scale-110 active:scale-95 transition-all'
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className='w-6 h-6 text-white fill-white translate-x-0.5' />
                      </div>
                    </Link>
                    <div className="mt-6 text-center">
                        <span className={cn(
                            'text-[9px] font-black tracking-widest',
                            active === item.id ? 'text-cyan-400' : 'text-white/30'
                        )}>{item.label}</span>
                    </div>
              </div>
            )
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-4 py-2 transition-all duration-300',
                active === item.id
                  ? 'text-cyan-400 scale-110'
                  : 'text-white/30 hover:text-white'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-1.5', active === item.id ? 'stroke-[2.5px]' : 'stroke-2')} />
              <span className='text-[9px] font-black tracking-widest'>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
