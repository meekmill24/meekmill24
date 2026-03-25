'use client';

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';
import { Spinner } from '@/components/ui/spinner';
import { 
    ArrowDownLeft, 
    ArrowUpRight, 
    Wallet as WalletIcon, 
    ShieldCheck, 
    History,
    ChevronRight,
    TrendingUp,
    CreditCard,
    Zap,
    Lock,
    RefreshCw,
    ChevronLeft,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
    const { profile, loading } = useAuth();
    const { format } = useCurrency();
    const router = useRouter();



    return (
        <div className="space-y-10 pb-60 px-6 pt-4">
            {/* Header section with Balance Overview */}
            <div className="relative group balance-card">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full animate-pulse pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full animate-pulse-slow pointer-events-none" />
                
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-blue-500/40 rounded-[40px] blur-2xl opacity-30 transition-opacity duration-1000"></div>
                
                <div className="relative glass-card-strong p-8 md:p-14 min-h-[260px] flex flex-col justify-center overflow-hidden border border-white/20 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] bg-black/60 backdrop-blur-3xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-6 text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <WalletIcon size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none italic">Wallet Overview</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-40">System Core Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-50 ml-1">
                                    Total Balance
                                </p>
                                <div className="flex items-baseline gap-2 overflow-hidden">
                                    <h2 className={cn(
                                        "text-4xl md:text-6xl font-black tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)] italic",
                                        (profile?.wallet_balance || 0) < 0 ? "text-rose-500" : "text-white"
                                    )}>
                                        {format(profile?.wallet_balance || 0).split('.')[0]}
                                        <span className="text-2xl md:text-3xl opacity-30">.{format(profile?.wallet_balance || 0).split('.')[1] || '00'}</span>
                                    </h2>
                                    <div className="flex flex-col mb-1 flex-shrink-0">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic leading-none">USDT</span>
                                        <TrendingUp size={12} className="text-green-500 mt-0.5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-2 w-full md:min-w-[400px]">
                                <div className="glass-card-strong p-4 flex flex-col items-center justify-center gap-1 border border-white/5 rounded-[24px] bg-white/5 hover:bg-white/10 transition-colors group/stat">
                                    <RefreshCw size={12} className="text-purple-400 mb-1 group-hover/stat:rotate-180 transition-transform duration-700" />
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-40">Profit</p>
                                    <p className="text-base font-black text-purple-400 tabular-nums italic truncate w-full text-center">+{format(profile?.profit || 0)}</p>
                                </div>
                                <div className="glass-card-strong p-4 flex flex-col items-center justify-center gap-1 border border-white/5 rounded-[24px] bg-white/5 hover:bg-white/10 transition-colors group/stat">
                                    <Users size={12} className="text-indigo-400 mb-1" />
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-40">Bonus</p>
                                    <p className="text-base font-black text-indigo-400 tabular-nums italic truncate w-full text-center">{format(profile?.referral_earned || 0)}</p>
                                </div>
                                <div className="glass-card-strong p-4 flex flex-col items-center justify-center gap-1 border border-white/5 rounded-[24px] bg-white/5 hover:bg-white/10 transition-colors group/stat">
                                    <Zap size={12} className="text-green-400 mb-1" />
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-40">Tasks</p>
                                    <p className="text-base font-black text-green-400 tabular-nums italic">{profile?.completed_count || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Hub: TWO MAIN CARDS */}
            <div className="grid grid-cols-2 gap-4">
                {/* Deposit Card */}
                <Link href="/app/deposit" className="group">
                    <div className="glass-card-strong p-6 relative overflow-hidden transition-all duration-700 hover:scale-[1.03] border border-white/10 h-full flex flex-col justify-between cursor-pointer rounded-[40px] shadow-2xl bg-zinc-900/60 backdrop-blur-xl group-hover:border-indigo-500/30">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-[20px]" />
                        
                        <div className="space-y-4 relative z-10">
                            <div className="w-12 h-12 rounded-[20px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <ArrowDownLeft size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight italic">Inject Funds</h3>
                                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest opacity-60">Recharge Node</p>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Withdrawal Card */}
                <Link href="/app/withdraw" className="group">
                    <div className="glass-card-strong p-6 relative overflow-hidden transition-all duration-700 hover:scale-[1.03] border border-white/10 h-full flex flex-col justify-between cursor-pointer rounded-[40px] shadow-2xl bg-zinc-900/60 backdrop-blur-xl group-hover:border-rose-500/30">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-[20px]" />
                        
                        <div className="space-y-4 relative z-10">
                            <div className="w-12 h-12 rounded-[20px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                                <ArrowUpRight size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight italic">Initiate Payout</h3>
                                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest opacity-60">Settlement</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Financial Hub Infrastructure */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
                    <h2 className="text-lg font-black italic tracking-tighter uppercase text-white/90">Infrastructure Hub</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/app/profile/wallet" className="flex items-center justify-between p-8 bg-zinc-900/40 border border-white/5 rounded-[32px] hover:bg-zinc-900/60 transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-cyan-400 transition-colors">
                                <CreditCard size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-white uppercase italic">Linked Wallet</h4>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Payout Destination</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${profile?.wallet_address ? 'text-green-500' : 'text-zinc-600'}`}>
                                {profile?.wallet_address ? 'Active' : 'Unbound'}
                            </span>
                            <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-colors" />
                        </div>
                    </Link>

                    <Link href="/app/record" className="flex items-center justify-between p-8 bg-zinc-900/40 border border-white/5 rounded-[32px] hover:bg-zinc-900/60 transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-amber-400 transition-colors">
                                <History size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-white uppercase italic">Payout History</h4>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Settlement Audit</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Archived</span>
                            <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-colors" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Quick Actions List (Records) */}
            <div className='bg-zinc-900/40 backdrop-blur-xl rounded-[40px] p-8 border border-white/5 flex gap-6 items-start'>
                <div className='w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-white/10'>
                    <TrendingUp className='text-indigo-400' size={24} />
                </div>
                <div className='space-y-1'>
                    <h4 className='text-[10px] font-black uppercase tracking-widest text-indigo-400 italic'>Market Settlement Node</h4>
                    <p className='text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed'>
                        Real-time commission processing is active. Maintain session integrity for optimized settlement sequences.
                    </p>
                </div>
            </div>
        </div>
    );
}
