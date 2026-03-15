'use client'

import { useEffect, useState } from 'react'
import { 
  Bell, 
  User, 
  ChevronLeft, 
  CreditCard, 
  CircleDollarSign, 
  ShieldCheck,
  PlayCircle
} from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { useProfile } from '@/hooks/use-profile'
import { Spinner } from '@/components/ui/spinner'

export default function TasksPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const [progress, setProgress] = useState(0)
  const totalTasks = 40

  if (profileLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <Spinner className='h-8 w-8 text-white' />
      </div>
    )
  }

  const statCards = [
    { label: 'Wallet balance', amount: profile?.wallet_balance || 0, icon: CreditCard, color: 'text-purple-600' },
    { label: 'Profit', amount: profile?.total_earned || 0, icon: CircleDollarSign, color: 'text-purple-500' },
    { label: 'Frozen Amount', amount: 0, icon: ShieldCheck, color: 'text-purple-400' },
  ]

  // Task Grid: 8 items + Center Start button
  const gridItems = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    image: `https://picsum.photos/id/${10 + i}/200/200`
  }))

  return (
    <main className='min-h-screen bg-black text-white pb-32'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-5 bg-black'>
        <div className='flex items-center gap-3'>
          <Link href="/app">
            <ChevronLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-xl font-black italic tracking-tighter'>Simple Music</h1>
        </div>
        <div className='flex items-center gap-4 text-white/80'>
          <User className='w-6 h-6' />
          <Bell className='w-6 h-6' />
        </div>
      </div>

      {/* Stats Cards */}
      <div className='px-6 space-y-4 mb-8'>
        {statCards.map((card, idx) => (
          <div key={idx} className='bg-white rounded-[32px] p-6 flex items-center justify-between text-black shadow-lg'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center'>
                 <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className='text-[10px] font-black tracking-widest text-zinc-400 uppercase'>{card.label}</p>
                <p className='text-xs font-bold text-zinc-400'>Real-time balance</p>
              </div>
            </div>
            <div className='text-right'>
               <p className='text-xl font-black tracking-tighter'>${card.amount.toFixed(2)}</p>
               <p className='text-[10px] font-bold text-zinc-300 tracking-wider uppercase'>USD</p>
            </div>
          </div>
        ))}
      </div>

      {/* Task Section Header */}
      <div className='px-6 mb-8 flex items-end justify-between'>
        <div>
          <h2 className='text-xl font-black tracking-tighter mb-1'>Simple Music Task</h2>
          <p className='text-[10px] font-black tracking-[0.2em] text-purple-400 uppercase'>SET 1 OF 3</p>
        </div>
        <div className='text-right'>
             <p className='text-2xl font-black tracking-tighter text-purple-500'>{progress} / {totalTasks}</p>
        </div>
      </div>

      {/* Interactive Task Grid */}
      <div className='px-6'>
        <div className='relative bg-zinc-900/50 rounded-[40px] p-8 border border-white/5'>
          <div className='grid grid-cols-4 gap-4'>
             {/* Row 1 */}
             {gridItems.slice(0, 4).map((item) => (
               <div key={item.id} className='aspect-square rounded-2xl bg-zinc-800 overflow-hidden border-2 border-white/10'>
                 <img src={item.image} alt="task" className='w-full h-full object-cover opacity-60 grayscale' />
               </div>
             ))}
             
             {/* Row 2 - First 2 items */}
             {gridItems.slice(4, 6).map((item) => (
               <div key={item.id} className='aspect-square rounded-2xl bg-zinc-800 overflow-hidden border-2 border-white/10'>
                 <img src={item.image} alt="task" className='w-full h-full object-cover opacity-60 grayscale' />
               </div>
             ))}
             
             {/* Row 2 - Last 2 items */}
             {gridItems.slice(6, 8).map((item) => (
               <div key={item.id} className='aspect-square rounded-2xl bg-zinc-800 overflow-hidden border-2 border-white/10'>
                 <img src={item.image} alt="task" className='w-full h-full object-cover opacity-60 grayscale' />
               </div>
             ))}
          </div>

          {/* Large Start Button Overlay (Center) */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-10%]'>
             <div className='w-28 h-28 rounded-full border-4 border-purple-600 bg-black flex flex-col items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all'>
                <PlayCircle className='w-10 h-10 text-purple-500 fill-purple-500/10' />
                <span className='text-[10px] font-black tracking-[0.2em] mt-1 text-white'>START</span>
             </div>
          </div>
        </div>
      </div>

      <BottomNav active='task' />
    </main>
  )
}
