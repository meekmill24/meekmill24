'use client';

import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { 
    ChevronLeft, 
    Calendar, 
    Award, 
    ShieldCheck, 
    Info,
    CheckCircle2,
    Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Portal from '@/components/Portal';

const salaryData = [
    { level: 1, name: 'Junior Node Agent', rewards: [100, 300, 1000, 1800, 5000], total: 8200 },
    { level: 2, name: 'Associate Node Agent', rewards: [200, 600, 2000, 3600, 10000], total: 16400 },
    { level: 3, name: 'Senior Node Agent', rewards: [300, 900, 3000, 5400, 15000], total: 24600 },
    { level: 4, name: 'Elite Node Agent', rewards: [400, 1200, 4000, 7200, 20000], total: 32800 },
    { level: 5, name: 'Ultimate Node Agent', rewards: [1000, 2500, 6000, 12000, 35000], total: 56500 },
];

const days = [2, 4, 7, 15, 30];

export default function SalaryPage() {
    const { profile, refreshProfile } = useAuth();
    const { format } = useCurrency();
    const [claiming, setClaiming] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const currentDays = (profile as any)?.salary_days_count || 0;
    const currentLevel = profile?.level_id || 1;

    const handleClaim = async () => {
        setClaiming(true);
        setMessage(null);
        try {
            const { data, error } = await supabase.rpc('claim_salary_bonus');
            if (error) throw error;
            
            if (data.success) {
                setMessage({ type: 'success', text: `Captured $${data.amount} for day ${data.day} milestone!` });
                refreshProfile();
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Verification failed. Milestone not reached.' });
        } finally {
            setClaiming(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 px-4 md:px-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/app" className="p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <ChevronLeft size={20} className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Salary Hub</h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-60">Strategic Performance Rewards</p>
                    </div>
                </div>
                <div className="hidden md:flex">
                    <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                        <Calendar size={14} className="text-indigo-400" />
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{currentDays} Consecutive Days</span>
                    </div>
                </div>
            </div>

            {/* Salary Progress Card */}
            <div className="glass-card-strong p-10 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 border border-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center justify-between">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_10px_30px_rgba(99,102,241,0.2)]">
                                <Award size={28} />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter italic">Optimization Yield</h2>
                        </div>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md opacity-80 uppercase tracking-wide">
                            Scale your node activity through consistent daily verification sequences. Higher streaks unlock tiered governance payouts.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="w-28 h-28 rounded-full border-[8px] border-indigo-500/10 border-t-indigo-500 flex items-center justify-center relative shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                            <span className="text-4xl font-black text-white tabular-nums italic">{currentDays}</span>
                            <div className="absolute -bottom-3 px-3 py-1 bg-indigo-500 rounded-lg text-[10px] font-black text-white uppercase tracking-widest shadow-xl">DAYS</div>
                        </div>
                        <button 
                            onClick={handleClaim}
                            disabled={claiming}
                            className="w-full md:w-auto px-10 py-4 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(99,102,241,0.3)] hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50"
                        >
                            {claiming ? 'AUDITING...' : 'VERIFY & CLAIM'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`mt-8 p-5 rounded-2xl border text-[11px] font-bold uppercase tracking-[0.15em] text-center animate-in zoom-in duration-300
                        ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}
                    `}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Salary Table */}
            <div className="glass-card-strong overflow-hidden border border-white/5 rounded-[32px]">
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Trophy size={20} className="text-amber-500" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Payout Matrix</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">30 Day Cycle</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                <th className="p-6 pl-10">Employee Grade</th>
                                {days.map(day => (
                                    <th key={day} className="p-6 text-center">Day {day}</th>
                                ))}
                                <th className="p-6 pr-10 text-right">Base Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {salaryData.map((row, i) => (
                                <tr key={row.level} className={`group hover:bg-white/[0.02] transition-colors ${currentLevel === row.level ? 'bg-indigo-500/5' : ''}`}>
                                    <td className="p-6 pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-xl bg-gradient-to-br ${
                                                i === 0 ? 'from-cyan-500 to-blue-600' :
                                                i === 1 ? 'from-purple-500 to-indigo-600' :
                                                i === 2 ? 'from-amber-400 to-orange-500' :
                                                'from-rose-500 to-red-600'
                                            }`}>
                                                VIP {row.level}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white uppercase tracking-tight italic">{row.name}</span>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Protocol Agent</span>
                                            </div>
                                        </div>
                                    </td>
                                    {row.rewards.map((reward, j) => (
                                        <td key={j} className="p-6 text-center">
                                            <div className={`text-sm font-black tabular-nums tracking-tighter ${currentDays >= days[j] && currentLevel === i + 1 ? 'text-green-500' : 'text-slate-200'}`}>
                                                {format(reward)}
                                            </div>
                                            {currentDays >= days[j] && currentLevel === i + 1 && (
                                                <div className="text-[8px] font-black text-green-500 uppercase tracking-tighter animate-pulse">Reached</div>
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-6 pr-10 text-right">
                                        <div className="text-base font-black text-indigo-400 tracking-tighter italic">
                                            {format(row.total)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card-strong p-10 space-y-8 rounded-[40px]">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                        <Info size={16} className="text-indigo-500" />
                        Governance Protocols
                    </h3>
                    <ul className="space-y-6">
                        {[
                            'Salary capture thresholds activate at 48-hour node cycles.',
                            'Grade progression enhances multi-tier compensation rates.',
                            'Milestones sync at intervals: 2, 4, 7, 15, and 30 days.',
                            'Operational window: 09:00 - 21:00 UTC (Real-time monitoring).',
                            'Node interruption resets the consecutive sequence counter.'
                        ].map((note, idx) => (
                            <li key={idx} className="flex gap-4 items-start group">
                                <div className="w-5 h-5 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-500/40 transition-colors">
                                    <CheckCircle2 size={12} className="text-indigo-400" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-[0.1em] opacity-80 group-hover:opacity-100 transition-opacity">
                                    {note}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-card-strong p-10 space-y-8 rounded-[40px] relative overflow-hidden bg-slate-950/20">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px]" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                        <ShieldCheck size={16} className="text-green-500" />
                        Compliance Audit
                    </h3>
                    <div className="space-y-6 relative z-10">
                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Capture Logic</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest opacity-80">
                                Rewards are calculated post-verification. High-yield institutional bundles may require manual governance approval.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 p-5 rounded-3xl bg-white/5 border border-white/5">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">Sync Status</span>
                                <span className="text-sm font-black text-green-500 italic">Optimized</span>
                            </div>
                            <div className="flex-1 p-5 rounded-3xl bg-white/5 border border-white/5">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">Security</span>
                                <span className="text-sm font-black text-white italic">TLS-V3</span>
                            </div>
                        </div>
                        <Link href="/app/support" className="flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            Request Governance Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
