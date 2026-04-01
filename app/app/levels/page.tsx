'use client'

import { useEffect, useState } from 'react'
import { 
    ChevronLeft, 
    ShieldCheck, 
    TrendingUp, 
    Zap, 
    Star, 
    Trophy, 
    Lock, 
    CheckCircle2, 
    ChevronRight,
    ArrowRightCircle,
    AudioWaveform as Waveform
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
  const { format } = useCurrency()
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLevels() {
        const mockupTiers = [
            { id: 1, name: 'SILVER NODE', price: 250, commission_rate: 0.12, tasks_per_set: 40 },
            { id: 2, name: 'GOLD NODE', price: 750, commission_rate: 0.18, tasks_per_set: 65 },
            { id: 3, name: 'PLATINUM NODE', price: 2500, commission_rate: 0.25, tasks_per_set: 100 },
            { id: 4, name: 'ELITE HUB', price: 10000, commission_rate: 0.35, tasks_per_set: 250 }
        ];

        try {
            const data = await getLevels()
            
            if (data && data.length > 0) {
                // Merge data with mockup if less than standard
                const combined = [...data]
                if (combined.length < 4) {
                    combined.push(...mockupTiers.slice(combined.length))
                }
                setLevels(combined)
            } else {
                setLevels(mockupTiers)
            }
        } catch (e) {
            console.error(e)
            setLevels(mockupTiers)
        } finally {
            setLoading(false)
        }
    }
    loadLevels()
  }, [])



  return (
    <main className='min-h-screen bg-[#020617] text-white pb-32 pb-inset selection:bg-cyan-500/30 font-mono'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-8 bg-slate-900/60 backdrop-blur-3xl sticky top-0 z-30 border-b border-white/5'>
        <div className='flex items-center gap-4'>
          <Link href="/app">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-all hover:bg-white/10">
                <ChevronLeft className='w-6 h-6 text-slate-400' />
            </div>
          </Link>
          <h1 className='text-2xl font-black tracking-tighter uppercase italic'>VIP <span className="text-cyan-400">Map</span></h1>
        </div>
        <div className='w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center'>
            <Waveform className='w-5 h-5 text-cyan-400 animate-pulse' />
        </div>
      </div>

      <div className='px-6 pt-8 space-y-12 relative max-w-lg mx-auto'>
        {/* Map Line (Visual Decor) */}
        <div className="absolute left-11 top-40 bottom-40 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent -z-10" />

        {/* Intro Card */}
        <div className='bg-slate-900 p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group'>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[60px] translate-x-10 translate-y-[-10px]" />
            <h2 className='text-xl font-black tracking-tighter uppercase mb-3 flex items-center gap-3 italic'>
                <ShieldCheck className='w-6 h-6 text-cyan-400' />
                Yield <span className="text-cyan-400 font-black">Archive</span>
            </h2>
            <p className='text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic'>
                Protocol tiers dictate operation limits and yield multipliers. Upgrade your node identity to access advanced executive streams.
            </p>
        </div>

        {/* Levels List in Map Style */}
        <div className='space-y-12'>
            {levels.map((level, index) => {
                const isElite = Number(level.price) === 3000;
                const isCurrent = Number(profile?.level_id) === Number(level.id);
                const isLocked = Number(profile?.level_id) < Number(level.id);
                
                return (
                <div key={level.id} className="relative pl-12">
                    {/* Map Node Dot */}
                    <div className={cn(
                        "absolute left-0 top-12 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all duration-700 z-10",
                        isCurrent ? "bg-cyan-500 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.5)]" : 
                        isElite ? "bg-rose-500 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)]" : "bg-slate-900 border-white/5"
                    )}>
                        {isCurrent && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                    </div>

                    <div className={cn(
                        "bg-slate-900 rounded-[48px] p-8 border transition-all duration-500 hover:translate-x-2 group relative overflow-hidden",
                        isCurrent ? "border-cyan-500/30 bg-cyan-500/[0.03] shadow-[0_0_40px_rgba(6,182,212,0.1)]" : 
                        isElite ? "border-rose-500/30 bg-rose-500/[0.03] shadow-[0_0_40px_rgba(244,63,94,0.1)]" : "border-white/5 shadow-2xl"
                    )}>
                        {isElite && (
                            <div className="absolute top-0 right-0 px-6 py-2 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                                EXECUTIVE
                            </div>
                        )}
                        <div className="absolute top-8 right-8 text-[8px] font-black text-slate-700 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                            PROTOCOL x{index + 1}
                        </div>
                        
                        <div className="flex items-start justify-between mb-10">
                            <div className={cn(
                                "w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-all",
                                isCurrent ? "border-cyan-500/30" : isElite ? "border-rose-500/30" : ""
                            )}>
                                {isCurrent ? <Zap className="w-8 h-8 text-cyan-400" /> : 
                                 isElite ? <Lock className="w-8 h-8 text-rose-500" /> :
                                 index === 1 ? <Star className="w-8 h-8 text-purple-400" /> : 
                                 <Trophy className="w-8 h-8 text-amber-400" />}
                            </div>
                            <div className="text-right">
                                <p className={cn("text-3xl font-black italic tracking-tighter", isElite ? "text-rose-500" : "text-white")}>
                                    ${Number(level.price).toLocaleString()}
                                </p>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1 italic">Security Bond</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white mb-2">{level.name}</h3>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest italic">
                                    {isElite ? 'Highly classified operational unit for executive agents with maximized yield capture and instant settlement.' : 
                                     level.id === 1 ? 'Optimal node for high-frequency pulse verification and basic yield capture.' :
                                     level.id === 2 ? 'Advanced institutional node with expanded capacity for professional agents.' :
                                     level.id === 3 ? 'Elite strategic node with premium multiplier and multi-stream verification.' :
                                     level.id === 4 ? 'Executive node oversight with major commissions and expanded node-relay.' :
                                     'Ultimate operational capability with maximum capture rate and unit capacity.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:border-white/10 transition-all">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Yield Rate</p>
                                    <p className={cn("text-lg font-black", isElite ? "text-rose-500" : "text-cyan-400")}>{(Number(level.commission_rate) * 100).toFixed(1)}%</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:border-white/10 transition-all">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Node Units</p>
                                    <p className="text-lg font-black text-white">{level.tasks_per_set} Sets</p>
                                </div>
                            </div>

                            <Button 
                                onClick={() => {
                                    if (isLocked) {
                                        window.location.href = '/app/support';
                                    }
                                }}
                                className={cn(
                                    "w-full h-16 rounded-[24px] font-black tracking-[0.2em] uppercase transition-all shadow-xl text-[10px] active:scale-95",
                                    isCurrent 
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                                        : !isLocked
                                            ? "bg-white text-slate-900 shadow-slate-500/20"
                                            : "bg-white/5 text-slate-500 border border-white/5 hover:border-cyan-500/30 hover:text-white"
                                )}
                            >
                                {isCurrent 
                                    ? 'Node Active' 
                                    : !isLocked
                                        ? 'Verified Access'
                                        : 'Authorize Node'}
                                <ArrowRightCircle className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            )})}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
