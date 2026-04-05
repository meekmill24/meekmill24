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
                // PRICE-DRIVEN BRANDING: Sort by price, then assign prestige labels (1-5)
                const sorted = [...data].sort((a, b) => Number(a.price) - Number(b.price))
                
                // Final Institutional Logic: We map based on PRICE POSITION to ensure 
                // the $100 is always L1, $500 L2, $1500 L3, $3000 L4, $5000 L5
                const branded = sorted.map((level, index) => {
                    const displayLvl = index + 1; // 1, 2, 3, 4, 5
                    
                    let name = level.name;
                    let desc = level.description;
                    let icon = <Zap className="w-8 h-8 text-cyan-400" />;
                    let glow = "shadow-[0_0_40px_rgba(34,211,238,0.1)] border-cyan-500/20";

                    if (displayLvl === 1) {
                        name = "JUNIOR NODE AGENT";
                        icon = <Zap className="w-8 h-8 text-cyan-400" />;
                        glow = "shadow-[0_0_40px_rgba(34,211,238,0.1)] border-cyan-500/20";
                        desc = "Optimal node for high-frequency pulse verification and basic yield capture.";
                    } else if (displayLvl === 2) {
                        name = "ASSOCIATE NODE AGENT";
                        icon = <Star className="w-8 h-8 text-blue-400" />;
                        glow = "shadow-[0_0_40px_rgba(59,130,246,0.1)] border-blue-500/20";
                        desc = "Advanced institutional node with expanded capacity for professional agents.";
                    } else if (displayLvl === 3) {
                        name = "SENIOR NODE AGENT";
                        icon = <Flame className="w-8 h-8 text-purple-400" />;
                        glow = "shadow-[0_0_40px_rgba(168,85,247,0.1)] border-purple-500/20";
                        desc = "Senior operational node with premium multiplier and multi-stream verification.";
                    } else if (displayLvl === 4) {
                        name = "ELITE NODE AGENT";
                        icon = <Trophy className="w-8 h-8 text-amber-400" />;
                        glow = "shadow-[0_0_40px_rgba(245,158,11,0.1)] border-amber-500/20";
                        desc = "Elite strategic node with executive oversight and expanded node-relay.";
                    } else if (displayLvl === 5) {
                        name = "ULTIMATE NODE AGENT";
                        icon = <Crown className="w-8 h-8 text-orange-400" />;
                        glow = "shadow-[0_0_40px_rgba(249,115,22,0.1)] border-orange-500/20";
                        desc = "Ultimate operational capability with maximum capture rate and unit capacity.";
                    }

                    return { ...level, brandName: name, brandIcon: icon, brandGlow: glow, brandDesc: desc, displayLvl };
                });

                setLevels(branded)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    loadLevels()
  }, [])

  return (
    <main className='min-h-screen bg-[#050505] text-white pb-32 pb-inset'>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

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
            </div>
        </div>

        <div className='space-y-6'>
            {levels.map((level) => {
                const isCurrent = Number(profile?.level_id) === Number(level.id);
                const isVerified = Number(profile?.level_id) > Number(level.id);

                return (
                    <div key={level.id} className="group cursor-pointer">
                        <div className={cn(
                            "relative rounded-[48px] p-8 md:p-12 border transition-all duration-700 bg-zinc-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl",
                            isCurrent ? "border-cyan-500 shadow-cyan-500/10 bg-cyan-500/[0.03]" : "border-white/5 hover:border-white/20",
                            level.brandGlow
                        )}>
                            <div className={cn(
                                "absolute top-8 right-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                isCurrent ? "bg-cyan-500 text-black border-cyan-500 shadow-lg" : 
                                isVerified ? "bg-zinc-800 text-zinc-500 border-white/5" : "bg-black/40 text-zinc-600 border-white/10"
                            )}>
                                {isCurrent ? 'CURRENT NODE' : isVerified ? 'VERIFIED' : 'RESTRICTED'}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-20 h-20 rounded-[32px] flex items-center justify-center shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-700",
                                        isCurrent ? "bg-cyan-500/10" : "bg-white/5"
                                    )}>
                                        {level.brandIcon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white mb-1">{level.brandName}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">Tier {level.displayLvl} Node Hub</p>
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
                                    {level.brandDesc}
                                </p>

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
                                        <p className="text-2xl font-black text-zinc-400 uppercase tracking-tighter italic">LVL {level.displayLvl}</p>
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => {
                                        if (Number(profile?.level_id) < Number(level.id)) {
                                            window.location.href = '/app/support';
                                        }
                                    }}
                                    className={cn(
                                        "w-full h-20 rounded-[30px] font-black tracking-[0.4em] uppercase transition-all shadow-2xl text-xs active:scale-95 group/btn",
                                        isCurrent ? "bg-cyan-500 text-black shadow-cyan-500/20" : 
                                        isVerified ? "bg-white text-black hover:bg-zinc-200" : "bg-white/5 text-zinc-500 border border-white/5 hover:bg-white hover:text-black hover:border-white"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        {isCurrent ? 'NODE SYNCHRONIZED' : isVerified ? 'VERIFIED Hub' : 'AUTHORIZE ACCESS'}
                                        <ChevronRight className={cn(
                                            "w-5 h-5 group-hover/btn:translate-x-1 transition-transform",
                                            !isCurrent && !isVerified && "animate-pulse"
                                        )} />
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
