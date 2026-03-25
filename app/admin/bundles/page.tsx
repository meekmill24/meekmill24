'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Save, X, Package, Users, Zap, AlertTriangle, CheckCircle, Loader2, Image as ImageIcon, ChevronDown, RefreshCcw, TrendingUp, Star, Layers, Percent } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BundlePackage {
    id: number;
    name: string;
    description: string;
    target_index: number;
    shortage_amount: number;
    total_amount: number;
    bonus_amount: number;
    rate: number;
    is_active: boolean;
    created_at: string;
}

interface UserProfile {
    id: string;
    username: string;
    email?: string;
    wallet_balance: number;
    profit: number;
    level_id: number | null;
    completed_count: number;
    pending_bundle: Record<string, unknown> | null;
    has_pending_task?: boolean;
    has_pending_bundle_task?: boolean;
    pending_cost_amount?: number;
    pending_earned_amount?: number;
}

interface TaskItem {
    id: number;
    title: string;
    image_url: string;
    category: string;
    level_id: number;
}

const emptyBundle = { name: '', description: '', target_index: 35, shortage_amount: 0, total_amount: 100, bonus_amount: 20, rate: 0.20, is_active: true };

const BONUS_PRESETS = [
    { label: '30%', value: 'pct_30' },
    { label: '50%', value: 'pct_50' },
    { label: '100%', value: 'pct_100' },
    { label: '150%', value: 'pct_150' },
    { label: '200%', value: 'pct_200' },
    { label: '$50 FIX', value: 'fix_50' },
    { label: '$100 FIX', value: 'fix_100' },
    { label: '$500 FIX', value: 'fix_500' },
    { label: 'CUSTOM %', value: 'custom_pct' },
    { label: 'CUSTOM $', value: 'custom' },
];

