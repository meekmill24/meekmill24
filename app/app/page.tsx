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
  HelpCircle,
  Menu as MenuIcon,
  X as CloseIcon,
  Grid
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import ActivityFeed from '@/components/ActivityFeed'
import DraggableChat from '@/components/DraggableChat'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { getLevels } from '@/lib/actions/admin'

export default function HomePage() {
  const { profile, loading: profileLoading } = useAuth()
  const { format } = useCurrency()
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
      <div className='flex items-center justify-center min-h-screen bg-[#0a0a0a]'>
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
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-32 relative overflow-x-hidden'>
      {/* Background Layer */}
      <div className='fixed inset-0 z-0 opacity-20 pointer-events-none'>
        <Image 
            src="/strategic_hub_bg.png" 
            alt="Background" 
            fill 
            className="object-cover blur-3xl scale-110"
        />
      </div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Header Hub */}
        <div className='flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5'>
            <div className='flex items-center gap-3'>
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-2xl shadow-2xl border border-white/10" />
                <h1 className='text-3xl font-black italic tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent underline decoration-cyan-500/30 decoration-4 underline-offset-8'>Captiv8</h1>
            </div>
            <div className='flex items-center gap-4'>
                <Link href="/app/profile" className='w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner hover:bg-white/10 transition-all'>
                    <User className='w-6 h-6 text-cyan-400' />
                </Link>
                <div className='w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group'>
                    <Bell className='w-6 h-6 group-hover:rotate-12 transition-transform' />
                </div>
            </div>
        </div>

        {/* Floating Quick-Nav Hub (Mobile Only - Relocated to Left) */}
        <div id="quick-nav-hub" className="fixed top-[84px] left-6 z-[100] md:hidden">
            <button 
                onClick={() => setIsSpinning(!isSpinning)}
                className="w-14 h-14 rounded-2xl bg-black/60 backdrop-blur-3xl flex items-center justify-center text-cyan-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 active:scale-95 transition-all group"
            >
                {isSpinning ? <CloseIcon size={24} /> : <MenuIcon size={24} className="group-hover:scale-110 transition-transform" />}
            </button>
            
            {isSpinning && (
                <div className="absolute top-18 left-0 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 w-56 shadow-3xl animate-in slide-in-from-top-4 duration-200">
                    <div className="flex flex-col gap-5">
                        <Link href="#profile" onClick={() => setIsSpinning(false)} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5"><User size={16} /></div>
                            Operational Hub
                        </Link>
                        <Link href="#stats-grid" onClick={() => setIsSpinning(false)} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5"><TrendingUp size={16} /></div>
                            Terminal Stats
                        </Link>
                        <Link href="#financial-hub" onClick={() => setIsSpinning(false)} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5"><Zap size={16} /></div>
                            Asset Flow
                        </Link>
                        <Link href="#tiers" onClick={() => setIsSpinning(false)} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5"><Trophy size={16} /></div>
                            Node Tiers
                        </Link>
                    </div>
                </div>
            )}
        </div>

        {/* Promo Bar */}
        <div className='mx-6 mt-8 mb-4 bg-gradient-to-r from-zinc-900/60 to-black/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/5 group border-l-purple-500/50 border-l-4'>
            <div className='flex items-center gap-4'>
                <div className='w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center shadow-inner'>
                    <Zap className='w-5 h-5 text-purple-400 fill-purple-400/20' />
                </div>
                <div>
                    <p className='text-[8px] font-black uppercase tracking-[0.4em] text-white/40'>Institutional Bonus</p>
                    <p className='text-xs font-black uppercase tracking-widest text-white'>Claim up to 5000 USDT reward nodes</p>
                </div>
            </div>
            <ChevronRight className='w-5 h-5 text-white/20 group-hover:text-white transition-colors transition-transform group-hover:translate-x-1' />
        </div>

        {/* Hero Section */}
        <div id="profile" className='px-6 pt-4 mb-12'>
            <div className='relative overflow-hidden rounded-[48px] border border-white/10 shadow-3xl bg-zinc-900/60 backdrop-blur-3xl group'>
                <div className='absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-1000'>
                    <Image src="/strategic_hub_bg.png" alt="BG" fill className="object-cover" />
                </div>
                <div className='absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0' />
                
                {/* Banner Content (Reduced mobile padding) */}
                <div className="relative z-10 p-5 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    <div className='w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-3xl p-[2px] group-hover:rotate-3 transition-transform duration-700'>
                        <div className="w-full h-full rounded-[30px] md:rounded-[38px] bg-black/40 flex items-center justify-center backdrop-blur-md">
                            <span className="text-4xl md:text-5xl font-black italic text-white drop-shadow-2xl">{profile?.username?.[0]?.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className='flex-1 text-center md:text-left'>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                            <h2 className='text-3xl md:text-6xl font-black tracking-tighter italic uppercase text-white drop-shadow-2xl'>HELLO, {profile?.username || profile?.email?.split('@')[0]}</h2>
                            <div className='flex items-center justify-center md:justify-start gap-2 px-4 py-1.5 bg-black/40 text-cyan-400 rounded-full border border-cyan-500/20 backdrop-blur-md'>
                                <div className='w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.6)]' />
                                <span className='text-[9px] font-black uppercase tracking-widest'>Node Verified</span>
                            </div>
                        </div>
                        <div className='flex items-center justify-center md:justify-start gap-3 mt-4'>
                            <div className='bg-white/5 px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5'>
                                <span className='font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest'>ID: {profile?.referral_code || profile?.id?.slice(0, 8).toUpperCase()}</span>
                                <button onClick={() => {
                                    const code = profile?.referral_code || profile?.id?.slice(0, 8).toUpperCase() || '';
                                    navigator.clipboard.writeText(code);
                                    import('sonner').then(({ toast }) => toast.success("ID Copied"));
                                }} className='hover:text-cyan-400 transition-colors'><Copy size={12} /></button>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <Link href="/app/tasks" className="p-1 rounded-[32px] bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex flex-col items-center justify-center group/startBtn shadow-xl active:scale-95 transition-all">
                            <div className="px-12 py-6 md:py-10 rounded-[30px] bg-black/40 backdrop-blur-xl flex flex-col items-center gap-2">
                                <Play size={32} className="text-white fill-white drop-shadow-2xl" />
                                <span className="text-[10px] font-black tracking-[0.4em] text-white">INVOKE NODE</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Sub-Metric Rows */}
                <div className="relative z-10 px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/[0.02] border-t border-white/5">
                    {[
                        { label: 'Yield Rate', value: `${(profile?.level?.commission_rate ? (profile.level.commission_rate * 100).toFixed(1) : '0.5')}%`, color: 'text-cyan-400' },
                        { label: 'Execution', value: '1x NODE', color: 'text-white/40' },
                        { label: 'Capacity', value: `${profile?.level?.tasks_per_set || 40} Units`, color: 'text-white/40' },
                        { label: 'Cycles', value: '3 Daily', color: 'text-white/40' }
                    ].map((m, i) => (
                        <div key={i} className={cn("flex flex-col", i > 0 && "md:border-l md:border-white/5 md:pl-6")}>
                            <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1 italic", m.color || "text-white/40")}>{m.label}</span>
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter">{m.value}</span>
                        </div>
                    ))}
                </div>

                {/* Stats Grid - OPTIMIZED FOR LARGE SCREENS AS REQUESTED */}
                <div id="stats-grid" className='grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4 p-4 md:p-8 relative z-10'>
                    {/* Available Balance - PROMINENT MASTER POSITION ON DESKTOP */}
                    <div className='col-span-2 lg:col-span-2 bg-gradient-to-br from-zinc-900/80 to-black/40 backdrop-blur-md rounded-[32px] p-6 md:p-10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 group/card shadow-2xl relative overflow-hidden h-full flex flex-col justify-between'>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                             <WalletIcon size={120} className="text-cyan-400" />
                        </div>
                        <div>
                            <p className='text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-2 md:mb-4 italic'>Available Registry</p>
                            <div className='flex items-baseline gap-2 md:gap-3 mb-6'>
                                <span className='text-zinc-600 font-bold text-2xl md:text-4xl'>$</span>
                                <h1 className='text-3xl md:text-6xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]'>
                                    {profile?.wallet_balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h1>
                            </div>
                        </div>
                        <div className='inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit group/btn hover:bg-cyan-500/20 transition-all cursor-pointer'>
                            <div className='w-2 h-2 rounded-full bg-cyan-500 animate-pulse' />
                            <span className='text-[8px] md:text-[10px] font-black uppercase tracking-widest text-cyan-400'>SECURE NODE</span>
                        </div>
                    </div>

                    {/* Today's Profit */}
                    <div className='lg:col-span-1 bg-black/40 backdrop-blur-md rounded-[24px] p-5 md:p-8 border border-white/5 hover:bg-black/60 transition-all duration-500 group/card shadow-2xl relative overflow-hidden h-full flex flex-col justify-between'>
                        <div>
                            <p className='text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2'>Cycle Profit</p>
                            <div className='flex items-baseline gap-1 md:gap-2 mb-4'>
                                <span className='text-emerald-900 font-bold text-lg md:text-2xl'>$</span>
                                <h1 className='text-2xl md:text-4xl font-black italic tracking-tighter text-emerald-400'>
                                    {(profile?.wallet_balance * 0.0155).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h1>
                            </div>
                        </div>
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-3/4 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>

                    {/* Referral Bonus */}
                    <div className='lg:col-span-1 bg-black/40 backdrop-blur-md rounded-[24px] p-5 md:p-8 border border-white/5 hover:bg-black/60 transition-all duration-500 group/card shadow-2xl relative overflow-hidden h-full flex flex-col justify-between'>
                        <div>
                            <p className='text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2'>Network</p>
                            <div className='flex items-baseline gap-1 md:gap-2 mb-4'>
                                <span className='text-purple-900 font-bold text-lg md:text-2xl'>$</span>
                                <h1 className='text-2xl md:text-4xl font-black italic tracking-tighter text-white'>0.00</h1>
                            </div>
                        </div>
                        <span className='text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/20 animate-pulse tracking-[0.5em]'>READY</span>
                    </div>

                    {/* Task Progress */}
                    <div className='lg:col-span-1 bg-black/40 backdrop-blur-md rounded-[24px] p-5 md:p-8 border border-white/5 hover:bg-black/60 transition-all duration-500 group/card shadow-2xl relative overflow-hidden h-full flex flex-col justify-between'>
                        <div>
                            <p className='text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2'>Unit cycles</p>
                            <div className='flex items-baseline gap-1 md:gap-2 mb-4'>
                                <h1 className='text-2xl md:text-4xl font-black italic tracking-tighter text-white'>
                                    {(profile?.completed_count || 0) % (profile?.level?.tasks_per_set || 40)}
                                </h1>
                                <span className="text-[10px] md:text-base text-zinc-700 font-bold">/ {profile?.level?.tasks_per_set || 40}</span>
                            </div>
                        </div>
                        <div className='w-full h-1 bg-white/5 rounded-full overflow-hidden'>
                            <div 
                                className='h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-1000' 
                                style={{ width: `${Math.min((((profile?.completed_count || 0) % (profile?.level?.tasks_per_set || 40)) / (profile?.level?.tasks_per_set || 40)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Financial Hub */}
        <div id="financial-hub" className='px-6 mb-16'>
            <div className='flex items-center gap-4 mb-8'>
                <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
                <h4 className='text-xl font-black tracking-tight uppercase italic'>Strategic Hub</h4>
            </div>
            <div className='grid grid-cols-4 gap-x-4 gap-y-10'>
            {menuItems.map((item, idx) => (
                <Link key={idx} href={item.href || '#'} className='flex flex-col items-center gap-3 group'>
                <div className={cn("w-14 h-14 rounded-full border border-white/5 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-active:scale-95 group-hover:border-white/20", item.iconBg)}>
                    <item.icon className={cn("w-6 h-6 group-hover:brightness-125 transition-all", item.color)} strokeWidth={2.5} />
                </div>
                <span className='text-[10px] font-black tracking-widest text-zinc-500 group-hover:text-white transition-colors uppercase'>{item.label}</span>
                </Link>
            ))}
            </div>
        </div>

        {/* VIP Tiers */}
        <div id="tiers" className='px-6 mb-20'>
            <div className='flex items-center gap-4 mb-10'>
                <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                <h4 className='text-xl font-black tracking-tight uppercase italic'>Verified Nodes</h4>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {levels.slice(0, 2).map((level, idx) => (
                <div key={idx} className='w-full rounded-[48px] p-10 bg-zinc-900 border border-white/10 relative group overflow-hidden shadow-3xl hover:border-cyan-500/30 transition-all'>
                    <div className='absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px]' />
                    <h5 className='text-xs font-black text-cyan-400 uppercase tracking-widest mb-2 opacity-60'>{level.name}</h5>
                    <p className='text-5xl font-black italic tracking-tighter mb-8'>$ {level.id === 1 ? '100' : level.id === 2 ? '500' : Number(level.price).toLocaleString()}</p>
                    <div className='flex items-center gap-4 mb-10'>
                        <div className='px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold tracking-widest text-zinc-400 uppercase'>{(level.commission_rate * 100).toFixed(1)}% Yield</div>
                        <div className='px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold tracking-widest text-zinc-400 uppercase'>{level.tasks_per_set} Units/Cycle</div>
                    </div>
                    <button className={cn(
                        'w-full py-5 rounded-3xl font-black text-[10px] tracking-widest uppercase transition-all shadow-xl active:scale-95',
                        Number(profile?.level_id) >= Number(level.id) ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/20' : 'bg-white/5 text-white/30 border border-white/10'
                    )}>
                        {Number(profile?.level_id) >= Number(level.id) ? 'Operational' : 'Access Restricted'}
                    </button>
                </div>
            ))}
            </div>
        </div>

        <ActivityFeed />
        <DraggableChat />
      </div>
    </main>
  )
}
