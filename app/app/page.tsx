'use client'

import { useEffect, useState } from 'react'
import { 
  Bell, 
  User, 
  Play, 
  Info, 
  FileText, 
  HelpCircle, 
  Lock, 
  MessageCircle,
  ChevronRight,
  TrendingUp,
  Settings,
  CircleCheck,
  Zap,
  Loader2
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const [isStartModalOpen, setIsStartModalOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)

  if (profileLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    )
  }

  const handleStartClick = () => {
    setIsSpinning(true)
    setTimeout(() => {
        setIsSpinning(false)
        setIsStartModalOpen(true)
    }, 1500)
  }

  const menuItems = [
    { label: 'ABOUT US', icon: Info, color: 'text-blue-500', iconBg: 'bg-zinc-800' },
    { label: 'USER AGREEMENT', icon: FileText, color: 'text-blue-400', iconBg: 'bg-zinc-800' },
    { label: 'FAQ', icon: HelpCircle, color: 'text-purple-500', iconBg: 'bg-zinc-800' },
    { label: 'PRIVACY', icon: Lock, color: 'text-green-500', iconBg: 'bg-zinc-800' },
    { label: 'WFP', icon: Settings, color: 'text-teal-500', iconBg: 'bg-zinc-800', textIcon: 'WFP' },
    { label: 'SUPPORT', icon: MessageCircle, color: 'text-green-400', iconBg: 'bg-zinc-800' },
  ]

  const levels = [
    { title: 'Level 1 Collector', price: '$100', desc: 'Earn consistent commissions by completing 40 tasks per set across 3 sets.', active: true, color: 'bg-zinc-800 text-white' },
    { title: 'Level 2 Collector', price: '$200', desc: 'Earn consistent commissions by completing 45 tasks per set across 3 sets.', active: false, color: 'bg-zinc-900 text-white' },
  ]

  return (
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-24 relative overflow-x-hidden'>
      {/* Background Image (behind cards) */}
      <div className='fixed inset-0 z-0 opacity-20 pointer-events-none'>
        <Image 
            src="/hero-bg.png" 
            alt="Background" 
            fill 
            className="object-cover blur-3xl scale-110"
        />
      </div>

      <div className='relative z-10'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-5 bg-black/40 backdrop-blur-md sticky top-0 z-30'>
            <div className='flex items-center gap-2'>
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg shadow-lg" />
                <h1 className='text-2xl font-black italic tracking-tighter'>Captiv8 Music</h1>
            </div>
            <div className='flex items-center gap-4 text-white/80'>
            <Link href="/app/profile">
                <div className='w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10'>
                    <User className='w-5 h-5' />
                </div>
            </Link>
            <div className='w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10'>
                <Bell className='w-5 h-5' />
            </div>
            </div>
        </div>

        {/* Promo Banner */}
        <div className='mx-6 mb-6 mt-4 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/5 shadow-lg shadow-black/20'>
            <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center'>
                <Bell className='w-5 h-5 text-purple-400' />
            </div>
            <p className='text-xs font-black uppercase tracking-widest text-[#007CBA] animate-pulse'>1-5000 USDT reward available now</p>
            </div>
            <ChevronRight className='w-4 h-4 text-white/40' />
        </div>

        {/* User Greeting Card (updated) */}
        <div className='px-6 mb-8'>
            <div className='bg-zinc-900/60 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 shadow-2xl relative overflow-hidden'>
                <div className='absolute top-0 right-0 p-8 opacity-5'>
                    <Play className='w-24 h-24' />
                </div>
                <div className='flex items-center gap-6 relative z-10'>
                    <div className='w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-xl p-1'>
                        <div className="w-full h-full rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md">
                            <Play className='w-10 h-10 fill-white text-white translate-x-1' />
                        </div>
                    </div>
                    <div className='flex-1'>
                        <h2 className='text-2xl font-black tracking-tight'>Hello, {profile?.username || profile?.email?.split('@')[0]}</h2>
                        <div className='flex items-center gap-3 mt-2'>
                        <span className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500'>Ref: {profile?.referral_code || profile?.id?.slice(0, 4).toUpperCase()}</span>
                        <div className='flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20'>
                            <CircleCheck className='w-3 h-3' />
                            <span className='text-[8px] font-black uppercase tracking-widest'>Verified Agent</span>
                        </div>
                        </div>
                    </div>
                    <div className='w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center'>
                        <Zap className='w-6 h-6 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' />
                    </div>
                </div>
            </div>
        </div>

        {/* Hero Section (Updated with Spinning State) */}
        <div className='px-6 mb-10'>
            <div className='relative aspect-[16/9] rounded-[48px] overflow-hidden group shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/5'>
                <Image 
                    src="/hero-bg.png" 
                    alt="Hero Background" 
                    fill 
                    className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent' />
                
                <div className='absolute inset-0 flex flex-col items-center justify-center p-6 text-center'>
                    <h3 className='text-3xl lg:text-5xl font-black tracking-tighter mb-6 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] uppercase italic'>
                        CONTENT ACCELERATION
                    </h3>
                    
                    <div 
                        onClick={handleStartClick}
                        className={cn(
                            'w-28 h-28 rounded-full border-[6px] border-cyan-500 flex items-center justify-center bg-black/60 backdrop-blur-xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(6,182,212,0.6)] relative z-20 group/btn',
                            isSpinning ? 'animate-spin border-t-transparent' : ''
                        )}
                    >
                        {isSpinning ? (
                            <Loader2 className='w-10 h-10 text-cyan-400 animate-pulse' />
                        ) : (
                            <span className='text-lg font-black tracking-[0.2em] text-white group-hover:text-cyan-400 transition-colors'>START</span>
                        )}
                    </div>

                    <p className='mt-8 text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase drop-shadow-md bg-cyan-400/10 border border-cyan-400/20 px-6 py-2 rounded-full backdrop-blur-md'>
                        AI INFLUENCE PROTOCOL V4.0
                    </p>
                </div>
            </div>
        </div>

        {/* Menu List (Smaller icons, dark theme) */}
        <div className='px-6 mb-12'>
            <div className='flex items-center justify-between mb-6'>
                <h4 className='text-lg font-black tracking-tight uppercase italic opacity-90'>Strategic Hub</h4>
                <div className='h-px flex-1 mx-6 bg-white/5' />
            </div>
            <div className='grid grid-cols-4 gap-x-4 gap-y-10'>
            {menuItems.map((item, idx) => (
                <div key={idx} className='flex flex-col items-center gap-4 group'>
                <div className={`w-14 h-14 rounded-[22px] ${item.iconBg} border border-white/5 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-active:scale-90 group-hover:border-white/20`}>
                    {item.textIcon ? (
                    <span className={`text-[10px] font-black ${item.color}`}>{item.textIcon}</span>
                    ) : (
                    <item.icon className={`w-6 h-6 ${item.color} group-hover:brightness-125 transition-all`} strokeWidth={2.5} />
                    )}
                </div>
                <span className='text-[7px] font-black tracking-[0.2em] text-white/30 text-center uppercase leading-tight group-hover:text-white/60 transition-colors'>{item.label}</span>
                </div>
            ))}
            </div>
        </div>

        {/* Employee Levels (Grey premium style) */}
        <div className='px-6 mb-16'>
            <div className='flex items-center justify-between mb-8'>
            <h4 className='text-lg font-black tracking-tight uppercase italic opacity-90'>Tiers & Influence</h4>
            <Link href="/app/levels" className='text-[10px] font-black text-cyan-500 hover:text-cyan-400 flex items-center gap-2 transition-all uppercase tracking-widest'>
                Expand <ChevronRight className='w-4 h-4' />
            </Link>
            </div>
            
            <div className='flex gap-6 overflow-x-auto no-scrollbar pb-8'>
            {levels.map((level, idx) => (
                <div key={idx} className={`flex-shrink-0 w-80 rounded-[44px] p-9 ${level.color} border border-white/5 relative group overflow-hidden shadow-2xl shadow-black/40`}>
                <div className='absolute -right-8 -top-8 w-40 h-40 bg-cyan-500/5 rounded-full blur-[60px] group-hover:bg-cyan-500/10 transition-colors' />
                <div className='absolute top-8 right-8'>
                    <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        level.active ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'bg-white/5 text-white/20'
                    )}>
                        <CircleCheck className="w-6 h-6" />
                    </div>
                </div>
                <h5 className='text-xs font-black opacity-40 mb-2 uppercase tracking-widest leading-none'>{level.title}</h5>
                <p className='text-4xl font-black tracking-tighter mb-6'>$ {level.price.replace('$', '')}</p>
                <p className='text-[11px] font-medium leading-relaxed text-zinc-400 mb-12'>
                    {level.desc}
                </p>
                
                <button className={cn(
                    'w-full py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95',
                    level.active ? 'bg-white text-black hover:bg-zinc-200' : 'bg-white/5 text-white/20 border border-white/5'
                )}>
                    {level.active ? 'OPERATIONAL' : 'LOCKED ACCESS'}
                </button>
                </div>
            ))}
            </div>
        </div>

        {/* Start Modal (with updated style) */}
        <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
            <DialogContent className="bg-zinc-950 border-white/5 text-white rounded-[40px] sm:max-w-md p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="bg-gradient-to-b from-cyan-500/20 to-transparent p-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
                    <Zap className="w-12 h-12 text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                </div>
                <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic text-center leading-none">Security Protocol<br/><span className="text-cyan-400 italic">V4.28</span></DialogTitle>
                <DialogDescription className="text-zinc-500 text-center font-black mt-4 text-[10px] tracking-widest uppercase leading-relaxed max-w-[280px]">
                    Initializing neural pathing for real-time strategic audio verification.
                </DialogDescription>
            </div>
            
            <div className="px-10 pb-10 flex flex-col gap-4">
                <Link href="/app/tasks" className="w-full">
                    <Button className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black tracking-[0.2em] rounded-2xl shadow-2xl active:scale-95 transition-all text-xs uppercase">
                        Confirm & Start
                    </Button>
                </Link>
                <Button 
                    variant="ghost" 
                    onClick={() => setIsStartModalOpen(false)}
                    className="w-full h-16 text-zinc-600 font-black tracking-[0.2em] hover:text-white rounded-2xl text-[10px] uppercase"
                >
                    Return to Hub
                </Button>
            </div>
            </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
