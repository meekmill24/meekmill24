'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from 'sonner';
import type { TaskItem } from '@/lib/types';
import ItemDetailModal from '@/components/ItemDetailModal';
import BundledPackageModal from '@/components/BundledPackageModal';
import type { BundlePackage } from '@/components/BundledPackageModal';
import Portal from '@/components/Portal';
import {
    Wallet,
    AlertTriangle,
    Zap,
    CheckCircle,
    X,
    Activity,
    TrendingUp,
    Sparkles,
    Trophy,
    Star,
    RefreshCcw,
    ShieldCheck,
    Loader2,
    Lock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function TasksPage() {
    const { profile, refreshProfile } = useAuth();
    const { t, language } = useLanguage();
    const { format } = useCurrency();
    const router = useRouter();
    const [items, setItems] = useState<TaskItem[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<TaskItem | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [recentlyUsedIdsState, setRecentlyUsedIdsState] = useState<Set<number>>(new Set());
    const [matchingStatus, setMatchingStatus] = useState<string>("READY TO MATCH");
    const [bundleModal, setBundleModal] = useState(false);
    const [activeBundle, setActiveBundle] = useState<BundlePackage | null>(null);
    const [pendingTaskItem, setPendingTaskItem] = useState<TaskItem | null>(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalSeen, setModalSeen] = useState(false);
    const [showMinBalanceModal, setShowMinBalanceModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasRecordPending, setHasRecordPending] = useState(false);

    const [tasksPerSet, setTasksPerSet] = useState(40);
    const [setsPerDay, setSetsPerDay] = useState(3);
    const [commissionRate, setCommissionRate] = useState(0.005);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const completedCount = profile?.completed_count || 0;
    const currentSet = profile?.current_set || 1;
    const isLocked = completedCount >= (tasksPerSet * currentSet) && completedCount > 0;
    const isAllSetsDone = currentSet >= setsPerDay && isLocked;
    const hasActiveRecordPending = hasRecordPending;

    const progressInSet = Math.max(0, completedCount - (tasksPerSet * (currentSet - 1)));
    const completedCountInSet = Math.min(tasksPerSet, progressInSet + (hasActiveRecordPending ? 1 : 0));
    const totalTasks = tasksPerSet;

    const fetchTasks = useCallback(async () => {
        if (!profile?.level_id || !profile?.id) return;
        setIsLoadingData(true);
        try {
            const [pastTasksRes, itemsRes] = await Promise.all([
                supabase.from('user_tasks').select('task_item_id, status, completed_at').eq('user_id', profile.id).neq('status', 'cancelled'),
                supabase.from('task_items').select('*').eq('is_active', true).limit(1000)
            ]);

            const tasksFromDb = (pastTasksRes.data || []) as any[];
            setHasRecordPending(tasksFromDb.some(t => t.status === 'pending'));

            if (profile?.level) {
                setTasksPerSet(profile.tasks_per_set_override || profile.level.tasks_per_set || 40);
                setSetsPerDay(profile.sets_per_day_override || profile.level.sets_per_day || 3);
                setCommissionRate(profile.level.commission_rate || 0.005);
            }

            const lastResetDate = profile.last_reset_at ? new Date(profile.last_reset_at) : new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentIds = new Set(tasksFromDb.filter(t => t.completed_at && new Date(t.completed_at) > lastResetDate).map(t => t.task_item_id));
            setRecentlyUsedIdsState(recentIds);

            const allItemsFromDb = itemsRes.data || [];
            const levelItems = allItemsFromDb.filter(i => Number(i.level_id) === Number(profile.level_id));
            const poolItems = levelItems.length > 0 ? levelItems : allItemsFromDb;

            const poolByUnique = new Map();
            poolItems.forEach(item => {
                if (!poolByUnique.has(item.image_url) && !recentIds.has(item.id)) poolByUnique.set(item.image_url, item);
            });

            let availableItems = Array.from(poolByUnique.values());
            if (availableItems.length < 24) availableItems = poolItems;
            if (availableItems.length === 0) availableItems = allItemsFromDb;

            setItems([...availableItems].sort(() => 0.5 - Math.random()).slice(0, 24));
            (window as any)._allPoolItems = itemsRes.data;
            setMatchingStatus("READY TO MATCH");
        } catch (err) {
            console.error("Error loading task data:", err);
        } finally {
            setIsLoadingData(false);
        }
    }, [profile?.level_id, profile?.id, profile?.level]);

    useEffect(() => { window.scrollTo(0, 0); fetchTasks(); }, [fetchTasks]);

    useEffect(() => {
        let spinInterval: NodeJS.Timeout;
        if (isSpinning) {
            spinInterval = setInterval(() => {
                setHighlightedIndex(prev => {
                    const next = Math.floor(Math.random() * items.length);
                    return next === prev && items.length > 1 ? (next + 1) % items.length : next;
                });
            }, 40);
        } else if (!selectedItem) setHighlightedIndex(null);
        return () => clearInterval(spinInterval);
    }, [isSpinning, items.length, selectedItem]);

    useEffect(() => {
        if (showCompletionModal) {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ particleCount, origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 }, spread: 360, ticks: 60, zIndex: 20000 });
                confetti({ particleCount, origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 }, spread: 360, ticks: 60, zIndex: 20000 });
            }, 250);
        }
    }, [showCompletionModal]);

    const handleTaskSelection = useCallback(async (item: TaskItem, pb?: any, currentItemIndex?: number) => {
        if (!profile || isLocked) return;
        let bundle = pb;
        if (!bundle) {
            const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
            bundle = (freshProfile as any)?.pending_bundle;
        }

        if (bundle && Number(bundle.targetIndex) === currentItemIndex) {
            setPendingTaskItem(item);
            setActiveBundle({
                id: String(bundle.id || `bn-${Date.now()}`),
                name: String(bundle.name || 'Special Bundle Package'),
                description: String(bundle.description || ''),
                shortageAmount: Number(bundle.shortageAmount || 0),
                totalAmount: Number(bundle.totalAmount || 0),
                bonusAmount: Number(bundle.bonusAmount || 0),
                expiresIn: Number(bundle.expiresIn || 86400),
                taskItem: { title: item.title, image_url: item.image_url, category: item.category ?? '' },
                taskItems: bundle.taskItems || [{ title: item.title, image_url: item.image_url, category: item.category ?? '' }]
            });
            setBundleModal(true);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#F59E0B', '#FFFFFF', '#3B82F6'] });
        } else {
            setSelectedItem(item);
            setModalOpen(true);
        }
    }, [isLocked, profile]);

    const handleStart = useCallback(async () => {
        if (isSpinning || items.length === 0) return;
        const walletBalance = profile?.wallet_balance || 0;

        if (walletBalance < 0) {
            toast.error("Account in deficit. Please settle your balance through the recharge portal.", { duration: 5000 });
            router.push('/app/record?filter=pending');
            return;
        }

        if (hasActiveRecordPending) {
            const { data: pendingTask } = await supabase.from('user_tasks').select('status').eq('user_id', profile?.id).eq('status', 'pending').limit(1);
            if (pendingTask?.length) {
                toast.error("Please complete your pending allocation in the Record page first.");
                router.push('/app/record?filter=pending');
                return;
            }
        }

        const minBalance = profile?.level?.price || 65;
        if (walletBalance < minBalance) { setShowMinBalanceModal(true); return; }

        if (isLocked) {
            setMatchingStatus(isAllSetsDone ? "DAILY THRESHOLD REACHED" : `SEQUENCE ${currentSet} CONCLUDED. CONTACT SUPPORT.`);
            if (!modalSeen) setShowCompletionModal(true);
            return;
        }

        setIsSpinning(true);
        setSelectedItem(null);
        setMatchingStatus("INITIATING NEURAL LINK...");

        const profilePromise = supabase.from('profiles').select('*, levels(*)').eq('id', profile?.id).single();
        const stages = ["ANALYZING MARKET VECTORS...", "IDENTIFYING OPTIMAL MATCH...", "STABILIZING DATA NODE...", "FINALIZING ALLOCATION..."];
        let count = 0;
        const stageInterval = setInterval(() => {
            const statusIdx = Math.floor(count / 3);
            if (stages[statusIdx]) setMatchingStatus(stages[statusIdx]);
            setHighlightedIndex(Math.floor(Math.random() * items.length));
            count++;
            if (count >= 12) clearInterval(stageInterval);
        }, 50);

        setTimeout(async () => {
            clearInterval(stageInterval);
            const freshData = await profilePromise;
            const pb = (freshData.data as any)?.pending_bundle;
            const currentInSet = ((profile?.completed_count || 0) % (tasksPerSet || 40)) + 1;
            const currentAbsolute = (profile?.completed_count || 0) + 1;
            let finalIndex = Math.floor(Math.random() * items.length);
            let matchedItem = { ...items[finalIndex] };
            const isHit = pb && (Number(pb.targetIndex) === currentInSet || Number(pb.targetIndex) === currentAbsolute);

            if (isHit && pb.taskItem) {
                matchedItem = {
                    id: Number(pb.taskItemIds?.[0] || 0), title: pb.taskItem.title, image_url: pb.taskItem.image_url,
                    category: pb.taskItem.category, description: pb.taskItem.description || '',
                    is_active: true, created_at: new Date().toISOString(), level_id: Number(profile?.level_id || 1)
                } as TaskItem;
                const newItems = [...items]; newItems[finalIndex] = matchedItem; setItems(newItems);
            }

            setHighlightedIndex(finalIndex);
            setIsSpinning(false);
            setMatchingStatus("MATCH SECURED");
            setTimeout(() => handleTaskSelection(matchedItem, isHit ? pb : null, isHit ? currentInSet : currentAbsolute), 200);
        }, 850);
    }, [isSpinning, items, isLocked, profile, currentSet, isAllSetsDone, modalSeen, tasksPerSet, hasActiveRecordPending, handleTaskSelection]);

    const handleSubmitTask = async (item: TaskItem, costAmount?: number) => {
        if (isSubmitting || !profile) return;
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.rpc('complete_user_task', {
                p_task_item_id: Number(item.id),
                p_cost_amount: costAmount ? Number(costAmount) : 0,
                p_is_bundle: Boolean(costAmount && profile?.pending_bundle)
            });
            if (error) throw error;
            toast.success(`Succesfully optimized. Profit: ${format(data?.earned_amount || 0)}`);
            setModalOpen(false); setSelectedItem(null);
            setIsRefreshing(true);
            setTimeout(() => {
                const pool = (window as any)._allPoolItems || [];
                const updatedRecent = new Set(recentlyUsedIdsState); updatedRecent.add(item.id); setRecentlyUsedIdsState(updatedRecent);
                let freshPool = pool.filter((p: any) => !updatedRecent.has(p.id));
                if (freshPool.length < 24) freshPool = pool;
                setItems([...freshPool].sort(() => 0.5 - Math.random()).slice(0, 24));
                setIsRefreshing(false); setMatchingStatus("READY TO MATCH");
            }, 800);
            if (completedCountInSet + 1 >= tasksPerSet) { setModalSeen(false); setTimeout(() => setShowCompletionModal(true), 1500); }
            await refreshProfile();
        } catch (err: any) { toast.error(err?.message || 'Verification Error'); }
        finally { setIsSubmitting(false); }
    };

    const handleBundleAccept = async (bundle: BundlePackage) => {
        if (!profile) return;
        try {
            let itemToRecord = pendingTaskItem;
            if (!itemToRecord && bundle.taskItem) {
                const { data: dbItems } = await supabase.from('task_items').select('*').eq('title', bundle.taskItem.title).limit(1);
                itemToRecord = dbItems?.[0] || null;
            }
            if (!itemToRecord) {
                const { data: fallbacks } = await supabase.from('task_items').select('*').eq('level_id', profile.level_id).eq('is_active', true).limit(1);
                itemToRecord = fallbacks?.[0] || null;
            }
            if (!itemToRecord) throw new Error("Matrix node verification failed.");

            const { error: insertErr } = await supabase.from('user_tasks').insert({
                user_id: profile.id, task_item_id: itemToRecord.id, status: 'pending',
                earned_amount: bundle.bonusAmount, cost_amount: bundle.totalAmount, is_bundle: true,
                created_at: new Date().toISOString()
            });
            if (insertErr) throw insertErr;

            const res = await fetch('/api/admin/assign-bundle', {
                method: 'DELETE', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: profile.id, deductAmount: bundle.totalAmount, freezeAmount: bundle.totalAmount + bundle.bonusAmount })
            });

            if (!res.ok) throw new Error("Failed to synchronize node allocation.");
            toast.success("Allocation secured. Settle node deficit in records.");
            setBundleModal(false); router.push('/app/record?filter=pending'); await refreshProfile();
        } catch (err: any) { toast.error(err.message || "Sequence Interrupt"); }
    };

    return (
        <main className="min-h-screen bg-black text-white p-6 pb-24 font-inter selection:bg-cyan-500/30">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8 px-2">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                                <Zap className="text-cyan-400 animate-pulse" size={20} fill="currentColor" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white drop-shadow-sm">Strategic Node Optimization</h1>
                        </div>
                        <p className="text-[11px] font-black tracking-[0.4em] text-zinc-500 uppercase flex items-center gap-3">
                            <Activity size={14} className="text-cyan-500" />
                            Real-time AI Market Matching protocol active
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-card-strong px-8 py-5 rounded-[32px] border border-white/5 flex flex-col justify-center min-w-[200px] shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full -mr-8 -mt-8 blur-3xl" />
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 opacity-70">Task Progress</span>
                            <div className="flex items-baseline gap-2">
                                <span className={cn("text-3xl font-black italic tabular-nums leading-none", isLocked ? "text-cyan-500" : "text-white")}>
                                    {completedCountInSet}
                                </span>
                                <span className="text-zinc-500 font-bold text-sm">/ {tasksPerSet}</span>
                            </div>
                            <div className="mt-4 w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-white transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                    style={{ width: `${(completedCountInSet / tasksPerSet) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div className={cn(
                        "grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 md:gap-5 p-4 rounded-[48px] bg-zinc-900/30 border border-white/5 backdrop-blur-3xl transition-all duration-700 relative z-10",
                        isRefreshing && "opacity-40 scale-95 blur-sm"
                    )}>
                        {items.map((item, idx) => {
                            const isHighlighted = highlightedIndex === idx;
                            return (
                                <div key={idx} className={cn(
                                    "aspect-square rounded-[36px] bg-zinc-900/50 border border-white/5 overflow-hidden transition-all duration-300 relative group/item",
                                    isHighlighted ? "scale-105 border-cyan-500 ring-4 ring-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.3)] z-20" : "hover:border-white/10"
                                )}>
                                    <Image src={item.image_url} alt={item.title} fill className={cn("object-cover opacity-60 grayscale transition-all duration-700", isHighlighted && "opacity-100 grayscale-0 scale-110 rotate-1")} />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                        <p className="text-[8px] font-black text-white/50 uppercase tracking-tighter truncate opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            {item.title}
                                        </p>
                                    </div>
                                    {isHighlighted && (
                                        <div className="absolute inset-0 bg-cyan-500/10 flex items-center justify-center animate-pulse">
                                            <ShieldCheck size={28} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-8 relative z-20">
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={handleStart}
                                disabled={isSpinning || isRefreshing}
                                className={cn(
                                    "relative group cursor-pointer active:scale-95 transition-all duration-500",
                                    isSpinning && "cursor-wait"
                                )}
                            >
                                <div className="absolute -inset-6 bg-cyan-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
                                <div className={cn(
                                    "w-32 h-32 rounded-full bg-black border-4 flex items-center justify-center shadow-2xl relative z-10 transition-all duration-500 overflow-hidden",
                                    isSpinning ? "border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.4)]" : "border-white/10 hover:border-white/30"
                                )}>
                                    {isSpinning ? (
                                        <div className="flex flex-col items-center animate-in fade-in zoom-in">
                                            <Loader2 size={32} className="text-cyan-400 animate-spin mb-1" />
                                            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest leading-none">Scanning</span>
                                        </div>
                                    ) : (
                                        <Play size={40} className="text-white fill-white transition-all group-hover:scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                            <span className={cn("text-[11px] font-black tracking-[0.4em] uppercase transition-all duration-500", isSpinning ? "text-cyan-500 animate-pulse" : "text-zinc-500")}>
                                {matchingStatus}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 bg-zinc-900/40 backdrop-blur-xl rounded-[40px] p-8 border border-white/5 flex gap-6 items-start max-w-2xl mx-auto border-b-4 border-zinc-800">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                        <Activity className="text-cyan-400" size={24} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 italic">Neural Protocol Maintenance</h4>
                        <p className="text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest leading-relaxed">
                            Market nodes operating in High-Fidelity. Total Session Integrity: 99.9%. Network Latency: 4ms.
                        </p>
                    </div>
                </div>
            </div>

            <ItemDetailModal
                isOpen={modalOpen && !!selectedItem}
                onClose={() => { setModalOpen(false); setSelectedItem(null); setMatchingStatus("READY TO MATCH"); }}
                item={selectedItem} balance={profile?.wallet_balance || 0} commissionRate={commissionRate}
                format={format} isSubmitting={isSubmitting} onSubmit={handleSubmitTask}
            />

            <BundledPackageModal isOpen={bundleModal} bundle={activeBundle} onAccept={handleBundleAccept} />

            {showCompletionModal && (
                <Portal>
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in" onClick={() => setShowCompletionModal(false)}>
                        <div className="bg-zinc-950 border border-white/10 p-12 rounded-[56px] text-center space-y-8 animate-scale-in max-w-sm relative overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                                <Trophy size={48} className="text-white" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter">{isAllSetsDone ? "Efficiency Peak" : "Sequence Peak"}</h3>
                                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Batch Sequence Optimized</p>
                            </div>
                            <div className="p-8 bg-zinc-900/50 rounded-[40px] border border-white/5">
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Yield</p>
                                <p className="text-4xl font-black italic text-green-400 tracking-tighter">{format(profile?.profit || 0)}</p>
                            </div>
                            <button onClick={() => setShowCompletionModal(false)} className="w-full py-5 rounded-[24px] bg-white text-black font-black uppercase tracking-[0.2em] text-[10px]">Continue Protocol</button>
                        </div>
                    </div>
                </Portal>
            )}

            {showMinBalanceModal && (
                <Portal>
                    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl" onClick={() => setShowMinBalanceModal(false)}>
                        <div className="bg-zinc-950 border border-white/10 p-12 rounded-[56px] text-center space-y-8 max-w-sm" onClick={e => e.stopPropagation()}>
                            <div className="w-24 h-24 rounded-[32px] bg-rose-500/10 mx-auto flex items-center justify-center border border-rose-500/20"><AlertTriangle size={48} className="text-rose-500" /></div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Low Allocation</h3>
                                <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest leading-relaxed">Min liquidity {format(profile?.level?.price || 65)} required.</p>
                            </div>
                            <Link href="/app/deposit" className="w-full"><button className="w-full py-5 rounded-[24px] bg-white text-black font-black uppercase tracking-[0.2em] text-[10px]">Recharge Node</button></Link>
                            <button onClick={() => setShowMinBalanceModal(false)} className="w-full text-white/40 text-[9px] font-black hover:text-white uppercase tracking-widest transition-colors">Acknowledge</button>
                        </div>
                    </div>
                </Portal>
            )}
        </main>
    );
}
