'use client'

import { useEffect, useState } from 'react'
import { 
    ChevronLeft, 
    ShieldCheck, 
    Zap, 
    Star, 
    Trophy, 
    ChevronRight,
    AudioWaveform as Waveform,
    LayoutGrid,
    Flame,
    Crown,
    Gem,
    ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getLevels } from '@/lib/actions/admin'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'

export default function VIPMapPage() {
  const { profile } = useAuth()
  const { format, currency, convert } = useCurrency()
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLevels() {
        try {
            const data = await getLevels()
            if (data && data.length > 0) {
                const sorted = [...data].sort((a, b) => Number(a.price) - Number(b.price))
                setLevels(sorted)
            } else {
                setLevels([
                    { id: 1, name: 'JUNIOR NODE AGENT', price: 100, commission_rate: 0.0004, tasks_per_set: 40 },
                    { id: 2, name: 'ASSOCIATE NODE AGENT', price: 500, commission_rate: 0.001, tasks_per_set: 45 }
                ])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    loadLevels()
  }, [])

  const getLevelIcon = (index: number) => {
    const icons = [
        <Zap key="1" className="w-8 h-8 text-cyan-400" />,
        <Star key="2" className="w-8 h-8 text-blue-400" />,
        <Flame key="3" className="w-8 h-8 text-purple-400" />,
        <Trophy key="4" className="w-8 h-8 text-amber-400" />,
        <Crown key="5" className="w-8 h-8 text-orange-400" />,
        <Gem key="6" className="w-8 h-8 text-rose-400" />
    ]
    return icons[index % icons.length]
  }

  const getLevelGlow = (index: number) => {
    const glows = [
        "shadow-[0_0_40px_rgba(34,211,238,0.1)] border-cyan-500/20",
        "shadow-[0_0_40px_rgba(59,130,246,0.1)] border-blue-500/20",
        "shadow-[0_0_40px_rgba(168,85,247,0.1)] border-purple-500/20",
        "shadow-[0_0_40px_rgba(245,158,11,0.1)] border-amber-500/20",
        "shadow-[0_0_40px_rgba(249,115,22,0.1)] border-orange-500/20",
        "shadow-[0_0_40px_rgba(244,63,94,0.1)] border-rose-500/20"
    ]
    return glows[index % glows.length]
  }

  return (
    <main className='min-h-screen bg-[#050505] text-white pb-32 pb-inset'>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className='flex items-center justify-between px-6 py-10 bg-black/40 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/5'>
        <div className='flex items-center gap-5'>
          <Link href="/app">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-all shadow-inner">
                <ChevronLeft className='w-6 h-6 text-zinc-400' />
            </div>
          </Link>
          <div>
            <h1 className='text-3xl font-black tracking-tighter uppercase italic leading-none'>VIP <span className="text-cyan-400">MAP</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-1">Operational Tiers</p>
          </div>
        </div>
        <div className='w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center animate-pulse'>
            <Waveform className='w-6 h-6 text-cyan-400' />
        </div>
      </div>

      <div className='px-6 pt-10 space-y-12 relative'>
        {/* Intro Hub */}
        <div className='relative rounded-[48px] p-1 shadow-2xl bg-gradient-to-br from-white/10 to-transparent'>
            <div className='bg-[#0a0a0a] rounded-[44px] p-8 md:p-12 relative overflow-hidden group'>
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] translate-x-12 translate-y-[-24px] group-hover:scale-125 transition-transform duration-1000" />
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <ShieldCheck className='w-7 h-7 text-black' />
                    </div>
                    <h2 className='text-2xl font-black tracking-tighter uppercase italic'>Verification <span className="text-cyan-400">Protocol</span></h2>
                </div>
                <p className='text-xs text-zinc-400 font-bold uppercase tracking-widest leading-relaxed font-mono max-w-sm'>
                   Elevate your node credentials. Higher verification levels unlock premium settlements, expanded unit capacity, and priority node-relay access.
                </p>
                
                <div className="mt-8 flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">Max Yield</span>
                        <span className="text-2xl font-black italic tracking-tighter">{(Math.max(...levels.map(l => l.commission_rate)) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="w-px h-10 bg-white/5" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Nodes Active</span>
                        <span className="text-2xl font-black italic tracking-tighter">{levels.length} Tiers</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Levels Grid - MODERN CARD STYLE */}
        <div className='space-y-6'>
            {levels.map((level, index) => (
                <div key={level.id} className="group cursor-pointer">
                    <div className={cn(
                        "relative rounded-[48px] p-8 md:p-12 border transition-all duration-700 bg-zinc-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl",
                        Number(profile?.level_id) === Number(level.id) 
                            ? "border-cyan-500 shadow-cyan-500/10 bg-cyan-500/[0.03]" 
                            : "border-white/5 hover:border-white/20",
                        getLevelGlow(index)
                    )}>
                        {/* Status Badge */}
                        <div className={cn(
                            "absolute top-8 right-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            Number(profile?.level_id) === Number(level.id)
                                ? "bg-cyan-500 text-black border-cyan-500 shadow-lg"
                                : Number(profile?.level_id) > Number(level.id)
                                    ? "bg-zinc-800 text-zinc-500 border-white/5"
                                    : "bg-black/40 text-zinc-600 border-white/10"
                        )}>
                            {Number(profile?.level_id) === Number(level.id) ? 'CURRENT NODE' : 
                             Number(profile?.level_id) > Number(level.id) ? 'VERIFIED' : 'RESTRICTED'}
                        </div>

                        {/* Top Line: Icon & Price */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-20 h-20 rounded-[32px] flex items-center justify-center shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-700",
                                    Number(profile?.level_id) === Number(level.id) ? "bg-cyan-500/10" : "bg-white/5"
                                )}>
                                    {getLevelIcon(index)}
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white mb-1">{level.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">Tier {index + 1} Node Hub</p>
                                    </div>
                                </div>
                            </div>
                            <div className="md:text-right">
                                <p className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">
                                    {currency.symbol} {convert(Number(level.price)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1 italic">Authorized Deposit</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest font-mono max-w-2xl border-l border-white/10 pl-6">
                                {level.id === 1 ? 'Optimal node for high-frequency pulse verification and basic yield capture.' :
                                 level.id === 2 ? 'Advanced institutional node with expanded capacity for professional agents.' :
                                 level.id === 3 ? 'Elite strategic node with premium multiplier and multi-stream verification.' :
                                 level.id === 4 ? 'Executive node oversight with major commissions and expanded node-relay.' :
                                 'Ultimate operational capability with maximum capture rate and unit capacity.'}
                            </p>

                            {/* Stat Boxes */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-black/60 rounded-3xl p-6 border border-white/5 group-hover:border-cyan-500/20 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Waveform size={12} className="text-cyan-400" />
                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Capture Rate</span>
                                    </div>
                                    <p className="text-2xl font-black text-cyan-400">{(Number(level.commission_rate) * 100).toFixed(2)}%</p>
                                </div>
                                <div className="bg-black/60 rounded-3xl p-6 border border-white/5 group-hover:border-blue-500/20 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <LayoutGrid size={12} className="text-blue-400" />
                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Unit Load</span>
                                    </div>
                                    <p className="text-2xl font-black text-white">{level.tasks_per_set} Cycles</p>
                                </div>
                                <div className="hidden md:block bg-black/60 rounded-3xl p-6 border border-white/5 group-hover:border-purple-500/20 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ArrowUpRight size={12} className="text-purple-400" />
                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Priority Node</span>
                                    </div>
                                    <p className="text-2xl font-black text-zinc-400 uppercase tracking-tighter italic">Lvl {level.id}</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <Button 
                                onClick={() => {
                                    if (Number(profile?.level_id) < Number(level.id)) {
                                        window.location.href = '/app/support';
                                    }
                                }}
                                className={cn(
                                    "w-full h-20 rounded-[30px] font-black tracking-[0.4em] uppercase transition-all shadow-2xl text-xs active:scale-95 group/btn",
                                    Number(profile?.level_id) === Number(level.id) 
                                        ? "bg-cyan-500 text-black shadow-cyan-500/20" 
                                        : Number(profile?.level_id) > Number(level.id)
                                            ? "bg-white text-black hover:bg-zinc-200"
                                            : "bg-white/5 text-zinc-500 border border-white/5 hover:bg-white hover:text-black hover:border-white"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {Number(profile?.level_id) === Number(level.id) 
                                        ? 'NODE SYNCHRONIZED' 
                                        : Number(profile?.level_id) > Number(level.id)
                                            ? 'VERIFIED Hub'
                                            : 'AUTHORIZE ACCESS'}
                                    <ChevronRight className={cn(
                                        "w-5 h-5 group-hover/btn:translate-x-1 transition-transform",
                                        Number(profile?.level_id) < Number(level.id) && "animate-pulse"
                                    )} />
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
