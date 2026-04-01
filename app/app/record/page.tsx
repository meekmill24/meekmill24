'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Clock, CheckCircle, XCircle, Search, Filter, Zap, Headset, Loader2, TrendingUp, ChevronLeft, HelpCircle, AlertTriangle } from 'lucide-react';
import Portal from '@/components/Portal';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { UserTask, TaskItem } from '@/lib/types';

function RecordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { profile, refreshProfile } = useAuth();
    const { format } = useCurrency();
    const [tasks, setTasks] = useState<(UserTask & { task_item: TaskItem })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>(
        (searchParams.get('filter') as any) || 'all'
    );
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profitAdded, setProfitAdded] = useState<number | null>(null);
    const [showBundleSuccessToast, setShowBundleSuccessToast] = useState(false);
    const [submittingTaskId, setSubmittingTaskId] = useState<number | null>(null);

    const [whatsappLink, setWhatsappLink] = useState('https://wa.me/your_number');

    useEffect(() => {
        const fetchSupport = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'whatsapp_link').single();
            if (data?.value) setWhatsappLink(data.value);
        };
        fetchSupport();
    }, []);

    const fetchTasks = async () => {
        if (!profile) return;
        setLoading(true);
        const { data } = await supabase
            .from('user_tasks')
            .select('id, status, created_at, completed_at, earned_amount, cost_amount, is_bundle, task_item_id, task_item:task_items(id, title, image_url, category)')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(100);

        if (data) {
            setTasks(data as any);
        }
        setLoading(false);
    };

    useEffect(() => {
        const f = searchParams.get('filter') as any;
        if (f && ['all', 'completed', 'pending'].includes(f)) {
            setFilter(f);
        }
        fetchTasks();
    }, [profile, searchParams]);

    const handleSubmitPending = async (task: UserTask & { task_item: TaskItem }) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmittingTaskId(task.id);

        try {
            const { data, error } = await supabase.rpc('complete_user_task', {
                p_task_item_id: Number(task.task_item_id),
                p_cost_amount: Number(task.cost_amount || 0),
                p_is_bundle: Boolean(task.is_bundle)
            });

            if (error) throw error;

            if (data?.is_bundle) {
                setShowBundleSuccessToast(true);
            } else {
                setProfitAdded(data?.earned_amount || 0);
                setTimeout(() => setProfitAdded(null), 3000);
            }

            await Promise.all([
                refreshProfile(),
                fetchTasks()
            ]);
        } catch (err: any) {
            console.error("Submission error:", err);
            alert(err.message || "Failed to submit optimization.");
        } finally {
            setIsSubmitting(false);
            setSubmittingTaskId(null);
        }
    };

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = (t.task_item?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toString().includes(searchQuery);
        const matchesStatus = filter === 'all' || t.status === filter;

        const ts = new Date(t.created_at);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 2); // 2 days for margin

        const isToday = ts >= startOfToday;
        const isYesterday = ts >= startOfYesterday && ts < startOfToday;

        const matchesDate = dateFilter === 'all' || 
                           (dateFilter === 'today' && isToday) || 
                           (dateFilter === 'yesterday' && isYesterday);

        return matchesSearch && matchesStatus && matchesDate;
    });

    const statusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20 tracking-wider">
                        <CheckCircle size={10} /> VERIFIED
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30 tracking-widest animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Clock size={10} className="animate-spin-slow" /> PENDING
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20 tracking-wider">
                        <XCircle size={10} /> REJECTED
                    </span>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-500 pb-60">
            {/* Stats Header (Added for Simple Money Parity) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card-strong p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-60">Total Node Capital</p>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-black text-white italic tabular-nums">
                            {format(tasks.reduce((acc, t) => acc + Number(t.cost_amount || 0), 0)).split('.')[0]}
                            <span className="text-xs opacity-40">.{format(tasks.reduce((acc, t) => acc + Number(t.cost_amount || 0), 0)).split('.')[1] || '00'}</span>
                        </span>
                    </div>
                </div>
                <div className="glass-card-strong p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-60">Total System Yield</p>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-black text-green-500 italic tabular-nums">
                            {format(tasks.reduce((acc, t) => acc + Number(t.earned_amount || 0), 0)).split('.')[0]}
                            <span className="text-xs opacity-40">.{format(tasks.reduce((acc, t) => acc + Number(t.earned_amount || 0), 0)).split('.')[1] || '00'}</span>
                        </span>
                    </div>
                </div>
                <div className="glass-card-strong p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-60">Optimized Nodes</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-indigo-400 italic">
                            {tasks.filter(t => t.status === 'completed').length}
                        </span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase ml-1">UNITS</span>
                    </div>
                </div>
                <div className="glass-card-strong p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-60">Node Integrity Status</p>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            (profile?.wallet_balance || 0) < 0 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        )} />
                        <span className={cn(
                            "text-sm font-black uppercase tracking-widest italic",
                            (profile?.wallet_balance || 0) < 0 ? "text-rose-500" : "text-cyan-500"
                        )}>
                            {(profile?.wallet_balance || 0) < 0 ? "OFFLINE: DEFICIT" : "ONLINE: SECURE"}
                        </span>
                    </div>
                </div>
            </div>

            {/* DEFICIT WARNING BANNER */}
            {(profile?.wallet_balance || 0) < 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                            <AlertTriangle size={32} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-white italic uppercase tracking-tight leading-none">Account Deficit Detected</h4>
                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest opacity-80">
                                Settle negative balance to synchronize remaining sequence activations.
                            </p>
                        </div>
                    </div>
                    <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Headset size={16} /> Contact Support
                    </a>
                </div>
            )}

            {/* Header / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-4">
                    <Link href="/app" className="p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <ChevronLeft size={20} className="text-slate-400" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Activity Ledger</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">{filteredTasks.length} logs found</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Trace ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 w-full md:w-[240px] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-2 gap-4">
                <div className="flex relative overflow-x-auto">
                    {(['all', 'completed', 'pending'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${filter === f ? 'text-indigo-400' : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {f === 'all' ? 'FULL LOG' : f.toUpperCase()}
                            {filter === f && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 self-start md:self-center">
                    {(['all', 'today', 'yesterday'] as const).map(df => (
                        <button
                            key={df}
                            onClick={() => setDateFilter(df)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                                dateFilter === df ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'
                            }`}
                        >
                            {df.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="glass-card-strong overflow-hidden border border-white/5 rounded-[40px] bg-slate-950/40">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-5 bg-white/[0.03] border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    <span className="px-10 py-5 border-r border-white/5">TIMESTAMP</span>
                    <span className="px-10 py-5 border-r border-white/5">SYSTEM NODE</span>
                    <span className="px-10 py-5 border-r border-white/5">NODE VALUE</span>
                    <span className="px-10 py-5 border-r border-white/5">YIELD</span>
                    <span className="px-10 py-5 text-right flex justify-end">STATUS</span>
                </div>

                <div className="divide-y divide-white/[0.03]">
                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_50px_rgba(99,102,241,0.2)]" />
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                            <Clock size={48} className="text-slate-800 mb-6" />
                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest italic opacity-60 italic">NO ACTIVITY LOGS RECORDED</p>
                        </div>
                    ) : (
                        filteredTasks.map((task, idx) => (
                            <div key={task.id} className={`flex flex-col md:grid md:grid-cols-5 items-stretch hover:bg-white/[0.02] transition-all group border-b border-white/[0.02] last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}>
                                {/* Time */}
                                <div className="px-8 md:px-10 py-6 md:py-8 border-r md:border-white/5 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-3">
                                    <div className="flex flex-col">
                                        <p className="text-[12px] text-white font-black italic tabular-nums">
                                            {new Date(task.status === 'completed' && task.completed_at ? task.completed_at : task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
                                            {new Date(task.status === 'completed' && task.completed_at ? task.completed_at : task.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="md:hidden">
                                        {statusBadge(task.status)}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex flex-col px-8 md:px-10 py-6 md:py-8 border-r md:border-white/5 justify-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg">
                                            <Zap size={22} fill="currentColor" className="opacity-80" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13px] font-black text-white uppercase tracking-tight truncate italic">
                                                {task.task_item?.title || `NODE_TRK_${task.task_item_id}`}
                                            </span>
                                            {task.is_bundle && (
                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2 animate-pulse">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                                                    LUCKY BUNDLE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Capital */}
                                <div className="px-8 md:px-10 py-6 md:py-8 border-r md:border-white/5 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center border-t md:border-t-0 border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-black mb-1 opacity-50">NODE_CAP</span>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className={cn(
                                                "text-sm font-black tabular-nums italic",
                                                (task.cost_amount || 0) < 0 ? "text-rose-500" : "text-white"
                                            )}>
                                                {format(task.cost_amount || 0).split('.')[0]}
                                                <span className="text-[10px] opacity-40">.{format(task.cost_amount || 0).split('.')[1] || '00'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Profit */}
                                <div className="px-8 md:px-10 py-6 md:py-8 border-r md:border-white/5 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center border-t md:border-t-0 border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-black mb-1 opacity-50">YIELD</span>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className={cn(
                                                "text-xl font-black tabular-nums italic drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]",
                                                (task.earned_amount || 0) < 0 ? "text-rose-500" : "text-green-500"
                                            )}>
                                                {task.earned_amount >= 0 ? '+' : ''}{format(task.earned_amount).split('.')[0]}
                                                <span className="text-xs opacity-40">.{format(task.earned_amount).split('.')[1] || '00'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Action Hub */}
                                <div className="px-8 md:px-10 py-5 flex flex-col items-center md:items-end justify-center gap-2 border-t md:border-t-0 border-white/5 min-w-[200px]">
                                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                                        <div className="flex justify-center md:justify-end w-full">
                                            {statusBadge(task.status)}
                                        </div>
                                        
                                        {task.status === 'pending' && (
                                            (profile?.wallet_balance || 0) < 0 ? (
                                                <div className="flex flex-col gap-2 w-full max-w-[160px]">
                                                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 text-center">
                                                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block opacity-70">Deficit Detection</span>
                                                        <span className="text-[11px] font-black text-rose-400 tabular-nums italic">-{format(Math.abs(profile?.wallet_balance || 0))}</span>
                                                    </div>
                                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
                                                        <button 
                                                            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 whitespace-nowrap border-b-2 border-rose-800"
                                                        >
                                                            <Headset size={14} className="opacity-80" />
                                                            CONTACT SUPPORT
                                                        </button>
                                                    </a>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSubmitPending(task)}
                                                    disabled={isSubmitting}
                                                    className={`px-6 py-3 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2
                                                        ${isSubmitting && submittingTaskId === task.id ? 'opacity-50 cursor-wait' : 'hover:scale-[1.03] active:scale-95 cursor-pointer'}
                                                        whitespace-nowrap w-[150px] border-b-4 border-indigo-700
                                                    `}
                                                >
                                                    {isSubmitting && submittingTaskId === task.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle size={14} fill="currentColor" />
                                                    )}
                                                    {isSubmitting && submittingTaskId === task.id ? 'PROCESSING...' : 'SUBMIT ORDER'}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Toasts */}
            <Portal>
                {profitAdded !== null && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[20000] animate-in slide-in-from-top duration-500">
                        <div className="glass-card-strong px-8 py-5 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] border border-green-500/30 flex items-center gap-5 bg-slate-900/95">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <TrendingUp size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Protocol Yield Applied</span>
                                <span className="text-xl font-black text-green-500 tabular-nums italic">+{format(profitAdded)} USDT</span>
                            </div>
                        </div>
                    </div>
                )}

                {showBundleSuccessToast && (
                    <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                        <div className="glass-card-strong bg-slate-950 border border-indigo-500/30 p-12 rounded-[48px] shadow-[0_50px_150px_rgba(0,0,0,1)] text-center space-y-8 max-w-sm animate-in zoom-in duration-300">
                            <div className="w-24 h-24 rounded-[32px] bg-indigo-500/10 flex items-center justify-center mx-auto shadow-inner border border-indigo-500/10">
                                <Zap className="text-indigo-400 animate-pulse" size={48} fill="currentColor" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase underline decoration-indigo-500 underline-offset-8">Critical Hit!</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed opacity-80">
                                     institutional node sequence finalized. Premium commission credit synchronized to your corporate wallet.
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowBundleSuccessToast(false)}
                                className="w-full py-5 rounded-[28px] bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:scale-[1.03] transition-transform"
                            >
                                CONTINUE LOG
                            </button>
                        </div>
                    </div>
                )}
            </Portal>
        </div>
    );
}

export default function RecordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        }>
            <RecordContent />
        </Suspense>
    );
}
