'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    Search, 
    Zap, 
    Headset, 
    Loader2, 
    TrendingUp, 
    ChevronLeft, 
    AlertTriangle,
    PlusCircle,
    MinusCircle,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Activity as ActivityIcon
} from 'lucide-react';
import Portal from '@/components/Portal';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserTask, TaskItem, Transaction } from '@/lib/types';

type ActivityItem = 
    | { type: 'task'; data: UserTask & { task_item: TaskItem } }
    | { type: 'transaction'; data: Transaction };

function RecordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { profile, refreshProfile } = useAuth();
    const { format } = useCurrency();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'rejected'>(
        (searchParams.get('filter') as any) || 'all'
    );
    const [typeFilter, setTypeFilter] = useState<'all' | 'optimizations' | 'financials'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profitAdded, setProfitAdded] = useState<number | null>(null);
    const [showBundleSuccessToast, setShowBundleSuccessToast] = useState(false);
    const [submittingTaskId, setSubmittingTaskId] = useState<number | null>(null);

    const [whatsappLink, setWhatsappLink] = useState('https://wa.me/1234567890');

    useEffect(() => {
        const fetchSupport = async () => {
            const { data } = await supabase.from('site_settings').select('value').eq('key', 'whatsapp_link').single();
            if (data?.value) {
                const link = data.value.startsWith('http') 
                    ? data.value 
                    : `https://wa.me/${data.value.replace(/\+/g, '').replace(/\s/g, '')}`;
                setWhatsappLink(link);
            }
        };
        fetchSupport();
    }, []);

    const fetchActivity = async () => {
        if (!profile) return;
        setLoading(true);

        // Fetch Tasks
        const { data: tasksData } = await supabase
            .from('user_tasks')
            .select('id, status, created_at, completed_at, earned_amount, cost_amount, is_bundle, task_item_id, task_item:task_items(id, title, image_url, category)')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(100);

        // Fetch Transactions
        const { data: txsData } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(100);

        const combined: ActivityItem[] = [
            ...(tasksData || []).map(t => ({ type: 'task' as const, data: t as any })),
            ...(txsData || []).map(tx => ({ type: 'transaction' as const, data: tx as Transaction }))
        ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime());

        setActivities(combined);
        setLoading(false);
    };

    useEffect(() => {
        const f = searchParams.get('filter') as any;
        if (f && ['all', 'completed', 'pending', 'rejected'].includes(f)) {
            setFilter(f);
        }
        fetchActivity();
    }, [profile, searchParams]);

    const handleSubmitPending = async (task: UserTask) => {
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

            const earnedAmount = data?.earned_amount ? Number(data.earned_amount) : 0;

            if (earnedAmount > 0 && profile?.id) {
                await fetch('/api/tasks/referral-commission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: profile.id, earnedAmount })
                }).catch(e => console.warn('[Commission] Shadow error:', e));
            }

            if (data?.is_bundle) {
                setShowBundleSuccessToast(true);
            } else {
                setProfitAdded(data?.earned_amount || 0);
                setTimeout(() => setProfitAdded(null), 3000);
            }

            await Promise.all([
                refreshProfile(),
                fetchActivity()
            ]);
        } catch (err: any) {
            console.error("Submission error:", err);
            alert(err.message || "Failed to submit optimization.");
        } finally {
            setIsSubmitting(false);
            setSubmittingTaskId(null);
        }
    };

    const filteredActivities = activities.filter(act => {
        const item = act.data;
        const normalizedStatus = item.status === 'approved' || item.status === 'completed' ? 'completed' : 
                                item.status === 'rejected' || item.status === 'cancelled' ? 'rejected' : 
                                'pending';

        const matchesSearch = act.type === 'task' 
            ? (act.data.task_item?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || act.data.id.toString().includes(searchQuery)
            : act.data.type.toLowerCase().includes(searchQuery.toLowerCase()) || act.data.id.toString().includes(searchQuery);
        
        const matchesStatus = filter === 'all' || normalizedStatus === filter;
        
        const matchesType = typeFilter === 'all' || 
                           (typeFilter === 'optimizations' && act.type === 'task') || 
                           (typeFilter === 'financials' && act.type === 'transaction');

        const ts = new Date(item.created_at);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const isToday = ts >= startOfToday;
        const isYesterday = ts >= startOfYesterday && ts < startOfToday;

        const matchesDate = dateFilter === 'all' || 
                           (dateFilter === 'today' && isToday) || 
                           (dateFilter === 'yesterday' && isYesterday);

        return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    const statusBadge = (status: string) => {
        const isCompleted = status === 'completed' || status === 'approved';
        const isPending = status === 'pending';
        const isRejected = status === 'rejected' || status === 'cancelled';

        return (
            <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border transition-all duration-500 shadow-sm",
                    isCompleted && "bg-green-500/10 text-green-500 border-green-500/20",
                    isPending && "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
                    isRejected && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                )}
            >
                {isCompleted && <><CheckCircle size={10} /> {status === 'approved' ? 'CLEARED' : 'VERIFIED'}</>}
                {isPending && <><Clock size={10} className="animate-spin-slow" /> AUDIT_PENDING</>}
                {isRejected && <><XCircle size={10} /> REFUSED</>}
            </motion.span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10 animate-in fade-in duration-700 pb-60 relative">
            {/* TERMINAL HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Link href="/app" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                            <ChevronLeft size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <ActivityIcon size={20} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Activity Ledger</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3 opacity-60 flex items-center gap-2">
                             Full Protocol Trace • {loading ? 'SYNCING...' : `${filteredActivities.length} LOGS`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400" size={14} />
                        <input
                            type="text"
                            placeholder="Trace ID or Keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[11px] font-bold text-white focus:outline-none focus:border-indigo-500/50 w-full md:w-[280px] transition-all placeholder:text-slate-700 shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* INTEGRITY STATUS (Added from previous version) */}
            {(profile?.wallet_balance || 0) < 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-500/10 border border-rose-500/30 rounded-[40px] p-8 flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={120} />
                    </div>
                    <div className="flex items-center gap-8 relative z-10 text-center lg:text-left flex-col lg:flex-row">
                        <div className="w-20 h-20 rounded-[32px] bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0 shadow-inner border border-rose-500/20 animate-pulse">
                            <AlertTriangle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none">Protocol Deficit Detected</h4>
                            <p className="text-[11px] font-bold text-rose-400/80 uppercase tracking-widest max-w-md mx-auto lg:mx-0">
                                Settle current deficit to restore full node synchronization and finalize pending activations.
                            </p>
                        </div>
                    </div>
                    <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-10 py-5 bg-rose-500 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 whitespace-nowrap z-10"
                    >
                        <Headset size={18} /> Request Governance Support
                    </a>
                </motion.div>
            )}

            {/* ADVANCED FILTER MATRIX */}
            <div className="space-y-6">
                {/* 1. Category Tabs */}
                <div className="flex flex-wrap gap-4 border-b border-white/5 pb-2">
                    {[
                        { id: 'all', label: 'FULL_MATRIX', icon: <History size={12} /> },
                        { id: 'optimizations', label: 'OPTIMIZATIONS', icon: <Zap size={12} /> },
                        { id: 'financials', label: 'FINANCIALS', icon: <PlusCircle size={12} /> }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTypeFilter(t.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative overflow-hidden",
                                typeFilter === t.id ? "text-indigo-400" : "text-slate-500 hover:text-white"
                            )}
                        >
                            {t.icon} {t.label}
                            {typeFilter === t.id && (
                                <motion.div 
                                    layoutId="typeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,1)]" 
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* 2. Status Selectors */}
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-fit">
                        {(['all', 'completed', 'pending', 'rejected'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all",
                                    filter === s ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                                )}
                            >
                                {s.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* 3. Date Shifting */}
                    <div className="flex items-center gap-2 bg-slate-950/40 p-1 rounded-2xl border border-white/5 self-start">
                        {(['all', 'today', 'yesterday'] as const).map(df => (
                            <button
                                key={df}
                                onClick={() => setDateFilter(df)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    dateFilter === df ? "bg-white/10 text-white border border-white/10" : "text-slate-600 hover:text-slate-400"
                                )}
                            >
                                {df}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ACTIVITY CONSOLE */}
            <div className="glass-card-strong overflow-hidden border border-white/10 rounded-[48px] bg-slate-950/40 shadow-3xl">
                {/* HEADERS */}
                <div className="hidden md:grid grid-cols-5 bg-white/[0.03] border-b border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] text-center">
                    <span className="px-10 py-6 border-r border-white/5 text-left">TRACE_TIMESTAMP</span>
                    <span className="px-10 py-6 border-r border-white/5 text-left">NODE_ENTITY</span>
                    <span className="px-10 py-6 border-r border-white/5">INITIAL_QUANTUM</span>
                    <span className="px-10 py-6 border-r border-white/5">PROTOCOL_YIELD</span>
                    <span className="px-10 py-6 text-right">AUDIT_STATUS</span>
                </div>

                <div className="divide-y divide-white/[0.03]">
                    {loading ? (
                        <div className="flex items-center justify-center py-40">
                            <div className="relative">
                                <div className="w-20 h-20 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ActivityIcon size={24} className="text-indigo-500 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 text-center px-10">
                            <History size={64} className="text-slate-900 mb-8 opacity-40 animate-pulse" />
                            <p className="text-lg font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-40">CLEAN_LOG: NO TRACE FOUND</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {filteredActivities.map((act, idx) => {
                                const isTask = act.type === 'task';
                                const item = act.data;
                                const isDeposit = !isTask && (item as Transaction).type === 'deposit';
                                const isWithdrawal = !isTask && (item as Transaction).type === 'withdrawal';
                                const isCommission = !isTask && (item as Transaction).type === 'commission';
                                const isUnfreeze = !isTask && (item as Transaction).type === 'unfreeze';
                                const isFreeze = !isTask && (item as Transaction).type === 'freeze';
                                const isIncoming = isTask || isDeposit || isCommission || isUnfreeze;
                                
                                return (
                                    <motion.div 
                                        key={`${act.type}-${item.id}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={cn(
                                            "flex flex-col md:grid md:grid-cols-5 items-stretch hover:bg-white/[0.02] transition-all group relative",
                                            idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                                        )}
                                    >
                                        {/* 1. TIMESTAMP */}
                                        <div className="px-8 md:px-10 py-8 md:py-10 border-r md:border-white/5 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[14px] text-white font-black italic tracking-tight tabular-nums">
                                                    {new Date(isTask && item.status === 'completed' && item.completed_at ? item.completed_at : item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.25em] opacity-50 flex items-center gap-2">
                                                    <Clock size={10} />
                                                    {new Date(isTask && item.status === 'completed' && item.completed_at ? item.completed_at : item.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="md:hidden">
                                                {statusBadge(item.status || 'pending')}
                                            </div>
                                        </div>

                                        {/* 2. ENTITY */}
                                        <div className="px-8 md:px-10 py-8 md:py-10 border-r md:border-white/5 flex items-center gap-6">
                                            <div className={cn(
                                                "w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-2xl transition-all duration-700 group-hover:rotate-6 border",
                                                isTask && "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                                                isDeposit && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                                isWithdrawal && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                                                isCommission && "bg-teal-500/10 text-teal-400 border-teal-500/20",
                                                (isFreeze || isUnfreeze) && "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            )}>
                                                {isTask && <Zap size={24} fill="currentColor" className="opacity-80" />}
                                                {(isDeposit || isCommission || isUnfreeze) && <PlusCircle size={24} />}
                                                {(isWithdrawal || isFreeze) && <MinusCircle size={24} />}
                                            </div>
                                            <div className="space-y-1.5 min-w-0">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none opacity-50">
                                                    {isTask ? 'OPTIMIZATION_NODE' : isDeposit ? 'FUNDING_RECHARGE' : isCommission ? 'REFERRAL_YIELD' : isUnfreeze ? 'CAPITAL_RELEASE' : isFreeze ? 'PROTOCOL_LOCK' : 'PAYOUT_DISBURSEMENT'}
                                                </p>
                                                <h4 className="text-[13px] font-black text-white italic uppercase tracking-tight truncate leading-none">
                                                    {isTask ? ((item as any).task_item?.title || `NODE_TRK_${(item as any).task_item_id}`) : isDeposit ? 'RECHARGE_PROTOCOL' : isCommission ? 'TEAM_COMMISSION' : isUnfreeze ? 'CAPITAL_SETTLEMENT' : isFreeze ? 'CAPITAL_FREEZE' : 'ASSET_PAYOUT'}
                                                </h4>
                                                {isTask && (item as any).is_bundle && (
                                                    <div className="flex items-center gap-2 animate-pulse mt-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]" />
                                                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.3em]">LUCKY_BUNDLE</span>
                                                    </div>
                                                )}
                                                {!isTask && (
                                                    <p className="text-[9px] font-mono font-bold text-slate-500 uppercase truncate max-w-[150px] mt-1 opacity-50">
                                                        {(item as Transaction).description || `TRX_ID_${item.id}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. QUANTUM (INITIAL) */}
                                        <div className="px-8 md:px-10 py-8 md:py-10 border-r md:border-white/5 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center border-t md:border-t-0 border-white/5 text-center md:text-left">
                                            <div className="space-y-2">
                                                <span className="text-[9px] text-slate-700 uppercase tracking-[0.3em] font-black block opacity-50">BASE_INIT</span>
                                                <div className="flex items-baseline gap-1 justify-center md:justify-start">
                                                    <span className="text-[11px] text-slate-500 font-bold">$</span>
                                                    <span className="text-lg font-black text-white tabular-nums italic leading-none">
                                                        {format(isTask ? ((item as any).cost_amount || 0) : 0).split('.')[0]}
                                                        <span className="text-[11px] opacity-30">.{format(isTask ? ((item as any).cost_amount || 0) : 0).split('.')[1] || '00'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4. YIELD (GAIN/LOSS) */}
                                        <div className="px-8 md:px-10 py-8 md:py-10 border-r md:border-white/5 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center border-t md:border-t-0 border-white/5 text-center md:text-left">
                                            <div className="space-y-2 w-full">
                                                <span className="text-[9px] text-zinc-700 uppercase tracking-[0.3em] font-black block opacity-50">PROTOCOL_YIELD</span>
                                                <div className="flex items-center justify-center md:justify-start gap-4">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                                                        isIncoming ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                    )}>
                                                        {isIncoming ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                                    </div>
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className={cn(
                                                            "text-2xl font-black tabular-nums italic tracking-tighter leading-none p-1 rounded-xl",
                                                            isIncoming ? "text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                                        )}>
                                                            {isIncoming ? '+' : '-'}{format((item as any).amount || (item as any).earned_amount || 0).split('.')[0]}
                                                            <span className="text-sm opacity-40">.{format((item as any).amount || (item as any).earned_amount || 0).split('.')[1] || '00'}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. AUDIT ACTION */}
                                        <div className="px-8 md:px-10 py-8 flex flex-col items-center md:items-end justify-center min-w-[200px] border-t md:border-t-0 border-white/5 gap-4">
                                            <div className="hidden md:block">
                                                {statusBadge((item as any).status || 'pending')}
                                            </div>
                                            
                                            {isTask && (item as any).status === 'pending' && (
                                                (profile?.wallet_balance || 0) < 0 ? (
                                                    <div className="flex flex-col gap-3 w-full max-w-[180px]">
                                                        <div className="bg-rose-500/5 border border-rose-500/10 rounded-[20px] p-3 text-center backdrop-blur-md">
                                                            <span className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest block mb-1">Deficit Detection</span>
                                                            <span className="text-[13px] font-black text-rose-500 tabular-nums italic">-{format(Math.abs(profile?.wallet_balance || 0))}</span>
                                                        </div>
                                                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
                                                            <button className="w-full px-5 py-4 rounded-[18px] bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2">
                                                                <Headset size={14} /> SUPPORT
                                                            </button>
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSubmitPending(item)}
                                                        disabled={isSubmitting}
                                                        className={cn(
                                                            "px-8 py-4 rounded-[20px] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-900 group/btn overflow-hidden relative",
                                                            isSubmitting && submittingTaskId === item.id ? "opacity-50 cursor-wait" : "hover:scale-[1.03] active:scale-95 hover:bg-indigo-500"
                                                        )}
                                                    >
                                                        {isSubmitting && submittingTaskId === item.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle size={16} className="transition-transform group-hover/btn:scale-110" />
                                                        )}
                                                        {isSubmitting && submittingTaskId === item.id ? 'VERIFYING...' : 'FINALIZE NODE'}
                                                    </button>
                                                )
                                            )}

                                            {!isTask && item.status === 'pending' && (
                                                <div className="bg-blue-500/5 border border-blue-500/10 rounded-[20px] px-6 py-4 flex items-center gap-3">
                                                    <Clock size={16} className="text-blue-500 animate-spin-slow" />
                                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Protocol Audit</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* TOASTS & OVERLAYS */}
            <Portal>
                <AnimatePresence>
                    {profitAdded !== null && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: -50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -50 }}
                            className="fixed top-28 left-1/2 -track-x-1/2 z-[20000] -translate-x-1/2"
                        >
                            <div className="glass-card-strong px-10 py-6 rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.9)] border border-emerald-500/30 flex items-center gap-6 bg-slate-950/95 backdrop-blur-2xl">
                                <div className="w-16 h-16 rounded-[24px] bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                                    <TrendingUp size={32} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Protocol Yield Generated</span>
                                    <span className="text-3xl font-black text-emerald-500 tabular-nums italic tracking-tighter leading-none">
                                        +{format(profitAdded)} <span className="text-sm opacity-50 font-black tracking-normal ml-1">USDT</span>
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showBundleSuccessToast && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
                        >
                            <motion.div 
                                initial={{ scale: 0.7, rotate: -5 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0.7, rotate: 5 }}
                                className="glass-card-strong bg-slate-950 border-2 border-indigo-500/40 p-16 rounded-[64px] shadow-[0_60px_200px_rgba(99,102,241,0.2)] text-center space-y-10 max-w-sm relative overflow-hidden group"
                            >
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                                <div className="w-28 h-28 rounded-[40px] bg-indigo-500/10 flex items-center justify-center mx-auto shadow-2xl border border-indigo-500/10 relative">
                                    <Zap className="text-indigo-400 animate-pulse" size={56} fill="currentColor" />
                                    <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase underline decoration-indigo-500 decoration-4 underline-offset-12 leading-none">Quantum Lock!</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed opacity-80 pt-4">
                                         Elite bundle sequence synchronized. Premium yield has been credited to your node capital desk.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowBundleSuccessToast(false)}
                                    className="w-full py-6 rounded-[28px] bg-white text-black font-black uppercase tracking-[0.4em] text-[12px] shadow-3xl hover:scale-[1.05] active:scale-95 transition-all button-shine"
                                >
                                    CONTINUE PROTOCOL
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Portal>
        </div>
    );
}

export default function RecordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-40">
                <div className="w-14 h-14 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        }>
            <RecordContent />
        </Suspense>
    );
}

