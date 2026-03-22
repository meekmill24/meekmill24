'use client'

import { useEffect, useState } from 'react'
import { 
  Bell, 
  User, 
  Play, 
  Zap, 
  CircleCheck, 
  TrendingUp, 
  Lock, 
  ChevronRight,
  Info,
  FileText,
  Trophy,
  Wallet as WalletIcon,
  RefreshCw,
  ShieldCheck,
  Copy,
  Users,
  Search,
  ChevronDown,
  ArrowUpFromLine,
  MessageCircle,
  HelpCircle
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import ActivityFeed from '@/components/ActivityFeed'
import DraggableChat from '@/components/DraggableChat'
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
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { getLevels } from '@/lib/actions/admin'

export default function HomePage() {
  const { profile, loading: profileLoading } = useAuth()
  const { format } = useCurrency()
  const [isStartModalOpen, setIsStartModalOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [levels, setLevels] = useState<any[]>([])

  useEffect(() => {
    async function loadLevels() {
        try {
            const data = await getLevels()
            setLevels(data || [])
        } catch (e) {
            console.error(e)
        }
    }
    loadLevels()
  }, [])

  if (profileLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    )
  }

  const menuItems = [
    { label: 'DEPOSIT', icon: Zap, color: 'text-cyan-400', iconBg: 'bg-cyan-500/10', href: '/app/deposit' },
    { label: 'WITHDRAW', icon: ArrowUpFromLine, color: 'text-rose-400', iconBg: 'bg-rose-500/10', href: '/app/withdraw' },
    { label: 'RECORDS', icon: FileText, color: 'text-amber-400', iconBg: 'bg-amber-500/10', href: '/app/record' },
    { label: 'SALARY', icon: Trophy, color: 'text-indigo-400', iconBg: 'bg-indigo-500/10', href: '/app/salary' },
    { label: 'INVITE', icon: TrendingUp, color: 'text-teal-500', iconBg: 'bg-zinc-800', href: '/app/invite' },
    { label: 'SUPPORT', icon: MessageCircle, color: 'text-green-400', iconBg: 'bg-zinc-800', href: '/app/support' },
    { label: 'FAQ', icon: HelpCircle, color: 'text-purple-500', iconBg: 'bg-zinc-800', href: '/app/faq' },
    { label: 'WALLET', icon: WalletIcon, color: 'text-blue-500', iconBg: 'bg-zinc-800', href: '/app/wallet' },
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
        <div className='flex items-center justify-between px-6 py-5 bg-black/40 backdrop-blur-md sticky top-0 z-30 border-b border-white/5'>
            <div className='flex items-center gap-2'>
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg shadow-lg" />
                <h1 className='text-2xl font-black italic tracking-tighter'>Captiv8</h1>
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

        {/* User Greeting & Stats Card (Refined per User request) */}
        <div className='px-6 pt-4 mb-16'>
            <div className='relative overflow-hidden rounded-[48px] border border-white/10 shadow-3xl bg-zinc-900/60 backdrop-blur-3xl group'>
                {/* Background Image Banner */}
                <div className='absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-1000'>
                    <Image 
                        src="/hero-bg.png" 
                        alt="Background" 
                        fill 
                        className="object-cover"
                    />
                </div>
                <div className='absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0' />
                
                <div className='relative z-10 p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 border-b border-white/5 py-10 md:pb-12'>
                        <div className='w-24 h-24 rounded-[32px] bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_20px_60px_rgba(6,182,212,0.3)] p-[1.5px] group-hover:rotate-6 transition-transform duration-700'>
                            <div className="w-full h-full rounded-[30px] bg-black/40 flex items-center justify-center backdrop-blur-md">
                                <span className="text-4xl font-black italic text-white drop-shadow-2xl">
                                    {profile?.username?.[0]?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className='flex-1 w-full'>
                            <div className="flex items-center justify-between md:justify-start gap-3">
                                <h2 className='text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-white drop-shadow-2xl'>Hello, {profile?.username || profile?.email?.split('@')[0]}</h2>
                                <ShieldCheck className="text-cyan-400" size={20} />
                            </div>
                            <div className='flex flex-wrap items-center gap-4 mt-3'>
                                <div className='flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 group/id hover:border-cyan-500/30 transition-colors'>
                                    <span className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400'>ID: {profile?.referral_code || profile?.id?.slice(0, 8).toUpperCase()}</span>
                                    <button 
                                        onClick={() => {
                                            const code = profile?.referral_code || profile?.id?.slice(0, 8).toUpperCase() || '';
                                            if (code) {
                                                navigator.clipboard.writeText(code);
                                                import('sonner').then(({ toast }) => toast.success("ID Copied"));
                                            }
                                        }}
                                        className='p-1 hover:text-cyan-400 transition-colors text-white/40'
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                                <div className='flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 backdrop-blur-md'>
                                    <div className='w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.6)]' />
                                    <span className='text-[9px] font-black uppercase tracking-widest'>Verified Agent</span>
                                </div>
                            </div>
                        </div>

                        {/* START BUTTON ADDED AS REQUESTED */}
                        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                            <Link href="/app/tasks" className="p-1 rounded-[32px] bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 shadow-[0_20px_60px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all group/bt w-full md:w-auto">
                                <div className="px-10 py-6 md:py-8 rounded-[30px] bg-black/40 backdrop-blur-xl flex flex-col items-center gap-1 group-hover/bt:bg-white/5 transition-all">
                                    <Play size={28} className="text-white fill-white shadow-2xl md:w-10 md:h-10" />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white">START</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="px-8 pb-10 md:pb-12 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-cyan-400/60 uppercase tracking-widest italic mb-1">Yield Rate</span>
                            <span className="text-2xl font-black italic">{(profile?.level?.commission_rate ? (profile.level.commission_rate * 100).toFixed(1) : '0.5')}%</span>
                        </div>
                        <div className="flex flex-col border-l border-white/5 pl-6">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic mb-1">Node</span>
                            <span className="text-2xl font-black italic">1x</span>
                        </div>
                        <div className="flex flex-col border-l border-white/5 pl-6">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic mb-1">Stream Capacity</span>
                            <span className="text-2xl font-black italic">{profile?.level?.tasks_per_set || 40} Units</span>
                        </div>
                        <div className="flex flex-col border-l border-white/5 pl-6">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic mb-1">Daily Cap</span>
                            <span className="text-2xl font-black italic">3 Sets</span>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10 px-6 md:px-8 pb-16'>
                        {/* Available Balance */}
                        <div className='bg-black/60 backdrop-blur-md rounded-[32px] p-10 pb-14 border border-white/10 hover:bg-black/80 transition-all duration-500 group/card shadow-2xl overflow-hidden'>
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <WalletIcon size={80} className="text-white" />
                            </div>
                            <div className='flex items-center justify-between mb-4'>
                                <p className='text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic'>Available Balance</p>
                            </div>
                            <h4 className='text-2xl md:text-4xl font-black text-white italic tracking-tighter'>$ {(profile?.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                            <div className='mt-6 flex items-center gap-2 text-[9px] font-black text-cyan-400 bg-cyan-400/10 w-fit px-3 py-1.5 rounded-xl border border-cyan-400/10'>
                                <Zap className='w-3 h-3 fill-cyan-400/20' />
                                <span className='uppercase tracking-widest'>NODE ACTIVE</span>
                            </div>
                        </div>

                        {/* Today's Profit */}
                        <div className='bg-black/60 backdrop-blur-md rounded-[32px] p-10 pb-14 border border-white/10 hover:bg-black/80 transition-all duration-500 group/card shadow-2xl overflow-hidden'>
                            <div className='flex items-center justify-between mb-4'>
                                <div className="flex items-center gap-3">
                                    <TrendingUp className='text-emerald-400 w-4 h-4' />
                                    <p className='text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic'>Today's Profit</p>
                                </div>
                            </div>
                            <h4 className='text-2xl md:text-4xl font-black text-emerald-400 italic tracking-tighter'>$ {(profile?.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                            <div className="h-1 w-full bg-emerald-500/10 rounded-full mt-6" />
                        </div>

                        {/* Referral Bonus */}
                        <div className='bg-black/60 backdrop-blur-md rounded-[32px] p-10 pb-14 border border-white/10 hover:bg-black/80 transition-all duration-500 group/card shadow-2xl overflow-hidden'>
                            <div className='flex items-center justify-between mb-4'>
                                <div className="flex items-center gap-3">
                                    <Users className='text-purple-400 w-4 h-4' />
                                    <p className='text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic'>Referral Bonus</p>
                                </div>
                            </div>
                            <h4 className='text-2xl md:text-4xl font-black text-purple-400 italic tracking-tighter'>$ {(profile?.referral_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                            <div className="h-1 w-full bg-purple-500/10 rounded-full mt-6" />
                        </div>

                        {/* Freeze Balance */}
                        <div className='bg-black/60 backdrop-blur-md rounded-[32px] p-10 pb-14 border border-white/10 hover:bg-black/80 transition-all duration-500 group/card shadow-2xl overflow-hidden'>
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Lock size={80} className="text-white" />
                            </div>
                            <div className='flex items-center justify-between mb-4'>
                                <p className='text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic'>Freeze Balance</p>
                            </div>
                            <h4 className='text-2xl md:text-4xl font-black text-white italic tracking-tighter'>$ {(profile?.freeze_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                            <div className='mt-6 flex items-center gap-2 text-[9px] font-black text-amber-500 bg-amber-500/10 w-fit px-3 py-1.5 rounded-xl border border-amber-500/10'>
                                <RefreshCw className='w-3 h-3' />
                                <span className='uppercase tracking-widest'>IN CLEARANCE</span>
                            </div>
                        </div>

                        <div className='bg-black/60 backdrop-blur-md rounded-[32px] p-10 pb-14 border border-white/10 hover:bg-black/80 transition-all duration-500 group/card shadow-2xl overflow-hidden'>
                            <div className='flex items-center justify-between mb-4'>
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="w-4 h-4 text-cyan-400" />
                                    <p className='text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic'>Task Progress</p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h4 className='text-4xl font-black text-white italic tracking-tighter'>{(profile?.completed_count || 0) % (profile?.level?.tasks_per_set || 40)}</h4>
                                <span className="text-xl text-zinc-700 font-bold">/ {profile?.level?.tasks_per_set || 40}</span>
                            </div>
                            <div className='w-full h-2 bg-white/5 rounded-full mt-6 overflow-hidden border border-white/5'>
                                    <div 
                                        className='h-full bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] rounded-full transition-all duration-1000' 
                                        style={{ width: `${Math.min((((profile?.completed_count || 0) % (profile?.level?.tasks_per_set || 40)) / (profile?.level?.tasks_per_set || 40)) * 100, 100)}%` }}
                                    />
                            </div>
                        </div>
                </div>
            </div>
        </div>

        {/* Financial Hub */}
        <div className='px-6 mb-12'>
            <div className='flex items-center justify-between mb-8'>
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
                    <h4 className='text-lg font-black tracking-tight uppercase italic opacity-90'>Financial Hub</h4>
                </div>
                <div className='h-[1px] flex-1 mx-6 bg-white/5' />
            </div>
            <div className='grid grid-cols-4 gap-x-4 gap-y-12'>
            {menuItems.map((item, idx) => (
                <Link key={idx} href={item.href || '#'} className='flex flex-col items-center gap-4 group'>
                <div className={`w-14 h-14 rounded-full ${item.iconBg} border border-white/5 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-active:scale-90 group-hover:border-white/20`}>
                    {'textIcon' in item ? (
                    <span className={`text-[10px] font-black ${item.color}`}>{item.textIcon as string}</span>
                    ) : (
                    <item.icon className={`w-6 h-6 ${item.color} group-hover:brightness-125 transition-all`} strokeWidth={2.5} />
                    )}
                </div>
                <span className='text-[10px] font-black tracking-[0.2em] text-white/30 text-center uppercase leading-tight group-hover:text-white/60 transition-colors'>{item.label}</span>
                </Link>
            ))}
            </div>
        </div>

        {/* Employee Levels */}
        <div className='px-6 mb-16'>
            <div className='flex items-center justify-between mb-8'>
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                    <h4 className='text-lg font-black tracking-tight uppercase italic opacity-90'>Tiers & Influence</h4>
                </div>
                <Link href="/app/levels" className='text-[10px] font-black text-cyan-500 hover:text-cyan-400 flex items-center gap-2 transition-all uppercase tracking-widest'>
                    Expand <ChevronRight className='w-4 h-4' />
                </Link>
            </div>
            
            <div className='max-w-5xl mx-auto'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {levels.slice(0, 2).map((level, idx) => (
                <div key={idx} className={`w-full rounded-[48px] p-10 ${idx === 0 ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-white'} border border-white/5 relative group overflow-hidden shadow-2xl shadow-black/60 transition-all duration-500 hover:scale-[1.02] hover:border-white/20`}>
                <div className='absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] group-hover:bg-cyan-500/10 transition-all duration-700' />
                <div className='absolute top-8 right-8'>
                    <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        Number(profile?.level_id) >= Number(level.id) ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'bg-white/5 text-white/20'
                    )}>
                        <CircleCheck className="w-6 h-6" />
                    </div>
                </div>
                <h5 className='text-xs font-black opacity-40 mb-2 uppercase tracking-widest leading-none'>{level.name}</h5>
                <p className='text-4xl font-black tracking-tighter mb-6'>$ {
                    level.id === 1 ? '100' :
                    level.id === 2 ? '500' :
                    level.id === 3 ? '1,500' :
                    Number(level.price).toLocaleString()
                }</p>
                <p className='text-[11px] font-medium leading-relaxed text-zinc-400 mb-12'>
                    {level.id === 1 ? 'Secure commissions of 0.5% by completing 40 units pulse 3 daily sets.' :
                     level.id === 2 ? 'Secure commissions of 0.6% by completing 45 units pulse 3 daily sets.' :
                     level.id === 3 ? 'Secure commissions of 0.8% by completing 50 units pulse 3 daily sets.' :
                     'Strategic protocol verification and premium yield capture node.'}
                </p>
                
                <button className={cn(
                    'w-full py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95',
                    Number(profile?.level_id) >= Number(level.id) ? 'bg-white text-black hover:bg-zinc-200' : 'bg-white/5 text-white/20 border border-white/5'
                )}>
                    {Number(profile?.level_id) >= Number(level.id) ? 'OPERATIONAL' : 'LOCKED ACCESS'}
                </button>
                </div>
            ))}
                </div>
            </div>
        </div>

        <ActivityFeed />
        <DraggableChat />
      </div>
    </main>
  )
}
