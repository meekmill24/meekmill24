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
        try {
            const data = await getLevels()
            setLevels(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    loadLevels()
  }, [])



  return (
    <main className='min-h-screen bg-[#0F172A] text-white pb-32 pb-inset'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-8 bg-black/40 backdrop-blur-md sticky top-0 z-30'>
        <div className='flex items-center gap-4'>
          <Link href="/app">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-2xl font-black tracking-tighter uppercase italic'>VIP <span className="text-cyan-400">Map</span></h1>
        </div>
        <div className='w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center'>
            <Waveform className='w-5 h-5 text-emerald-400' />
        </div>
      </div>

      <div className='px-6 pt-8 space-y-12 relative'>
        {/* Map Line (Visual Decor) */}
        <div className="absolute left-12 top-40 bottom-40 w-1 bg-gradient-to-b from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 -z-10" />

        {/* Intro Card */}
        <div className='glass-dark rounded-[40px] p-8 border border-white/5 shadow-2xl relative overflow-hidden group'>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[60px] translate-x-10 translate-y-[-10px]" />
            <h2 className='text-xl font-black tracking-tighter uppercase mb-3 flex items-center gap-3 italic'>
                <ShieldCheck className='w-6 h-6 text-cyan-400' />
                Yield <span className="text-cyan-400">Architecture</span>
            </h2>
            <p className='text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-relaxed'>
                Protocol tiers dictate operation limits and yield multipliers. Upgrade your node identity to access advanced verification streams.
            </p>
        </div>

        {/* Levels List in Map Style */}
        <div className='space-y-8'>
            {levels.map((level, index) => (
                <div key={level.id} className="relative pl-12">
                    {/* Map Node Dot */}
                    <div className={cn(
                        "absolute left-0 top-10 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all duration-700",
                        index === 0 ? "bg-cyan-500 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.5)]" : "bg-zinc-900 border-white/5"
                    )}>
                        {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                    </div>

                    <div className={cn(
                        "glass-dark rounded-[44px] p-8 border border-white/5 shadow-2xl transition-all duration-500 hover:translate-x-2 group relative overflow-hidden",
                        index === 0 ? "border-cyan-500/20 bg-cyan-500/[0.02]" : ""
                    )}>
                        <div className="absolute top-8 right-8 text-[8px] font-black text-zinc-700 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                            NODE {index + 1}
                        </div>
                        
                        <div className="flex items-start justify-between mb-10">
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-cyan-500/30 transition-all">
                                {index === 0 ? <Zap className="w-8 h-8 text-cyan-400" /> : 
                                 index === 1 ? <Star className="w-8 h-8 text-purple-400" /> : 
                                 <Trophy className="w-8 h-8 text-amber-400" />}
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black italic tracking-tighter text-white">
                                    ${level.id === 1 ? '100' :
                                      level.id === 2 ? '500' :
                                      level.id === 3 ? '1,500' :
                                      Number(level.price).toLocaleString()}
                                </p>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-1 italic">Activation Requirement</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                        <div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white mb-2">{level.name}</h3>
                                <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">
                                    {level.id === 1 ? 'Optimal node for high-frequency pulse verification and basic yield capture.' :
                                     level.id === 2 ? 'Advanced institutional node with expanded capacity for professional agents.' :
                                     level.id === 3 ? 'Elite strategic node with premium multiplier and multi-stream verification.' :
                                     level.id === 4 ? 'Executive node oversight with major commissions and expanded node-relay.' :
                                     'Ultimate operational capability with maximum capture rate and unit capacity.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:border-white/10 transition-all">
                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Yield Rate</p>
                                    <p className="text-lg font-black text-cyan-400">{(Number(level.commission_rate) * 100).toFixed(1)}%</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:border-white/10 transition-all">
                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 italic">Stream Capacity</p>
                                    <p className="text-lg font-black text-white">{level.tasks_per_set} Units</p>
                                </div>
                            </div>

                            <Button 
                                onClick={() => {
                                    if (Number(profile?.level_id) < Number(level.id)) {
                                        window.location.href = '/app/support';
                                    }
                                }}
                                className={cn(
                                    "w-full h-16 rounded-2xl font-black tracking-[0.2em] uppercase transition-all shadow-xl text-[10px]",
                                    Number(profile?.level_id) === Number(level.id) 
                                        ? "bg-green-500 text-white shadow-green-500/20" 
                                        : Number(profile?.level_id) > Number(level.id)
                                            ? "bg-white text-slate-900 shadow-cyan-500/20"
                                            : "bg-white/5 text-zinc-500 border border-white/5 hover:border-cyan-500/30 hover:text-white"
                                )}
                            >
                                {Number(profile?.level_id) === Number(level.id) 
                                    ? 'Node Synchronized' 
                                    : Number(profile?.level_id) > Number(level.id)
                                        ? 'Verified Access'
                                        : 'Authorize Node'}
                                <ChevronRight className="w-4 h-4 ml-2" />
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
