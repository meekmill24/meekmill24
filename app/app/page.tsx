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
  Zap
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

export default function HomePage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const [isStartModalOpen, setIsStartModalOpen] = useState(false)

  if (profileLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    )
  }

  // Removed DEPOSIT and WITHDRAW as requested
  const menuItems = [
    { label: 'ABOUT US', icon: Info, color: 'text-blue-500', iconBg: 'bg-white' },
    { label: 'USER AGREEMENT', icon: FileText, color: 'text-blue-400', iconBg: 'bg-white' },
    { label: 'FAQ', icon: HelpCircle, color: 'text-purple-500', iconBg: 'bg-white' },
    { label: 'PRIVACY', icon: Lock, color: 'text-green-500', iconBg: 'bg-white' },
    { label: 'WFP', icon: Settings, color: 'text-teal-500', iconBg: 'bg-white', textIcon: 'WFP' },
    { label: 'SUPPORT', icon: MessageCircle, color: 'text-green-400', iconBg: 'bg-white' },
  ]

  const levels = [
    { title: 'Level 1 Collector', price: '$100', desc: 'Earn consistent commissions by completing 40 tasks per set across 3 sets.', active: true, color: 'bg-cyan-100' },
    { title: 'Level 2 Collector', price: '$200', desc: 'Earn consistent commissions by completing 45 tasks per set across 3 sets.', active: false, color: 'bg-purple-100' },
  ]

  return (
    <main className='min-h-screen bg-black text-white pb-24'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-5 bg-black'>
        <div className='flex items-center gap-2'>
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg shadow-lg" />
            <h1 className='text-2xl font-black italic tracking-tighter'>Captiv8 Music</h1>
        </div>
        <div className='flex items-center gap-4 text-white/80'>
          <User className='w-6 h-6' />
          <Bell className='w-6 h-6' />
        </div>
      </div>

      {/* Promo Banner */}
      <div className='mx-6 mb-6 bg-zinc-900/80 rounded-2xl p-4 flex items-center justify-between border border-white/5'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center'>
            <Bell className='w-5 h-5 text-purple-400' />
          </div>
          <p className='text-xs font-medium text-white/90'>1-5000 USDT reward available now</p>
        </div>
        <ChevronRight className='w-4 h-4 text-white/40' />
      </div>

      {/* User Greeting Card (requested) */}
      <div className='px-6 mb-8'>
        <div className='bg-zinc-900/50 backdrop-blur-md rounded-[32px] p-6 border border-white/10 shadow-xl'>
            <div className='flex items-center gap-4'>
                <div className='w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg'>
                  <Play className='w-8 h-8 fill-white text-white translate-x-0.5' />
                </div>
                <div className='flex-1'>
                    <h2 className='text-xl font-black tracking-tight'>Hello, {profile?.email?.split('@')[0]}</h2>
                    <div className='flex items-center gap-2 mt-1 opacity-60'>
                      <span className='text-xs font-bold uppercase tracking-wider'>Ref: {profile?.referral_code || profile?.id?.slice(0, 4).toUpperCase()}</span>
                      <span className='text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full font-bold uppercase tracking-widest text-[8px]'>Verified</span>
                    </div>
                </div>
                <div className='w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center'>
                    <Zap className='w-5 h-5 text-yellow-500' />
                </div>
            </div>
        </div>
      </div>

      {/* Hero Section (Captiv8 Style) */}
      <div className='px-6 mb-10'>
        <div className='relative aspect-[16/9] rounded-[40px] overflow-hidden group shadow-2xl border border-white/5'>
          <Image 
            src="/hero-bg.png" 
            alt="Hero Background" 
            fill 
            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent' />
          
          <div className='absolute inset-0 flex flex-col items-center justify-center p-6 text-center'>
            <h3 className='text-2xl lg:text-4xl font-black tracking-tighter mb-4 text-white drop-shadow-2xl uppercase'>
              CONTENT ACCELERATION
            </h3>
            
            <div 
              onClick={() => setIsStartModalOpen(true)}
              className='w-24 h-24 rounded-full border-[6px] border-cyan-500 flex items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(6,182,212,0.6)] group/btn'
            >
              <span className='text-lg font-black tracking-widest text-white group-hover:text-cyan-400'>START</span>
            </div>

            <p className='mt-6 text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase drop-shadow-md bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm'>
              AI INFLUENCE PROTOCOL V2.0
            </p>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className='px-6 mb-12'>
        <h4 className='text-lg font-extrabold mb-5 opacity-90 tracking-tight'>Strategic Tools</h4>
        <div className='grid grid-cols-4 gap-x-4 gap-y-8'>
          {menuItems.map((item, idx) => (
            <div key={idx} className='flex flex-col items-center gap-3'>
              <div className={`w-16 h-16 rounded-[24px] ${item.iconBg} flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-90`}>
                {item.textIcon ? (
                  <span className={`text-xs font-black ${item.color}`}>{item.textIcon}</span>
                ) : (
                  <item.icon className={`w-7 h-7 ${item.color}`} strokeWidth={2.5} />
                )}
              </div>
              <span className='text-[8px] font-black tracking-widest text-white/40 text-center uppercase leading-tight'>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Levels */}
      <div className='px-6 mb-10'>
        <div className='flex items-center justify-between mb-5'>
          <h4 className='text-lg font-extrabold opacity-90 tracking-tight'>Tiers & Influence</h4>
          <Link href="/app/levels" className='text-xs font-bold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition-colors'>
            View More <ChevronRight className='w-3 h-3' />
          </Link>
        </div>
        
        <div className='flex gap-4 overflow-x-auto no-scrollbar pb-6'>
          {levels.map((level, idx) => (
            <div key={idx} className={`flex-shrink-0 w-72 rounded-[36px] p-7 ${level.color} text-black relative group overflow-hidden`}>
              <div className='absolute -right-4 -top-4 w-32 h-32 bg-black/5 rounded-full blur-2xl group-hover:bg-black/10 transition-colors' />
              <div className='absolute top-6 right-6'>
                  <CircleCheck className={`w-8 h-8 ${level.active ? 'text-black' : 'text-black/20'}`} />
              </div>
              <h5 className='text-sm font-bold opacity-60 mb-1'>{level.title}</h5>
              <p className='text-4xl font-black tracking-tighter mb-4'>{level.price}</p>
              <p className='text-xs font-bold leading-relaxed opacity-50 mb-10'>
                {level.desc}
              </p>
              
              <button className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-md ${level.active ? 'bg-black text-white' : 'bg-black/10 text-black/40'}`}>
                {level.active ? 'ACTIVE TIER' : 'LOCKED'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Start Modal */}
      <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[32px] sm:max-w-md">
          <DialogHeader className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                <Zap className="w-10 h-10 text-cyan-500 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic">Initialize Protocol</DialogTitle>
            <DialogDescription className="text-zinc-500 text-center font-medium mt-2">
              You are about to start the Content Acceleration task. Ensure your network is stable for real-time verification.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-6 pb-2">
            <Link href="/app/tasks" className="w-full">
                <Button className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest rounded-2xl shadow-lg shadow-cyan-900/20 active:scale-95 transition-all">
                    START MATCHING
                </Button>
            </Link>
            <Button 
                variant="ghost" 
                onClick={() => setIsStartModalOpen(false)}
                className="w-full h-14 text-zinc-500 font-bold tracking-widest hover:bg-white/5 rounded-2xl"
            >
                CANCEL
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
