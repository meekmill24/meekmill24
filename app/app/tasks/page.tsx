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
  Zap,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { useProfile } from '@/hooks/use-profile'
import { Spinner } from '@/components/ui/spinner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'

export default function TasksPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const [progress, setProgress] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const totalTasks = 40

  if (profileLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <Spinner className='h-8 w-8 text-white' />
      </div>
    )
  }

  const handleMatchClick = () => {
    setIsSpinning(true)
    setTimeout(() => {
        setIsSpinning(false)
        setIsModalOpen(true)
    }, 2000)
  }

  const statCards = [
    { label: 'Wallet balance', amount: profile?.wallet_balance || 0, icon: CreditCard, color: 'text-white' },
    { label: 'Total Profit', amount: profile?.total_earned || 0, icon: CircleDollarSign, color: 'text-white' },
    { label: 'Frozen Assets', amount: 0, icon: ShieldCheck, color: 'text-white' },
  ]

  const gridItems = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    image: `https://picsum.photos/id/${30 + i}/200/200`
  }))

  return (
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-32 relative overflow-x-hidden'>
      {/* Background Image (behind cards) */}
      <div className='fixed inset-0 z-0 opacity-10 pointer-events-none'>
        <Image 
            src="/hero-bg.png" 
            alt="Background" 
            fill 
            className="object-cover blur-2xl"
        />
      </div>

      <div className='relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-8 bg-black/40 backdrop-blur-md sticky top-0 z-30 border-b border-white/5'>
          <div className='flex items-center gap-3'>
            <Link href="/app">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <ChevronLeft className='w-6 h-6' />
              </div>
            </Link>
            <h1 className='text-xl font-black italic tracking-tighter uppercase'>Captiv8 Tasks</h1>
          </div>
          <div className='w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center'>
              <Zap className='w-5 h-5 text-cyan-400' />
          </div>
        </div>

        {/* Stats Cards (Premium white) */}
        <div className='px-6 space-y-4 mb-10 mt-6'>
          {statCards.map((card, idx) => (
            <div key={idx} className='bg-white rounded-[40px] p-8 flex items-center justify-between text-black shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500'>
              <div className='absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform'>
                <card.icon className="w-20 h-20" />
              </div>
              <div className='flex items-center gap-6 relative z-10'>
                <div className='w-16 h-16 rounded-[24px] bg-zinc-100 flex items-center justify-center shadow-inner'>
                   <card.icon className="w-8 h-8 text-black" />
                </div>
                <div>
                  <p className='text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase leading-tight'>{card.label}</p>
                  <p className='text-[8px] font-bold text-zinc-300 uppercase tracking-[0.3em] mt-1.5'>Verified Protocol</p>
                </div>
              </div>
              <div className='text-right relative z-10'>
                 <p className='text-3xl font-black tracking-tighter'>$ {card.amount.toFixed(2)}</p>
                 <p className='text-[10px] font-black text-zinc-300 tracking-[0.3em] uppercase mt-1'>USDT</p>
              </div>
            </div>
          ))}
        </div>

        {/* Task Section Header */}
        <div className='px-6 mb-8 flex items-end justify-between'>
          <div>
            <h2 className='text-2xl font-black tracking-tighter mb-2 uppercase italic'>Music Pulse</h2>
            <div className='flex items-center gap-3'>
                <p className='text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase bg-cyan-400/10 border border-cyan-400/20 px-4 py-1.5 rounded-full w-fit'>STATION ALPHA</p>
                <div className='flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5'>
                    <div className='w-1 h-1 rounded-full bg-green-500 animate-pulse' />
                    <span className='text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none'>Link Stable</span>
                </div>
            </div>
          </div>
          <div className='text-right'>
               <p className='text-4xl font-black tracking-tighter text-white tabular-nums'>{progress} <span className='text-zinc-700 font-bold'>/ {totalTasks}</span></p>
               <p className='text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1'>Cycle Complete</p>
          </div>
        </div>

        {/* Interactive Task Grid (Reduced image size, Spinning animation) */}
        <div className='px-6 mb-12'>
          <div className='bg-zinc-900/40 rounded-[56px] p-10 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden'>
            <div className='grid grid-cols-3 gap-8 relative z-10'>
               {/* 3x3 Grid Items */}
               {/* row 1 */}
               <div className={cn('aspect-square rounded-[32px] bg-zinc-800/40 p-1.5 border border-white/5 shadow-2xl transition-all duration-700', isSpinning ? 'animate-spin scale-75 opacity-40' : 'rotate-[-3deg] hover:rotate-0 hover:scale-105')}>
                  <div className='w-full h-full rounded-[28px] overflow-hidden'>
                    <img src={gridItems[0].image} alt="task" className='w-full h-full object-cover grayscale opacity-50' />
                  </div>
               </div>
               <div className={cn('aspect-square rounded-[32px] bg-zinc-800/40 p-1.5 border border-white/5 shadow-2xl transition-all duration-700Delay-75', isSpinning ? 'animate-spin scale-75 opacity-40' : 'hover:scale-105')}>
                  <div className='w-full h-full rounded-[28px] overflow-hidden'>
                    <img src={gridItems[1].image} alt="task" className='w-full h-full object-cover grayscale opacity-50' />
                  </div>
               </div>
               <div className={cn('aspect-square rounded-[32px] bg-zinc-800/40 p-1.5 border border-white/5 shadow-2xl transition-all duration-700Delay-150', isSpinning ? 'animate-spin scale-75 opacity-40' : 'rotate-[2deg] hover:rotate-0 hover:scale-105')}>
                  <div className='w-full h-full rounded-[28px] overflow-hidden'>
                    <img src={gridItems[2].image} alt="task" className='w-full h-full object-cover grayscale opacity-50' />
                  </div>
               </div>
               
               {/* row 2 */}
               <div className={cn('aspect-square rounded-[32px] bg-zinc-800/40 p-1.5 border border-white/5 shadow-2xl transition-all duration-700Delay-200', isSpinning ? 'animate-spin scale-75 opacity-40' : 'hover:scale-105')}>
                  <div className='w-full h-full rounded-[28px] overflow-hidden'>
                    <img src={gridItems[3].image} alt="task" className='w-full h-full object-cover grayscale opacity-50' />
                  </div>
               </div>
               
               <div className='aspect-square flex items-center justify-center'>
                  <div 
                    onClick={handleMatchClick}
                    className={cn(
                        'w-24 h-24 rounded-full border-[6px] border-cyan-500 bg-black flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.6)] cursor-pointer hover:scale-110 active:scale-95 transition-all group relative z-20',
                        isSpinning ? 'animate-pulse' : ''
                    )}
                  >
                        {isSpinning ? (
                            <Loader2 className='w-10 h-10 text-cyan-400 animate-spin' />
                        ) : (
                            <>
                                <PlayCircle className='w-10 h-10 text-white group-hover:text-cyan-400 transition-colors' />
                                <span className='text-[10px] font-black tracking-[0.2em] mt-1 text-white uppercase italic'>Match</span>
                            </>
                        )}
                  </div>
               </div>

               <div className={cn('aspect-square rounded-[32px] bg-zinc-800/40 p-1.5 border border-white/5 shadow-2xl transition-all duration-700Delay-300', isSpinning ? 'animate-spin scale-75 opacity-40' : 'rotate-[-1deg] hover:rotate-0 hover:scale-105')}>
                  <div className='w-full h-full rounded-[28px] overflow-hidden'>
                    <img src={gridItems[4].image} alt="task" className='w-full h-full object-cover grayscale opacity-50' />
                  </div>
               </div>

               {/* row 3 */}
               <div className={cn('aspect-square rounded-[32px] bg-zinc-800/40 p-1.5 border border-white/5 shadow-2xl transition-all duration-700Delay-400', isSpinning ? 'animate-spin scale-75 opacity-40' : 'rotate-[3deg] hover:rotate-0 hover:scale-105')}>
                  <div className='w-full h-full rounded-[28px] overflow-hidden'>
                    <img src={gridItems[5].image} alt="task" className='w-full h-full object-cover grayscale opacity-50' />
                  </div>
               </div>
               <div className={cn('aspect-square rounded-[32px] bg-zinc-800/40 p-1.5 border border-white/5 shadow-2xl transition-all duration-700Delay-500', isSpinning ? 'animate-spin scale-75 opacity-40' : 'hover:scale-105')}>
                  <div className='w-full h-full rounded-[28px] overflow-hidden'>
                    <img src={gridItems[6].image} alt="task" className='w-full h-full object-cover grayscale opacity-50' />
                  </div>
               </div>
               <div className={cn('aspect-square rounded-[32px] bg-zinc-800/40 p-1.5 border border-white/5 shadow-2xl transition-all duration-700Delay-600', isSpinning ? 'animate-spin scale-75 opacity-40' : 'rotate-[-4deg] hover:rotate-0 hover:scale-105')}>
                  <div className='w-full h-full rounded-[28px] overflow-hidden'>
                    <img src={gridItems[7].image} alt="task" className='w-full h-full object-cover grayscale opacity-50' />
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className='px-6 mb-24'>
          <div className='bg-zinc-900/60 rounded-[40px] p-8 border border-white/10 shadow-xl'>
              <h4 className='text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-3 italic'>Neural Matching Model</h4>
              <p className='text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-widest'>
                  Our system is currently optimizing paths for Station Alpha. Maintain session stability for high-fidelity verification streams.
              </p>
          </div>
        </div>

        {/* Start Modal (Same as Home) */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-zinc-950 border-white/5 text-white rounded-[40px] sm:max-w-md p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="bg-gradient-to-b from-cyan-500/20 to-transparent p-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
                    <Zap className="w-12 h-12 text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                </div>
                <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic text-center leading-none">Initialization<br/><span className="text-cyan-400 italic">Complete</span></DialogTitle>
                <DialogDescription className="text-zinc-500 text-center font-black mt-4 text-[10px] tracking-widest uppercase leading-relaxed">
                    Neural path established. You are now authorized to verify the current audio stream block.
                </DialogDescription>
            </div>
            
            <div className="px-10 pb-10 flex flex-col gap-4">
                <Button 
                    onClick={() => {
                        setIsModalOpen(false)
                        setProgress(p => Math.min(totalTasks, p + 1))
                    }}
                    className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black tracking-[0.2em] rounded-2xl shadow-2xl active:scale-95 transition-all text-xs uppercase"
                >
                    Submit Verification
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full h-16 text-zinc-600 font-black tracking-[0.2em] hover:text-white rounded-2xl text-[10px] uppercase"
                >
                    Abort Stream
                </Button>
            </div>
            </DialogContent>
        </Dialog>
      </div>

      <BottomNav active='task' />
    </main>
  )
}
