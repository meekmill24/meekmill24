'use client'

import { ChevronLeft, ShieldCheck, TrendingUp, Zap, Star, Trophy } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'

export default function LevelsPage() {
  const levels = [
    { 
      id: 1, 
      name: 'Level 1 Collector', 
      price: '$100', 
      commission: '1.0x', 
      tasks: '40 per set', 
      description: 'The foundation of your journey. Access basic music matching and verification tasks.', 
      active: true,
      color: 'bg-cyan-100',
      icon: Zap
    },
    { 
      id: 2, 
      name: 'Level 2 Curator', 
      price: '$500', 
      commission: '1.5x', 
      tasks: '45 per set', 
      description: 'Enhanced earning potential. Unlock higher priority tasks and faster verification.', 
      active: false,
      color: 'bg-purple-100',
      icon: Star
    },
    { 
      id: 3, 
      name: 'Level 3 Master', 
      price: '$2000', 
      commission: '2.5x', 
      tasks: '50 per set', 
      description: 'Top-tier influence. Get exclusive access to premium content verification and direct support.', 
      active: false,
      color: 'bg-amber-100',
      icon: Trophy
    }
  ]

  return (
    <main className='min-h-screen bg-black text-white pb-32'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-8 bg-black sticky top-0 z-20 backdrop-blur-md bg-black/80'>
        <div className='flex items-center gap-4'>
          <Link href="/app">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-2xl font-black tracking-tighter uppercase italic'>Influence Tiers</h1>
        </div>
      </div>

      <div className='px-6 space-y-6 pt-4'>
        {/* Intro Card */}
        <div className='bg-gradient-to-br from-cyan-600/20 to-purple-600/20 rounded-[32px] p-6 border border-white/10'>
            <h2 className='text-lg font-black mb-2 flex items-center gap-2'>
                <ShieldCheck className='w-5 h-5 text-cyan-400' />
                Earning Power
            </h2>
            <p className='text-xs text-zinc-400 font-medium leading-relaxed'>
                Higher levels unlock greater earning potential and more advanced tasks. Upgrade your tier to maximize your social influence rewards.
            </p>
        </div>

        {/* Levels List */}
        <div className='space-y-4'>
            {levels.map((level) => (
                <div key={level.id} className={`rounded-[40px] p-8 ${level.color} text-black group relative overflow-hidden transition-all hover:scale-[1.02]`}>
                    <div className='absolute -right-4 -top-4 w-32 h-32 bg-black/5 rounded-full blur-2xl' />
                    
                    <div className='flex items-center justify-between mb-8'>
                        <div className='w-14 h-14 rounded-3xl bg-black/5 flex items-center justify-center'>
                           <level.icon className="w-8 h-8" />
                        </div>
                        <div className='text-right'>
                            <p className='text-3xl font-black tracking-tighter'>{level.price}</p>
                            <p className='text-[10px] font-black uppercase tracking-widest opacity-40'>Required Assets</p>
                        </div>
                    </div>

                    <h3 className='text-xl font-black tracking-tight mb-2'>{level.name}</h3>
                    <p className='text-xs font-bold leading-relaxed opacity-60 mb-8'>
                        {level.description}
                    </p>

                    <div className='grid grid-cols-2 gap-4 mb-8'>
                        <div className='bg-black/5 rounded-2xl p-4'>
                            <p className='text-[10px] font-black uppercase tracking-widest opacity-40 mb-1'>Commission</p>
                            <p className='text-lg font-black'>{level.commission}</p>
                        </div>
                        <div className='bg-black/5 rounded-2xl p-4'>
                            <p className='text-[10px] font-black uppercase tracking-widest opacity-40 mb-1'>Task Volume</p>
                            <p className='text-lg font-black'>{level.tasks}</p>
                        </div>
                    </div>

                    <Button 
                        disabled={level.active}
                        className={`w-full h-14 rounded-2xl font-black tracking-widest uppercase transition-all shadow-md ${level.active ? 'bg-black/10 text-black/40 border border-black/10' : 'bg-black text-white hover:bg-black/90'}`}
                    >
                        {level.active ? 'CURRENT TIER' : 'UPGRADE NOW'}
                    </Button>
                </div>
            ))}
        </div>
      </div>

      <BottomNav active='app' />
    </main>
  )
}
