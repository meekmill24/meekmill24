'use client'

import { useEffect, useState } from 'react'
import { 
  Bell, 
  User, 
  ChevronLeft, 
  CreditCard, 
  CircleDollarSign, 
  ShieldCheck,
  PlayCircle,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { useProfile } from '@/hooks/use-profile'
import { Spinner } from '@/components/ui/spinner'
import Image from 'next/image'

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
    { label: 'Wallet balance', amount: profile?.wallet_balance || 0, icon: CreditCard, color: 'text-white' },
    { label: 'Total Profit', amount: profile?.total_earned || 0, icon: CircleDollarSign, color: 'text-white' },
    { label: 'Frozen Assets', amount: 0, icon: ShieldCheck, color: 'text-white' },
  ]

  // Task Grid: 8 items + Center Start button
  const gridItems = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    image: `https://picsum.photos/id/${20 + i}/300/300`
  }))

  return (
    <main className='min-h-screen bg-black text-white pb-32'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-8 bg-black/80 backdrop-blur-md sticky top-0 z-30'>
        <div className='flex items-center gap-3'>
          <Link href="/app">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Captiv8 Tasks</h1>
        </div>
        <div className='w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center'>
            <Zap className='w-5 h-5 text-cyan-400' />
        </div>
      </div>

      {/* Stats Cards (White Rounded style from reference) */}
      <div className='px-6 space-y-4 mb-10 mt-4'>
        {statCards.map((card, idx) => (
          <div key={idx} className='bg-white rounded-[32px] p-7 flex items-center justify-between text-black shadow-2xl'>
            <div className='flex items-center gap-4'>
              <div className='w-14 h-14 rounded-3xl bg-zinc-100 flex items-center justify-center'>
                 <card.icon className="w-7 h-7 text-black" />
              </div>
              <div>
                <p className='text-[10px] font-black tracking-widest text-zinc-400 uppercase leading-tight'>{card.label}</p>
                <p className='text-[8px] font-bold text-zinc-300 uppercase tracking-wider mt-1'>Verified by AI</p>
              </div>
            </div>
            <div className='text-right'>
               <p className='text-2xl font-black tracking-tighter'>${card.amount.toFixed(2)}</p>
               <p className='text-[10px] font-black text-zinc-300 tracking-[0.2em] uppercase'>USD</p>
            </div>
          </div>
        ))}
      </div>

      {/* Task Section Header */}
      <div className='px-6 mb-8 flex items-end justify-between'>
        <div>
          <h2 className='text-2xl font-black tracking-tighter mb-1 uppercase italic'>Music Pulse</h2>
          <p className='text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase bg-cyan-400/10 px-3 py-1 rounded-full w-fit'>PROTOCOL V4.0</p>
        </div>
        <div className='text-right'>
             <p className='text-3xl font-black tracking-tighter text-white'>{progress} / {totalTasks}</p>
             <p className='text-[8px] font-black text-zinc-500 uppercase tracking-widest'>Progress</p>
        </div>
      </div>

      {/* Interactive Task Grid (3x3 with center button) */}
      <div className='px-6 mb-12'>
        <div className='relative bg-zinc-900/30 rounded-[48px] p-10 border border-white/5 backdrop-blur-sm'>
          <div className='grid grid-cols-3 gap-6'>
             {/* Cell 1, 2, 3 */}
             <div className='aspect-square rounded-3xl bg-zinc-800/80 overflow-hidden border border-white/10 shadow-lg rotate-[-2deg]'>
                <img src={gridItems[0].image} alt="task" className='w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer' />
             </div>
             <div className='aspect-square rounded-3xl bg-zinc-800/80 overflow-hidden border border-white/10 shadow-lg'>
                <img src={gridItems[1].image} alt="task" className='w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer' />
             </div>
             <div className='aspect-square rounded-3xl bg-zinc-800/80 overflow-hidden border border-white/10 shadow-lg rotate-[3deg]'>
                <img src={gridItems[2].image} alt="task" className='w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer' />
             </div>
             
             {/* Cell 4, Center (Button), Cell 5 */}
             <div className='aspect-square rounded-3xl bg-zinc-800/80 overflow-hidden border border-white/10 shadow-lg'>
                <img src={gridItems[3].image} alt="task" className='w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer' />
             </div>
             
             {/* Center Start Button Cell */}
             <div className='aspect-square flex items-center justify-center'>
                <div className='w-24 h-24 rounded-full border-[6px] border-cyan-500 bg-black flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.6)] cursor-pointer hover:scale-110 active:scale-95 transition-all group'>
                    <PlayCircle className='w-10 h-10 text-white group-hover:text-cyan-400 transition-colors' />
                    <span className='text-[10px] font-black tracking-[0.2em] mt-1 text-white uppercase'>Match</span>
                </div>
             </div>

             <div className='aspect-square rounded-3xl bg-zinc-800/80 overflow-hidden border border-white/10 shadow-lg rotate-[-1deg]'>
                <img src={gridItems[4].image} alt="task" className='w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer' />
             </div>

             {/* Cell 6, 7, 8 */}
             <div className='aspect-square rounded-3xl bg-zinc-800/80 overflow-hidden border border-white/10 shadow-lg rotate-[2deg]'>
                <img src={gridItems[5].image} alt="task" className='w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer' />
             </div>
             <div className='aspect-square rounded-3xl bg-zinc-800/80 overflow-hidden border border-white/10 shadow-lg'>
                <img src={gridItems[6].image} alt="task" className='w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer' />
             </div>
             <div className='aspect-square rounded-3xl bg-zinc-800/80 overflow-hidden border border-white/10 shadow-lg rotate-[-4deg]'>
                <img src={gridItems[7].image} alt="task" className='w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer' />
             </div>
          </div>
        </div>
      </div>

      <div className='px-6 mb-20'>
        <div className='bg-cyan-500/5 rounded-[32px] p-6 border border-cyan-500/10'>
            <h4 className='text-sm font-black uppercase tracking-widest text-cyan-400 mb-2'>AI Verification Model</h4>
            <p className='text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-wider'>
                Our neural engine verifies your music matching accuracy in real-time. High accuracy scores lead to tier progression and bonus reward unlocks.
            </p>
        </div>
      </div>

      <BottomNav active='task' />
    </main>
  )
}
