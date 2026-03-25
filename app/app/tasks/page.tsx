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
    ArrowRight,
    Zap,
    CheckCircle,
    X,
    Activity,
    TrendingUp,
    Sparkles,
    Pointer,
    Trophy,
    Star,
    RefreshCcw,
    MessageCircle,
    ChevronLeft,
    ShieldCheck,
    Clock,
    Play,
    RefreshCw,
    AlertCircle,
    ChevronRight,
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

    // Dynamic Progress Logic
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
            const [levelsRes, pastTasksRes, itemsRes] = await Promise.all([
                supabase.from('levels').select('*').order('price', { ascending: true }),
                supabase.from('user_tasks')
                    .select('task_item_id, status, completed_at')
                    .eq('user_id', profile.id)
                    .neq('status', 'cancelled'),
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
            const recentIds = new Set(
                ((pastTasksRes.data || []) as any[])
                    .filter(t => t.completed_at && new Date(t.completed_at) > lastResetDate)
                    .map(t => t.task_item_id)
            );
            setRecentlyUsedIdsState(recentIds);

            // Filter items by level_id specifically from the full pool for safety
            const allItemsFromDb = itemsRes.data || [];
            const levelItems = allItemsFromDb.filter(i => Number(i.level_id) === Number(profile.level_id));
            const poolItems = levelItems.length > 0 ? levelItems : allItemsFromDb;

            const poolByUnique = new Map();
            poolItems.forEach(item => {
                if (!poolByUnique.has(item.image_url) && !recentIds.has(item.id)) {
                    poolByUnique.set(item.image_url, item);
                }
            });

            let availableItems = Array.from(poolByUnique.values());
            if (availableItems.length < 24 && poolItems.length > 0) {
                availableItems = poolItems;
            }

            // If still empty (e.g. no items in DB), use all items as absolute fallback
            if (availableItems.length === 0 && allItemsFromDb.length > 0) {
                availableItems = allItemsFromDb;
            }

            const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
            setItems(shuffled.slice(0, 24));

            if (itemsRes.data) {
                (window as any)._allPoolItems = itemsRes.data;
            }
            setMatchingStatus("READY TO MATCH");

        } catch (err) {
            console.error("Error loading task data:", err);
        } finally {
            setIsLoadingData(false);
        }
    }, [profile?.level_id, profile?.id, profile?.level]);

    // Mount only - scroll to top once
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Profile watch - proactive redirect for deficits
    useEffect(() => {
        if (profile) {
            const balance = Number(profile.wallet_balance || 0);
            if (balance < 0) {
                toast.error("Account in deficit. Settle your balance.", { duration: 3000 });
                setTimeout(() => router.push('/app/record?filter=pending'), 1000);
            }
        }
    }, [profile, router]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        let spinInterval: NodeJS.Timeout;
        if (isSpinning) {
            spinInterval = setInterval(() => {
                setHighlightedIndex(prev => {
                    const next = Math.floor(Math.random() * items.length);
                    return next === prev && items.length > 1 ? (next + 1) % items.length : next;
                });
            }, 40);
        } else if (!selectedItem) {
            setHighlightedIndex(null);
        }
        return () => clearInterval(spinInterval);
    }, [isSpinning, items.length, selectedItem]);

    useEffect(() => {
        if (showCompletionModal) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 20000 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [showCompletionModal]);

    const handleTaskSelection = useCallback(async (item: TaskItem, pb?: any, currentItemIndex?: number) => {
        if (!profile || isLocked) return;
        let bundle = pb;
        
        // Use provided bundle to avoid re-fetching, only fallback if really necessary
        if (!bundle) {
            try {
                const fetchPromise = supabase.from('profiles').select('pending_bundle').eq('id', profile.id).single();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Modal Sync Timeout')), 1500));
                
                const { data: freshProfile } = await Promise.race([fetchPromise, timeoutPromise]) as any;
                bundle = freshProfile?.pending_bundle;
            } catch (err) {
                console.warn("Modal sync interrupted. Using pre-existing state.");
            }
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
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#F59E0B', '#FFFFFF', '#3B82F6']
            });
        } else {
            setSelectedItem(item);
            setModalOpen(true);
        }
    }, [isLocked, profile, setSelectedItem, setModalOpen, setBundleModal]);

    const handleStart = useCallback(async () => {
        if (isSpinning || items.length === 0) return;

        const walletBalance = Number(profile?.wallet_balance || 0);
        if (walletBalance < 0) {
            toast.error("Account in deficit. Please settle your balance through the record portal.", {
                duration: 5000
            });
            router.push('/app/record?filter=pending');
            return;
        }

        if (hasActiveRecordPending) {
            toast.success("Redirecting to your pending allocation...");
            router.push('/app/record?filter=pending');
            return;
        }

        const minBalance = profile?.level?.price || 65;
        if (walletBalance < minBalance) {
            setShowMinBalanceModal(true);
            return;
        }

        if (isLocked) {
            const msg = isAllSetsDone ? "DAILY THRESHOLD REACHED" : `SEQUENCE ${currentSet} CONCLUDED. CONTACT SUPPORT.`;
            setMatchingStatus(msg);
            if (!modalSeen) setShowCompletionModal(true);
            return;
        }

        setIsSpinning(true);
        setSelectedItem(null);
        setMatchingStatus("INITIATING NEURAL LINK...");

        // PARALLEL PROFILE VALIDATION: Fetch latest bundle/balance data during animation.
        // This ensures the bundle appears even if it was just assigned by admin.
        const profileSyncPromise = supabase.from('profiles').select('pending_bundle, wallet_balance, completed_count').eq('id', profile?.id).single();

        const currentInSet = ((profile?.completed_count || 0) % (tasksPerSet || 40)) + 1;
        const stages = [
            `ANALYZING MARKET VECTORS - MATCH ${currentInSet}...`,
            "IDENTIFYING OPTIMAL MATCH...",
            "STABILIZING DATA NODE...",
            "FINALIZING ALLOCATION..."
        ];

        let count = 0;
        const maxSteps = 10;
        const intervalTime = 40;
        
        const stageInterval = setInterval(() => {
            const statusIdx = Math.floor(count / 2.5);
            if (stages[statusIdx]) setMatchingStatus(stages[statusIdx]);
            setHighlightedIndex(Math.floor(Math.random() * items.length));
            count++;
            if (count >= maxSteps) clearInterval(stageInterval);
        }, intervalTime);

        // Animation sequence finishes, reveal results from synced data or fallback context
        setTimeout(async () => {
            clearInterval(stageInterval);
            
            try {
                // Await real-time profile check (failsafe) with a 2.5s Timeout to prevent hanging
                let remoteData = null;
                try {
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Sync Timeout')), 2500));
                    const syncRes = await Promise.race([profileSyncPromise, timeoutPromise]) as any;
                    
                    if (!syncRes.error) remoteData = syncRes.data;
                } catch (syncErr) {
                    console.warn("Sync fetch interrupted, using stable state:", syncErr);
                }

                setIsSpinning(false); // Immediate visual stop for resilience

                const finalProfile = (remoteData || profile) as any;
                const pb = finalProfile?.pending_bundle;
                
                // Absolute number in the current set (1-40)
                const currentMatchIndex = ((finalProfile?.completed_count || 0) % (tasksPerSet || 40)) + 1;

                console.log(`[Neural Link Sync] Current Match: ${currentMatchIndex} | Node Allocation Target: ${pb?.targetIndex}`);

                let finalIndex = Math.floor(Math.random() * items.length);
                let matchedItem = { ...items[finalIndex] };

                // Robust Bundle hit check - strict match on current index
                const isHit = !!pb && Number(pb.targetIndex) === currentMatchIndex;

                if (isHit && pb.taskItem) {
                    console.warn(`[Neural Link] Allocation hit detected for match ${currentMatchIndex}`);
                    matchedItem = {
                        id: Number(pb.taskItemIds?.[0] || 0),
                        title: pb.taskItem.title,
                        image_url: pb.taskItem.image_url,
                        category: pb.taskItem.category,
                        description: pb.taskItem.description || '',
                        is_active: true,
                        created_at: new Date().toISOString(),
                        level_id: Number(profile?.level_id || 1)
                    } as TaskItem;

                    const newItems = [...items];
                    newItems[finalIndex] = matchedItem;
                    setItems(newItems);
                }

                setHighlightedIndex(finalIndex);
                setMatchingStatus("MATCH SECURED");

                setTimeout(() => {
                    handleTaskSelection(matchedItem, isHit ? pb : null, isHit ? Number(pb.targetIndex) : currentMatchIndex);
                }, 200);
            } catch (err: any) {
                console.error("Match Flow Fault:", err);
                setIsSpinning(false);
                setMatchingStatus("READY TO MATCH");
            }
        }, 650); // Speed boosted from 850ms for natural smoothness
    }, [isSpinning, items, isLocked, profile, currentSet, isAllSetsDone, modalSeen, tasksPerSet, hasActiveRecordPending, handleTaskSelection]);

    const handleSubmitTask = async (item: TaskItem, costAmount?: number) => {
        if (isSubmitting) return;
        if (!profile) { router.push('/login'); return; }

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.rpc('complete_user_task', {
                p_task_item_id: Number(item.id),
                p_cost_amount: costAmount ? Number(costAmount) : 0,
                p_is_bundle: false // Strictly false: Bundles are handled by handleBundleAccept only
            });

            if (error) throw error;

            const earnedAmount = data?.earned_amount ? Number(data.earned_amount) : 0;
            setModalOpen(false);
            setSelectedItem(null);
            toast.success(`Succesfully optimized. Profit: ${format(earnedAmount)}`);

            setIsRefreshing(true);
            setTimeout(() => {
                const pool = (window as any)._allPoolItems || [];
                const updatedRecent = new Set(recentlyUsedIdsState);
                updatedRecent.add(item.id);
                setRecentlyUsedIdsState(updatedRecent);

                if (pool.length > 0) {
                    const poolByImage = new Map();
                    pool.forEach((p: any) => {
                        if (!poolByImage.has(p.image_url) && !updatedRecent.has(p.id)) poolByImage.set(p.image_url, p);
                    });
                    let freshPool = Array.from(poolByImage.values());
                    if (freshPool.length < 24) freshPool = pool;
                    setItems([...freshPool].sort(() => 0.5 - Math.random()).slice(0, 24));
                }
                setIsRefreshing(false);
                setMatchingStatus("READY TO MATCH");
            }, 800);

            if (completedCountInSet + 1 >= tasksPerSet) {
                setModalSeen(false);
                setTimeout(() => setShowCompletionModal(true), 1500);
            }
            await refreshProfile();
        } catch (err: any) {
            toast.error(err?.message || 'Verification Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBundleAccept = async (bundle: BundlePackage) => {
        if (!profile || isSubmitting) return;

        setIsSubmitting(true);
        setBundleModal(false);
        setIsSpinning(true);
        setMatchingStatus("FINALIZING PROTOCOL...");

        try {
            // Identify the task item definitively
            let itemToRecord = pendingTaskItem;
            if (!itemToRecord && bundle.taskItem) {
                const { data: itemsFromDB } = await supabase.from('task_items').select('*').eq('title', bundle.taskItem.title).limit(1);
                itemToRecord = itemsFromDB?.[0] || null;
            }

            if (!itemToRecord) {
                const { data: fallbackItems } = await supabase.from('task_items').select('*').eq('level_id', profile.level_id).eq('is_active', true).limit(1);
                itemToRecord = fallbackItems?.[0] || null;
            }

            if (!itemToRecord) throw new Error("Could not verify matrix node for allocation.");

            // 1. Create the pending task record
            const { error: insertErr } = await supabase.from('user_tasks').insert({
                user_id: profile.id,
                task_item_id: itemToRecord.id,
                status: 'pending',
                earned_amount: bundle.bonusAmount,
                cost_amount: bundle.totalAmount,
                is_bundle: true,
                created_at: new Date().toISOString()
            });

            if (insertErr) throw insertErr;

            // 2. Perform balance deduction via privileged Admin API
            const res = await fetch('/api/admin/assign-bundle', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: profile.id,
                    deductAmount: bundle.totalAmount,
                    freezeAmount: bundle.totalAmount + bundle.bonusAmount
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to synchronize node allocation.");
            }

            toast.success("Allocation node secured.");
            setMatchingStatus("OPTIMIZING ASSETS...");
            
            // Explicit refresh and delay for smooth cinematic transition
            await refreshProfile();
            setTimeout(() => {
                setIsSpinning(false);
                setIsSubmitting(false);
                router.push(`/app/record?filter=pending&t=${Date.now()}`);
            }, 1000); // 1s cinematic pause for smoothness
        } catch (err: any) {
            console.error("Bundle Accept Fail:", err);
            toast.error(err.message || "Sequence Interrupt: Settle deficit.");
            setIsSpinning(false);
            setIsSubmitting(false);
            setBundleModal(true); // Bring it back if they need to retry
        }
    };

    return (
        <main className="min-h-screen bg-black text-white pb-60">
            {/* High-Fidelity Professional Hub Header */}
            <div className="px-6 pt-8 max-w-7xl mx-auto w-full">
                <div className="relative overflow-hidden rounded-[48px] border border-white/10 shadow-3xl bg-zinc-900/60 backdrop-blur-3xl group mb-12">
                    {/* Background Pattern & Gloss */}
                    <div className="absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-1000">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                    </div>

                    <div className="relative z-10 p-8 md:p-12 flex flex-col gap-10">
                        {/* Profile & Node Status Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000" />
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center relative overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-cyan-500/10 blur-xl" />
                                                <span className="text-3xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-lg">
                                                    {profile?.username?.[0]?.toUpperCase()}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-950 border-4 border-zinc-900 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white">
                                            {profile?.username}
                                        </h1>
                                        <ShieldCheck className="text-cyan-400" size={18} />
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black text-cyan-400 uppercase tracking-widest italic">
                                            Level {profile?.level_id || 1}: {profile?.level?.name || 'Junior Level'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">
                                                Yield Node: {(commissionRate * 100).toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link href="/app/wallet" className="flex items-center gap-4 bg-white/5 hover:bg-white/10 px-8 py-5 rounded-[28px] border border-white/5 transition-all group/wallet">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60 italic">{t('available_balance')}</p>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault(); e.stopPropagation();
                                            refreshProfile();
                                            toast.info('Refreshing node assets...');
                                        }}
                                        className="p-1 hover:bg-white/5 rounded-full transition-colors"
                                        title="Sync Assets"
                                    >
                                        <RefreshCcw size={10} className="text-indigo-400" />
                                    </button>
                                </div>
                                <span className="text-xl font-black tabular-nums tracking-tighter">{format(profile?.wallet_balance || 0)}</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-inner ml-auto">
                                <Wallet size={20} />
                            </div>
                        </Link>
                    </div>

                    {/* Professional Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-6 bg-zinc-950/40 rounded-[32px] border border-white/5 backdrop-blur-md hover:bg-zinc-950/60 transition-colors">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block mb-2 italic">Available Balance</span>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl font-black tracking-tighter text-white tabular-nums">{format(profile?.wallet_balance || 0)}</h2>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                <span className="text-[7.5px] md:text-[9px] font-black text-cyan-500 uppercase tracking-widest italic leading-none">Node Active</span>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-950/40 rounded-[32px] border border-white/5 backdrop-blur-md">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic mb-1">Clearance</p>
                            <h2 className="text-3xl font-black tracking-tighter text-zinc-400 tabular-nums">{format(profile?.freeze_balance || 0)}</h2>
                            <div className="mt-4 flex items-center gap-2 text-zinc-600">
                                <Clock size={12} />
                                <span className="text-[7.5px] md:text-[9px] font-black uppercase tracking-widest italic leading-none">In Clearance</span>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-950/40 rounded-[32px] border border-white/5 backdrop-blur-md">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block mb-2 italic">Today's Profit</span>
                            <h2 className="text-3xl font-black tracking-tighter text-green-400 tabular-nums">+{format(profile?.profit || 0)}</h2>
                            <div className="mt-4 flex items-center gap-2 text-green-500/60">
                                <TrendingUp size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest italic">Performance High</span>
                            </div>
                        </div>

                        <div className="p-6 bg-cyan-500/5 rounded-[32px] border border-cyan-500/10 backdrop-blur-md relative overflow-hidden group/progress">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mb-16 group-hover/progress:scale-150 transition-transform duration-1000" />
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] italic">Task Progress</span>
                                <span className="text-[11px] font-black italic tracking-tighter text-white">{completedCountInSet} / {tasksPerSet}</span>
                            </div>
                            <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-[1.5px]">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.4)] relative"
                                    style={{ width: `${Math.min(100, (completedCountInSet / tasksPerSet) * 100)}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Batch Sequence {profile?.current_set || 1}</span>
                                <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest italic">
                                    {Math.round((completedCountInSet / tasksPerSet) * 100)}% Optimized
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Grid Distribution */}
            <div className="max-w-7xl mx-auto px-6 space-y-20">
                <div className="flex flex-col items-center">
                    <div className="space-y-4 text-center max-w-lg mx-auto mb-16 px-6">
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-cyan-500/50 to-cyan-500" />
                            <div className="px-5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] italic leading-none flex items-center gap-2">
                                <Zap size={10} className="fill-cyan-400/20" /> Matrix Neural Hub <Zap size={10} className="fill-cyan-400/20" />
                            </div>
                            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent via-cyan-500/50 to-cyan-500" />
                        </div>
                        <h2 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl text-center">
                            {matchingStatus}
                        </h2>
                    </div>

                    <div className="w-full max-w-2xl relative">
                        {/* Matrix Hub Pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />

                        <div className="grid grid-cols-5 gap-3 md:gap-5 relative z-10 p-4">
                            {Array.from({ length: 25 }).map((_, idx) => {
                                if (idx === 12) {
                                    return (
                                        <div key="start-btn" className="aspect-square flex items-center justify-center relative p-1">
                                            <button
                                                onClick={handleStart}
                                                disabled={isLocked || isSpinning}
                                                className={cn(
                                                    "w-full h-full rounded-[32px] md:rounded-[40px] z-20 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl overflow-hidden",
                                                    isLocked
                                                        ? "bg-zinc-900 border-zinc-800 opacity-60 grayscale"
                                                        : (hasActiveRecordPending || Number(profile?.wallet_balance || 0) < 0)
                                                            ? "bg-white border-white hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                                            : "bg-white border-white hover:scale-105 active:scale-95"
                                                )}
                                            >
                                                {isLocked ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Lock size={20} className="text-zinc-600" />
                                                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest italic">LOCKED</span>
                                                    </div>
                                                ) : isSpinning ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <RefreshCw size={24} className="text-black animate-spin" />
                                                        <span className="text-[6px] font-black text-black uppercase tracking-widest animate-pulse">MATCHING</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center w-full h-full pt-1">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                                            <Play size={18} className="text-white fill-white translate-x-0.5" />
                                                        </div>
                                                        <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] mt-2 italic text-center">
                                                            {(hasActiveRecordPending || Number(profile?.wallet_balance || 0) < 0) ? "CONTINUE" : "START"}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    );
                                }

                                const itemIdx = idx > 12 ? idx - 1 : idx;
                                const isCurrentHighlighted = highlightedIndex === itemIdx;
                                const item = items[itemIdx];

                                return (
                                    <div
                                        key={idx}
                                        className={`aspect-square rounded-[18px] bg-zinc-900 border border-white/10 overflow-hidden relative transition-all duration-500
                                            ${isCurrentHighlighted ? 'ring-4 ring-cyan-500 scale-125 shadow-[0_0_40px_rgba(6,182,212,0.4)] z-50' : 'opacity-100'}
                                            ${isRefreshing ? 'scale-0' : 'scale-100'}
                                        `}
                                        style={{ transitionDelay: isRefreshing ? `${idx * 15}ms` : '0ms' }}
                                    >
                                        {item ? (
                                            <img src={item.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full animate-pulse bg-white/5" />
                                        )}
                                        {isCurrentHighlighted && (
                                            <div className="absolute inset-0 bg-cyan-500/20 animate-pulse flex items-center justify-center">
                                                <ShieldCheck size={24} className="text-white drop-shadow-lg" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Maintenance Block */}
                    <div className="mt-20 bg-zinc-900/40 backdrop-blur-xl rounded-[40px] p-8 border border-white/5 flex gap-6 items-start max-w-2xl mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20 shadow-inner">
                            <Activity className="text-cyan-400" size={24} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 italic">Neural Protocol Maintenance</h4>
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
                                Market nodes are currently operating in High-Fidelity mode. Maintain session integrity for optimized settlement sequences. Network Latency: 12ms.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Modals */}
            <ItemDetailModal
                isOpen={modalOpen && !!selectedItem}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedItem(null);
                    setMatchingStatus("READY TO MATCH");
                }}
                item={selectedItem}
                balance={profile?.wallet_balance || 0}
                commissionRate={commissionRate}
                format={format}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitTask}
            />

            <BundledPackageModal isOpen={bundleModal} bundle={activeBundle} onAccept={handleBundleAccept} />

            {showCompletionModal && (
                <Portal>
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in cursor-pointer" onClick={() => setShowCompletionModal(false)}>
                        <div className="bg-black border border-white/10 p-12 rounded-[56px] text-center space-y-8 animate-scale-in relative shadow-[0_0_100px_rgba(6,182,212,0.15)]" onClick={e => e.stopPropagation()}>
                            <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-cyan-500 to-blue-500 mx-auto flex items-center justify-center shadow-2xl animate-bounce-slow">
                                <Trophy size={48} className="text-white italic" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter">
                                    {isAllSetsDone ? "Daily Optimization Complete" : `Set ${currentSet} Complete`}
                                </h3>
                                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">
                                    {isAllSetsDone ? "Institutional Efficiency Peak Reached" : "Batch Sequence Optimization Finished"}
                                </p>
                            </div>
                            <div className="p-8 bg-zinc-900/50 rounded-[40px] border border-white/5 space-y-4">
                                <div>
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Node Profit Settled</p>
                                    <p className="text-4xl font-black italic tracking-tighter text-green-400">{format(profile?.profit || 0)}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Link href="/app/support" className="block w-full">
                                    <button className="w-full py-5 rounded-[24px] bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-white/20 button-shine">
                                        Contact Support to Advance
                                    </button>
                                </Link>
                                <button onClick={() => setShowCompletionModal(false)} className="w-full py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Acknowledge</button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {showMinBalanceModal && (
                <Portal>
                    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-fade-in" onClick={() => setShowMinBalanceModal(false)}>
                        <div className="bg-black border border-white/10 p-12 rounded-[56px] text-center space-y-8 animate-scale-in relative max-w-sm" onClick={e => e.stopPropagation()}>
                            <div className="w-24 h-24 rounded-[32px] bg-rose-500/10 mx-auto flex items-center justify-center border border-rose-500/20">
                                <AlertTriangle size={48} className="text-rose-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter italic">Low Allocation</h3>
                                <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest leading-relaxed text-center">
                                    Your institutional node requires a minimum liquidity of {format(profile?.level?.price || 65)} to process this sequence.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <Link href="/app/deposit" className="w-full">
                                    <button className="w-full py-5 rounded-[24px] bg-white text-black font-black uppercase tracking-[0.2em] text-[10px]">Recharge Node</button>
                                </Link>
                                <button onClick={() => setShowMinBalanceModal(false)} className="w-full py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Acknowledge</button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </main>
    );
}
