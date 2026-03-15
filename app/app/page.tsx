'use client'

import { useEffect, useState } from 'react'
import { 
  Bell, 
  User, 
  Play, 
  PlusCircle, 
  ArrowUpCircle, 
  Info, 
  FileText, 
  HelpCircle, 
  Lock, 
  MessageCircle,
  ChevronRight,
  TrendingUp,
  Settings
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const { profile, isLoading: profileLoading } = useProfile()

  if (profileLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    )
  }

  const menuItems = [
    { label: 'DEPOSIT', icon: PlusCircle, color: 'text-orange-500', iconBg: 'bg-white' },
    { label: 'WITHDRAW', icon: ArrowUpCircle, color: 'text-red-500', iconBg: 'bg-white' },
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
        <h1 className='text-2xl font-black italic tracking-tighter'>Simple Music</h1>
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

      {/* User Info Bar */}
      <div className='px-6 mb-8'>
        <div className='flex items-center gap-3'>
          <div className='w-14 h-14 rounded-full bg-purple-700 flex items-center justify-center shadow-[0_0_20px_rgba(126,34,206,0.3)]'>
            <Play className='w-7 h-7 fill-white text-white' />
          </div>
          <div>
            <h2 className='text-lg font-bold'>Hello, {profile?.email?.split('@')[0]}</h2>
            <div className='flex items-center gap-2 mt-0.5 opacity-60'>
              <span className='text-xs font-medium'>✉ {profile?.email}</span>
              <span className='text-xs font-medium italic'># {profile?.id?.slice(0, 4).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section (Music Matching) */}
      <div className='px-6 mb-10'>
        <div className='relative aspect-[16/9] rounded-[40px] overflow-hidden group shadow-2xl'>
          {/* Background Image Grid (Simulated with Gradient and patterns) */}
          <div className='absolute inset-0 bg-[#121212] overflow-hidden grayscale opacity-50 space-y-2 p-2'>
              <div className='grid grid-cols-4 gap-2'>
                  {[...Array(12)].map((_, i) => (
                      <div key={i} className='aspect-square rounded-lg bg-zinc-800' />
                  ))}
              </div>
          </div>
          <div className='absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent' />
          
          <div className='absolute inset-0 flex flex-col items-center justify-center p-6 text-center'>
            <h3 className='text-2xl lg:text-3xl font-black tracking-tighter mb-4 text-white drop-shadow-lg uppercase'>
              MUSIC MATCHING
            </h3>
            
            <Link href="/app/tasks">
              <div className='w-24 h-24 rounded-full border-4 border-cyan-500 flex items-center justify-center bg-black/40 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)]'>
                <span className='text-lg font-black tracking-widest text-[#007CBA]'>START</span>
              </div>
            </Link>

            <p className='mt-5 text-[10px] font-black tracking-[0.3em] text-purple-400 uppercase drop-shadow-sm'>
              GLOBAL VERIFICATION PROTOCOL
            </p>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className='px-6 mb-12'>
        <h4 className='text-lg font-extrabold mb-5 opacity-90'>Menu List</h4>
        <div className='grid grid-cols-4 gap-x-4 gap-y-8'>
          {menuItems.map((item, idx) => (
            <div key={idx} className='flex flex-col items-center gap-3'>
              <div className={`w-16 h-16 rounded-[28px] ${item.iconBg} flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 active:scale-95`}>
                {item.textIcon ? (
                  <span className={`text-xs font-black ${item.color}`}>{item.textIcon}</span>
                ) : (
                  <item.icon className={`w-7 h-7 ${item.color}`} strokeWidth={2.5} />
                )}
              </div>
              <span className='text-[9px] font-black tracking-wider text-white/50 text-center uppercase'>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Levels */}
      <div className='px-6 mb-10'>
        <div className='flex items-center justify-between mb-5'>
          <h4 className='text-lg font-extrabold opacity-90'>Employee Levels</h4>
          <Link href="#" className='text-xs font-bold text-white/40 flex items-center gap-1'>
            View More <ChevronRight className='w-3 h-3' />
          </Link>
        </div>
        
        <div className='flex gap-4 overflow-x-auto no-scrollbar pb-6'>
          {levels.map((level, idx) => (
            <div key={idx} className={`flex-shrink-0 w-72 rounded-[32px] p-6 ${level.color} text-black relative`}>
              <div className='absolute top-6 right-6 opacity-20'>
                  <div className='w-10 h-10 border-2 border-black rounded-full' />
              </div>
              <h5 className='text-sm font-bold opacity-70 mb-2'>{level.title}</h5>
              <p className='text-4xl font-black tracking-tighter mb-5'>{level.price}</p>
              <p className='text-xs font-semibold leading-relaxed opacity-60 mb-8'>
                {level.desc}
              </p>
              
              <button className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-md ${level.active ? 'bg-white text-black shadow-cyan-500/10' : 'bg-white/40 text-black/40'}`}>
                {level.active ? 'ACTIVE' : 'LOCKED'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