export default function AdminBundlesPage() {
    const [bundles, setBundles] = useState<BundlePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | 'new' | null>(null);
    const [formData, setFormData] = useState(emptyBundle);
    const [saving, setSaving] = useState(false);

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [editingQueueUser, setEditingQueueUser] = useState<UserProfile | null>(null);
    const [isEditingQueue, setIsEditingQueue] = useState(false);
    const [assignForm, setAssignForm] = useState<{ name: string; description: string; productAmount: string | number; rate: string | number; targetIndex: string | number }>({
        name: 'Special Bundle Package',
        description: 'A special bundled order assigned by management.',
        productAmount: '',
        rate: '',
        targetIndex: 35, // Default to a late task in the set
    });
    const [assigning, setAssigning] = useState(false);
    const [assignMsg, setAssignMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const [taskItems, setTaskItems] = useState<TaskItem[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
    const [bonusPreset, setBonusPreset] = useState('pct_30');
    const [customBonus, setCustomBonus] = useState<string | number>('');

    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [productLevelFilter, setProductLevelFilter] = useState<number | 'all'>('all');
    const [userLevelFilter, setUserLevelFilter] = useState<number | 'all'>('all');

    const toggleTaskSelect = (id: number) => {
        setSelectedTaskIds(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const filteredUsers = useMemo(() => users.filter(u =>
        (userLevelFilter === 'all' || u.level_id === userLevelFilter) &&
        (u.username || '').toLowerCase().includes(userSearchQuery.toLowerCase())
    ), [users, userLevelFilter, userSearchQuery]);

    const filteredTaskItems = useMemo(() => taskItems.filter(t =>
        (productLevelFilter === 'all' || t.level_id === productLevelFilter) &&
        (t.title.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
    ), [taskItems, productLevelFilter, productSearchQuery]);

    const fetchBundles = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/bundles');
            if (res.ok) {
                const data = await res.json();
                setBundles(data);
            }
        } catch (err) {
            console.error("Fetch Bundles Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        const { data: profiles } = await supabase.from('profiles').select('id, username, wallet_balance, profit, level_id, pending_bundle, email, completed_count').order('username');
        const { data: pendingTasks } = await supabase.from('user_tasks').select('user_id, is_bundle, cost_amount, earned_amount').eq('status', 'pending');
        
        if (profiles) {
            const usersWithPending = profiles.map(u => {
                const pt = (pendingTasks || []).find(t => t.user_id === u.id);
                return {
                    ...u,
                    has_pending_task: !!pt,
                    has_pending_bundle_task: pt?.is_bundle || false,
                    pending_cost_amount: pt?.cost_amount || 0,
                    pending_earned_amount: pt?.earned_amount || 0
                };
            });
            setUsers(usersWithPending as any[]);
        }
    }, []);

    const fetchTaskItems = useCallback(async () => {
        const { data } = await supabase.from('task_items').select('id, title, image_url, category, level_id').eq('is_active', true).order('level_id', { ascending: true }).order('title', { ascending: true });
        if (data) setTaskItems(data as TaskItem[]);
    }, []);

    useEffect(() => { fetchBundles(); fetchUsers(); fetchTaskItems(); }, [fetchBundles, fetchUsers, fetchTaskItems]);

    // Derived Stats
    const stats = useMemo(() => ({
        activeQueued: users.filter(u => u.pending_bundle).length,
        catalogTotal: bundles.length,
        maxBonus: bundles.reduce((max, b) => Math.max(max, b.bonus_amount), 0)
    }), [users, bundles]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const isNew = editingId === 'new';
            const method = isNew ? 'POST' : 'PATCH';
            const payload = isNew ? formData : { id: editingId, ...formData };

            const res = await fetch('/api/admin/bundles', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                toast.error(`Save Error: ${errData.error || 'Unknown error'}`);
                return;
            }

            setEditingId(null);
            fetchBundles();
            toast.success("Catalog updated!");
        } catch (err: any) {
            console.error("Save Bundle Error:", err);
            toast.error(`Save Error: ${err.message}`);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Permanently remove this bundle from catalog?')) return;
        try {
            const res = await fetch('/api/admin/bundles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (!res.ok) {
                const errData = await res.json();
                toast.error(`Delete Error: ${errData.error || 'Unknown error'}`);
                return;
            }

            fetchBundles();
            toast.success("Bundle deleted");
        } catch (err: any) {
            console.error("Delete Bundle Error:", err);
            toast.error(`Delete Error: ${err.message}`);
        }
    };

    const handleUserSelect = (userId: string) => {
        setSelectedUserId(userId);
        const user = users.find(u => u.id === userId);
        if (user) {
            const defaultProductAmount = parseFloat((user.wallet_balance * 1.2).toFixed(2));
            setAssignForm(f => ({ ...f, productAmount: defaultProductAmount, targetIndex: 35 }));
            setProductLevelFilter(user.level_id || 1);
        }
    };

    const selectedUser = users.find(u => u.id === selectedUserId);
    const selectedTasks = taskItems.filter(t => selectedTaskIds.includes(t.id));

    const computeBonus = (productAmount: number): number => {
        const bonusPresetValue = bonusPreset;
        if (bonusPresetValue === 'pct_30') return parseFloat((productAmount * 0.30).toFixed(2));
        if (bonusPresetValue === 'pct_50') return parseFloat((productAmount * 0.50).toFixed(2));
        if (bonusPresetValue === 'pct_100') return parseFloat((productAmount * 1.00).toFixed(2));
        if (bonusPresetValue === 'pct_150') return parseFloat((productAmount * 1.50).toFixed(2));
        if (bonusPresetValue === 'pct_200') return parseFloat((productAmount * 2.00).toFixed(2));
        if (bonusPresetValue === 'fix_50') return 50;
        if (bonusPresetValue === 'fix_100') return 100;
        if (bonusPresetValue === 'fix_500') return 50;
        if (bonusPresetValue === 'custom_pct') {
            const r = typeof assignForm.rate === 'number' ? assignForm.rate : parseFloat(assignForm.rate as string) || 0;
            return parseFloat((productAmount * (r / 100)).toFixed(2));
        }
        return typeof customBonus === 'number' ? customBonus : parseFloat(customBonus as string) || 0;
    };

    const handleAssignBundle = async () => {
        const amount = typeof assignForm.productAmount === 'number' ? assignForm.productAmount : parseFloat(assignForm.productAmount) || 0;
        if (!selectedUserId || !amount || selectedTaskIds.length === 0) {
            toast.error('Select a user, amount, and at least one product.');
            return;
        }
        setAssigning(true);
        setAssignMsg(null);
        try {
            const productAmount = amount;
            const walletBalance = selectedUser?.wallet_balance || 0;
            const shortageAmount = parseFloat(Math.max(0, productAmount - walletBalance).toFixed(2));
            const bonusAmount = computeBonus(productAmount);
            const primaryTask = selectedTasks[0];

            const bundlePayload = {
                id: `admin-${Date.now()}`,
                name: assignForm.name,
                description: assignForm.description,
                shortageAmount,
                totalAmount: productAmount,
                bonusAmount,
                expiresIn: 86400,
                assignedBy: 'admin',
                assignedAt: new Date().toISOString(),
                taskItemIds: selectedTaskIds,
                targetIndex: typeof assignForm.targetIndex === 'number' ? assignForm.targetIndex : parseInt(assignForm.targetIndex as string) || 35,
                taskItem: primaryTask ? { title: primaryTask.title, image_url: primaryTask.image_url, category: primaryTask.category } : null,
                taskItems: selectedTasks.map(t => ({ 
                    title: t.title, 
                    image_url: t.image_url, 
                    category: t.category 
                })),
            };

            const res = await fetch('/api/admin/assign-bundle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUserId, bundle: bundlePayload }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                toast.error(`Server error: ${errorText.substring(0, 50)}`);
                return;
            }

            toast.success(`Bundle assigned!`);
            setSelectedUserId('');
            setSelectedTaskIds([]);
            setAssignForm({ name: 'Special Bundle Package', description: '', productAmount: '', rate: '', targetIndex: 35 });
            fetchUsers();
        } catch (err) {
            console.error("Bundle Assign Error:", err);
            toast.error("Process failed");
        } finally { setAssigning(false); }
    };

    const handleClearBundle = async (userId: string) => {
        try {
            const res = await fetch('/api/admin/assign-bundle', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, clearTasks: true }),
            });
            if (res.ok) {
                toast.success("Bundle removed");
                fetchUsers();
            } else {
                toast.error("Clear failed");
            }
        } catch (err) {
            console.error("Clear bundle fetch fail:", err);
        }
    };

    const handleSaveQueueUpdate = async () => {
        if (!editingQueueUser) return;
        setAssigning(true);
        try {
            const bundle = editingQueueUser.pending_bundle as any;
            const res = await fetch('/api/admin/assign-bundle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: editingQueueUser.id, bundle }),
            });
            if (res.ok) {
                toast.success("Deployment calibrated!");
                setIsEditingQueue(false);
                setEditingQueueUser(null);
                fetchUsers();
            } else {
                toast.error("Calibration failed");
            }
        } catch (err) {
            console.error("Update queue fail:", err);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Bundles & Packaging</h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        Queue high-profit bundle orders for specific users
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { fetchBundles(); fetchUsers(); fetchTaskItems(); }} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => { setEditingId('new'); setFormData(emptyBundle); }} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-900/30 active:scale-95 transition-all">
                        <Plus size={16} /> New Catalog Item
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Queue Load</p>
                    <h3 className="text-3xl font-black text-white italic">{stats.activeQueued} <span className="text-xs text-amber-500 not-italic ml-2 uppercase">Live Bundles</span></h3>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Total Catalog</p>
                    <h3 className="text-3xl font-black text-white italic">{stats.catalogTotal} <span className="text-xs text-purple-400 not-italic ml-2 uppercase">Configs</span></h3>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-500/10 transition-colors" />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Peak Bonus</p>
                    <h3 className="text-3xl font-black text-green-500 italic">${stats.maxBonus.toLocaleString()} <span className="text-xs text-green-500/60 not-italic ml-2 uppercase font-black">Max USDT</span></h3>
                </div>
            </div>

            {/* User Assignment & Live Queue Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Allocation Portal */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                    <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm relative">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white italic uppercase tracking-tight">Active Deployment</h3>
                        </div>

                        <div className="space-y-6">
                            {/* User Selection */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Target Agent</label>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                        className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-left flex items-center justify-between group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl h-fit ${selectedUser ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-600'}`}>
                                                <Users size={18} />
                                            </div>
                                            <span className={selectedUser ? 'text-white font-bold' : 'text-slate-600 text-sm'}>
                                                {selectedUser ? selectedUser.username : 'Find an agent...'}
                                            </span>
                                        </div>
                                        <ChevronDown size={18} className={`text-slate-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showUserDropdown && (
                                        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <div className="p-3 bg-slate-950/40 border-b border-slate-800">
                                                <input 
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500/30"
                                                    placeholder="Search user..."
                                                    value={userSearchQuery}
                                                    onChange={e => setUserSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredUsers.length === 0 ? (
                                                    <div className="p-10 text-center text-slate-700 font-bold uppercase tracking-widest text-[9px]">
                                                        Deployment Targets Unavailable
                                                    </div>
                                                ) : (
                                                    filteredUsers.map(u => (
                                                        <div 
                                                            key={u.id}
                                                            onClick={() => { handleUserSelect(u.id); setShowUserDropdown(false); }}
                                                            className="px-6 py-4 hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b border-slate-800/20 last:border-0"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-bold text-white truncate">{u.username || u.email?.split('@')[0]}</div>
                                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                                                    VIP {u.level_id || 1} • ${u.wallet_balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </div>
                                                            </div>
                                                            {u.pending_bundle && <Star size={12} className="text-amber-500 flex-shrink-0" fill="currentColor" />}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Task Matcher */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Injection Targets ({selectedTaskIds.length}/2)</label>
                                <div className="grid grid-cols-1 bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden h-40">
                                    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                                        {filteredTaskItems.map(t => {
                                            const isSelected = selectedTaskIds.includes(t.id);
                                            return (
                                                <div 
                                                    key={t.id}
                                                    onClick={() => toggleTaskSelect(t.id)}
                                                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-purple-500/10 border-purple-500/30' : 'border-transparent hover:bg-slate-800/50'}`}
                                                >
                                                    <img src={t.image_url} className="w-8 h-8 rounded-lg object-cover" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-xs font-bold truncate ${isSelected ? 'text-purple-400' : 'text-slate-200'}`}>{t.title}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest">VIP {t.level_id} • {t.category}</div>
                                                    </div>
                                                    {isSelected && <CheckCircle size={14} className="text-purple-500" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Bundle Total ($)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white font-black italic focus:outline-none focus:border-purple-500/30"
                                        placeholder="0.00"
                                        value={assignForm.productAmount}
                                        onChange={e => setAssignForm({ ...assignForm, productAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Task Hit Index (1-40)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white font-black italic focus:outline-none focus:border-purple-500/30"
                                        placeholder="35"
                                        value={assignForm.targetIndex}
                                        onChange={e => setAssignForm({ ...assignForm, targetIndex: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Commission Override</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {BONUS_PRESETS.map(p => (
                                        <button 
                                            key={p.value} 
                                            onClick={() => setBonusPreset(p.value)}
                                            className={`py-2 px-1 rounded-xl text-[9px] font-black tracking-widest transition-all border ${bonusPreset === p.value ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                {bonusPreset === 'custom_pct' && (
                                    <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                                        <div className="relative group">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={12} />
                                            <input 
                                                type="number"
                                                className="w-full bg-slate-950/90 border border-purple-500/30 rounded-xl pl-10 pr-4 py-3 text-white text-[11px] font-black italic focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                                placeholder="Enter yield % (e.g. 20)..."
                                                value={assignForm.rate}
                                                onChange={e => setAssignForm({ ...assignForm, rate: e.target.value })}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Rate %</div>
                                        </div>
                                    </div>
                                )}

                                {bonusPreset === 'custom' && (
                                    <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                                        <div className="relative group">
                                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={12} />
                                            <input 
                                                type="number"
                                                className="w-full bg-slate-950/90 border border-purple-500/30 rounded-xl pl-10 pr-4 py-3 text-white text-[11px] font-black italic focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                                placeholder="Enter fixed amount ($50.00)..."
                                                value={customBonus}
                                                onChange={e => setCustomBonus(e.target.value)}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-purple-500/40 uppercase tracking-widest">Fixed Yield</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Impact Summary */}
                            {selectedUser && parseFloat(assignForm.productAmount as string) > 0 && (
                                <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Agent Deficit</span>
                                        <span className="text-red-400">${Math.max(0, parseFloat(assignForm.productAmount as string) - selectedUser.wallet_balance).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Agent Profit</span>
                                        <span className="text-green-500">${computeBonus(parseFloat(assignForm.productAmount as string)).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleAssignBundle}
                                disabled={assigning || !selectedUserId}
                                className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-purple-900/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                            >
                                {assigning ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                                Deploy Special Bundle
                            </button>
                        </div>
                    </section>
                </div>

                {/* Queue Display & Catalog */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                    {/* Live Deployments Table */}
                    <section className="bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-sm">
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Layers size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white italic uppercase tracking-tight">Deployment Queue</h3>
                            </div>
                            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg uppercase tracking-widest border border-blue-500/20">
                                {users.filter(u => u.pending_bundle).length} Pending Active
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-8 py-5 text-left">Agent</th>
                                        <th className="px-8 py-5 text-center">Hit Index</th>
                                        <th className="px-8 py-5 text-center">Value</th>
                                        <th className="px-8 py-5 text-center">Reward</th>
                                        <th className="px-8 py-5 text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/10">
                                    {users.filter(u => u.pending_bundle || u.has_pending_bundle_task).map(u => {
                                        const b = u.pending_bundle as any;
                                        const isAccepted = u.has_pending_bundle_task && !u.pending_bundle;
                                        const currentProgressNum = (u.completed_count % 40) + (u.has_pending_task ? 1 : 0);
                                        
                                        return (
                                            <tr key={u.id} className={cn(
                                                "hover:bg-slate-800/20 transition-colors",
                                                isAccepted && "bg-indigo-500/5"
                                            )}>
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-white tracking-widest uppercase italic">{u.username}</span>
                                                    <div className="flex flex-col gap-0.5 mt-1 border-l border-blue-500/30 pl-2">
                                                        <div className="text-[9px] text-slate-500 uppercase font-black opacity-60">VIP {u.level_id} PROTOCOL</div>
                                                        <div className={cn(
                                                            "text-[8px] font-black uppercase tracking-widest",
                                                            u.has_pending_task ? "text-green-400" : "text-blue-400"
                                                        )}>
                                                            {currentProgressNum}/40 {u.has_pending_task ? "IN PROGRESS" : "SYNCED"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    {isAccepted ? (
                                                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black italic border border-green-500/20 animate-pulse">
                                                            ACCEPTED
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black italic border border-amber-500/20">
                                                            TASK #{b?.targetIndex || '??'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-center font-bold text-slate-300">
                                                    ${Number(isAccepted ? u.pending_cost_amount : (b?.totalAmount || 0)).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5 text-center font-black text-green-500 italic">
                                                    +${Number(isAccepted ? u.pending_earned_amount : (b?.bonusAmount || 0)).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {!isAccepted && (
                                                            <button 
                                                                onClick={() => { setEditingQueueUser(u); setIsEditingQueue(true); }}
                                                                className="p-2 text-slate-600 hover:text-white transition-colors"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleClearBundle(u.id)}
                                                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.filter(u => u.pending_bundle).length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-slate-700 italic font-bold tracking-widest uppercase text-[9px]">
                                                Queue is currently empty
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Catalog Section */}
                    <section className="bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-sm">
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                    <Package size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white italic uppercase tracking-tight">Product Catalog</h3>
                            </div>
                        </div>

                        {editingId !== null && (
                            <div className="p-8 bg-slate-950/40 border-b border-slate-800 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">Name</label>
                                        <input className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">Threshold</label>
                                        <input type="number" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" value={formData.total_amount} onChange={e => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">Yield ($)</label>
                                        <input type="number" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" value={formData.bonus_amount} onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setFormData({ ...formData, bonus_amount: val, rate: formData.total_amount > 0 ? val / formData.total_amount : 0 });
                                        }} />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">Rate (%)</label>
                                        <input type="number" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" value={(formData.rate || 0) * 100} onChange={e => {
                                            const r = parseFloat(e.target.value) / 100;
                                            setFormData({ ...formData, rate: r, bonus_amount: parseFloat((formData.total_amount * r).toFixed(2)) });
                                        }} />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                                        {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                        Initialize Config
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="px-8 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-8 py-5 text-left">Variant</th>
                                        <th className="px-8 py-5 text-center">Entry</th>
                                        <th className="px-8 py-5 text-center">Profit</th>
                                        <th className="px-8 py-5 text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/10">
                                    {bundles.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-200">{b.name}</div>
                                                <div className="text-[9px] text-slate-600 truncate max-w-xs">{b.description}</div>
                                            </td>
                                            <td className="px-8 py-5 text-center font-bold text-slate-300">${b.total_amount.toFixed(2)}</td>
                                            <td className="px-8 py-5 text-center font-black text-green-500 italic">+${b.bonus_amount.toFixed(2)}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => { setEditingId(b.id); setFormData({ ...b }); }} className="p-2 text-slate-600 hover:text-white"><Pencil size={14} /></button>
                                                    <button onClick={() => handleDelete(b.id)} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {bundles.length === 0 && !loading && (
                                        <tr><td colSpan={4} className="py-20 text-center text-slate-700 italic font-bold tracking-widest uppercase text-[9px]">Catalog Empty</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
            {/* Queue Edit Modal */}
            {isEditingQueue && editingQueueUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
                    <div className="bg-[#0f0f12] border border-white/5 rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Adjust Deployment</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Calibrating Node {editingQueueUser.username}</p>
                            </div>
                            <button onClick={() => setIsEditingQueue(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Hit Index (1-40)</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold italic focus:border-purple-500/50 outline-none transition-colors"
                                        value={(editingQueueUser.pending_bundle as any).targetIndex}
                                        onChange={e => setEditingQueueUser({
                                            ...editingQueueUser,
                                            pending_bundle: { ...(editingQueueUser.pending_bundle as any), targetIndex: parseInt(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Package Cost ($)</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold italic focus:border-purple-500/50 outline-none transition-colors"
                                        value={(editingQueueUser.pending_bundle as any).totalAmount}
                                        onChange={e => setEditingQueueUser({
                                            ...editingQueueUser,
                                            pending_bundle: { ...(editingQueueUser.pending_bundle as any), totalAmount: parseFloat(e.target.value) }
                                        })}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Yield Payout ($)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-green-500 font-bold italic focus:border-purple-500/50 outline-none transition-colors"
                                    value={(editingQueueUser.pending_bundle as any).bonusAmount}
                                    onChange={e => setEditingQueueUser({
                                        ...editingQueueUser,
                                        pending_bundle: { ...(editingQueueUser.pending_bundle as any), bonusAmount: parseFloat(e.target.value) }
                                    })}
                                />
                            </div>
                            
                            <button 
                                onClick={handleSaveQueueUpdate}
                                disabled={assigning}
                                className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-purple-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {assigning ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                CALIBRATE SEQUENCE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

