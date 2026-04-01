'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { TaskItem } from '@/lib/types';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Save, 
    X, 
    Image as ImageIcon, 
    Eye, 
    EyeOff, 
    RefreshCw, 
    Power, 
    ChevronDown, 
    CheckCircle, 
    ArrowUpDown,
    Search,
    Layers,
    Activity,
    Database,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';

const PROFESSIONAL_PHOTO_PATHS = [
    '/items/premium/maxresdefault.jpg',
    '/items/premium/whitr_bg.jpg',
    '/items/premium/13.jpg',
    '/items/premium/14.jpg',
    '/items/premium/15.jpg',
    '/items/premium/16.jpg',
    '/items/premium/2.jpeg',
    '/items/premium/1a98ee99a0281cea19aed5243c9dea58.jpg',
    '/items/premium/20201026_WEB-Sound-Bar-Guide-Lifestyle-Images-1-Mobile.jpg',
    '/items/premium/1460282850_4621-1_760.jpg'
];

function ImagePreview({ url, alt, size = 'md' }: { url: string; alt: string; size?: 'sm' | 'md' | 'lg' }) {
    const [errored, setErrored] = useState(false);
    const heights = { sm: 'h-24', md: 'h-36', lg: 'h-48' };

    return (
        <div className={`${heights[size]} w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 relative group`}>
            {url && !errored ? (
                <img
                    src={url}
                    alt={alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={() => setErrored(true)}
                />
            ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                    <ImageIcon size={size === 'lg' ? 40 : 24} className="opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{errored ? 'Error' : 'No Asset'}</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
    );
}

const emptyForm = { title: '', image_url: '', description: '', category: 'general', level_id: 1, is_active: true };

export default function AdminTasksPage() {
    const [items, setItems] = useState<TaskItem[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [productPool, setProductPool] = useState<{name: string; cat: string; path: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<TaskItem>>({});
    const [showCreate, setShowCreate] = useState(false);
    const [newItem, setNewItem] = useState({ ...emptyForm });
    const [previewUrl, setPreviewUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterSet, setFilterSet] = useState<number | 'all'>('all');
    const [setsToGenerate, setSetsToGenerate] = useState(1);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('task_items')
            .select('*')
            .order('id', { ascending: true })
            .limit(5000);
            
        if (data) setItems(data);
        if (error) {
            console.error('Error fetching items:', error.message || error, error);
            toast.error('Identity Error: Could not synchronize catalog node.');
        }
        setLoading(false);
    };

    const fetchLevels = async () => {
        const { data } = await supabase.from('levels').select('id, name, price, tasks_per_set, sets_per_day').order('price', { ascending: true });
        if (data) setLevels(data);
    };

    useEffect(() => { 
        fetchItems(); 
        fetchLevels();
        fetch('/api/product-pool')
            .then(r => r.json())
            .then(data => { if (data.pool) setProductPool(data.pool); })
            .catch(() => console.warn('Could not load product pool from API'));
    }, []);

    const generateFallbackUrl = (seed: string) => {
        const index = Math.abs(seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PROFESSIONAL_PHOTO_PATHS.length;
        return PROFESSIONAL_PHOTO_PATHS[index];
    };

    const handleCreate = async () => {
        if (!newItem.title) return;
        setSaving(true);
        const item = {
            ...newItem,
            image_url: newItem.image_url.trim() || generateFallbackUrl(newItem.title || `item-${Date.now()}`),
        };
        const { error } = await supabase.from('task_items').insert(item);
        setSaving(false);
        if (!error) {
            setShowCreate(false);
            setNewItem({ ...emptyForm });
            setPreviewUrl('');
            fetchItems();
        }
    };

    const handleSave = async () => {
        if (!editingId) return;
        setSaving(true);
        const updated = {
            ...editData,
            image_url: editData.image_url?.trim() || generateFallbackUrl(editData.title || `item-${editingId}`),
        };
        const { error } = await supabase.from('task_items').update(updated).eq('id', editingId);
        setSaving(false);
        if (!error) { setEditingId(null); fetchItems(); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Permanently purge this unit from the catalog?')) return;
        try {
            const res = await fetch('/api/admin/delete-item', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type: 'task' })
            });

            if (!res.ok) throw new Error('Dismantle sequence failed');
            
            toast.success('Matrix entry neutralized.');
            fetchItems();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const toggleActive = async (id: number, current: boolean) => {
        await supabase.from('task_items').update({ is_active: !current }).eq('id', id);
        fetchItems();
    };

    const handlePurgeAll = async () => {
        if (!confirm('EXTREME WARNING: This will PERMANENTLY DELETE ALL items in the entire catalog. Are you absolutely sure?')) return;
        setLoading(true);
        await supabase.from('task_items').delete().neq('id', -1);
        await fetchItems();
        alert('All items have been purged from the database.');
    };

    const handleBulkGenerateAll = async () => {
        if (levels.length === 0) {
            alert('Levels data not loaded yet.');
            return;
        }

        const generationMap = levels.map(l => ({
            level: l.id,
            count: (l.tasks_per_set || 40) * (l.sets_per_day || 3) 
        }));

        const totalToGenerate = generationMap.reduce((acc, curr) => acc + curr.count, 0);

        const clearExisting = confirm(`CRITICAL: This will DELETE ALL current ${items.length} items and generate exactly ${totalToGenerate} premium products across ${levels.length} VIP Levels. \n\nClick OK to start fresh.`);
        
        setLoading(true);

        if (clearExisting) {
            await supabase.from('task_items').delete().neq('id', -1);
        }
        
        let allGeneratedItems: any[] = [];
        let poolIndex = 0;

        for (const config of generationMap) {
            const pool = productPool.length > 0 ? productPool : [{ name: 'Premium Product', cat: 'general', path: '/items/premium/headphones.png' }];
            let levelPool = pool;
            
            if (config.level === 1) levelPool = pool.filter(p => p.cat === 'electrical');
            else if (config.level === 2) levelPool = pool.filter(p => p.cat === 'furniture');
            else if (config.level === 3) levelPool = pool.filter(p => p.cat === 'gym' || p.cat === 'fashion');
            else if (config.level === 4) levelPool = pool.filter(p => p.cat === 'automotive' || p.cat === 'electrical');
            
            if (levelPool.length === 0) levelPool = pool;

            for (let i = 0; i < config.count; i++) {
                const product = levelPool[poolIndex % levelPool.length];
                poolIndex++;
                const seqId = (i + 1).toString().padStart(3, '0');

                allGeneratedItems.push({
                    title: `LVL ${config.level} - #${seqId} - ${product.name}`,
                    description: `Premium grade ${product.cat} product curated for VIP ${config.level}. High authority and verified quality for decentralized marketplace optimization.`,
                    category: product.cat,
                    level_id: config.level,
                    image_url: product.path,
                    is_active: true
                });
            }
        }

        for (let i = 0; i < allGeneratedItems.length; i += 50) {
            const batch = allGeneratedItems.slice(i, i + 50);
            await supabase.from('task_items').insert(batch);
        }
        
        await fetchItems();
        alert(`Successfully generated ${allGeneratedItems.length} items across VIP Levels!`);
    };

    const handleBulkGenerateCurrentLevel = async () => {
        if (filterLevel === 'all') {
            alert('Please select a specific VIP Level first.');
            return;
        }

        const levelInfo = levels.find(l => l.id === filterLevel);
        const tasksPerSet = levelInfo?.tasks_per_set || 40;
        const count = tasksPerSet * Math.max(1, setsToGenerate);
        
        const pool = productPool.length > 0 ? productPool : [{ name: 'Premium Product', cat: 'general', path: '/items/premium/headphones.png' }];
        let levelPool = pool;
        if (filterLevel === 1) levelPool = pool.filter(p => p.cat === 'electrical');
        else if (filterLevel === 2) levelPool = pool.filter(p => p.cat === 'furniture');
        else if (filterLevel === 3) levelPool = pool.filter(p => p.cat === 'gym' || p.cat === 'fashion');
        else if (filterLevel === 4) levelPool = pool.filter(p => p.cat === 'automotive' || p.cat === 'electrical');
        if (levelPool.length === 0) levelPool = pool;

        const clearExisting = confirm(`Generate ${count} new products for VIP Level ${filterLevel} (${setsToGenerate} set${setsToGenerate > 1 ? 's' : ''} × ${tasksPerSet} tasks)?\n\nClick OK to clear existing items for this level first, or Cancel to just add more.`);
        
        setLoading(true);

        if (clearExisting) {
            await supabase.from('task_items').delete().eq('level_id', filterLevel);
        }

        const newItems = Array.from({ length: count }).map((_, i) => {
            const product = levelPool[Math.floor(Math.random() * levelPool.length)];
            const imgUrl = product.path;
            const seqId = (i + 1).toString().padStart(3, '0');

            return {
                title: `LVL ${filterLevel} - #${seqId} - ${product.name}`,
                description: `A premium, high-rated ${product.cat} product specifically curated for VIP Level ${filterLevel}. Featured in top-selling categories globally for high-volume optimization.`,
                category: product.cat,
                level_id: filterLevel,
                image_url: imgUrl,
                is_active: true
            };
        });

        for (let i = 0; i < newItems.length; i += 50) {
            const batch = newItems.slice(i, i + 50);
            await supabase.from('task_items').insert(batch);
        }
        
        await fetchItems();
        alert(`Successfully generated ${count} items for VIP Level ${filterLevel}!`);
    };

    const filteredItems = items
        .filter(t => {
            const matchesLevel = filterLevel === 'all' || t.level_id === filterLevel;
            const matchesSearch = (t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                                 (t.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                                 `level ${t.level_id}`.includes(searchQuery.toLowerCase());
            return matchesLevel && matchesSearch;
        })
        .sort((a, b) => {
            if (sortOrder === 'asc') return (a.title || '').localeCompare(b.title || '');
            return (b.title || '').localeCompare(a.title || '');
        });

    let finalItems = filteredItems;
    if (filterLevel !== 'all' && filterSet !== 'all') {
        const levelInfo = levels.find(l => l.id === filterLevel);
        const perSet = levelInfo?.tasks_per_set || 40;
        const start = (Number(filterSet) - 1) * perSet;
        const end = Number(filterSet) * perSet;
        finalItems = filteredItems.slice(start, end);
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Admin Header Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Layers size={18} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Catalog</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-white italic">{items.length}</h3>
                        <span className="text-xs text-slate-600 font-bold uppercase italic">units</span>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Activity size={18} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filtered</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-white italic">{finalItems.length}</h3>
                        <span className="text-xs text-slate-600 font-bold uppercase italic">viewing</span>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                            <Database size={18} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Pool</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-white italic">{productPool.length}</h3>
                        <span className="text-xs text-slate-600 font-bold uppercase italic">assets</span>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                            <Zap size={18} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Levels</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-white italic">{levels.length}</h3>
                        <span className="text-xs text-slate-600 font-bold uppercase italic">tiers</span>
                    </div>
                </div>
            </div>

            {/* Filter & Actions Bar */}
            <div className="bg-slate-900/40 p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 backdrop-blur-xl relative z-40 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col xl:flex-row gap-6 items-center justify-between relative z-10">
                    <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                        <div className="relative group/search flex-1 xl:flex-initial xl:min-w-[320px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-purple-400 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search title, level or category..."
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-800 font-bold uppercase tracking-wider"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="relative min-w-[180px]">
                            <button 
                                onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                                className={`w-full bg-slate-950 border rounded-2xl py-3 px-5 flex items-center justify-between text-[11px] font-black uppercase tracking-widest transition-all ${
                                    showLevelDropdown ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <span className={filterLevel === 'all' ? 'text-slate-500' : 'text-purple-400'}>
                                    {filterLevel === 'all' ? 'All VIP Levels' : `VIP Level ${filterLevel}`}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showLevelDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showLevelDropdown && (
                                <div className="absolute z-[1000] top-full mt-2 w-full rounded-2xl bg-slate-950 border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                    <div 
                                        onClick={() => { setFilterLevel('all'); setShowLevelDropdown(false); }}
                                        className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 flex items-center justify-between ${filterLevel === 'all' ? 'text-purple-400 bg-purple-500/5' : 'text-slate-500'}`}
                                    >
                                        <span>All VIP Levels</span>
                                        {filterLevel === 'all' && <CheckCircle size={14} />}
                                    </div>
                                    {levels.map(l => (
                                        <div 
                                            key={l.id}
                                            onClick={() => { setFilterLevel(l.id); setShowLevelDropdown(false); }}
                                            className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between ${filterLevel === l.id ? 'text-purple-400 bg-purple-500/5' : 'text-slate-300'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span>Level {l.id}</span>
                                                {filterLevel === l.id && <CheckCircle size={14} />}
                                            </div>
                                            <span className="text-[10px] text-slate-600 font-normal italic lowercase tracking-tight">${l.price}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {filterLevel !== 'all' && (
                            <div className="flex bg-slate-950 border border-white/10 rounded-2xl p-1 gap-1 flex-wrap">
                                {['all', ...Array.from({ length: levels.find(l => l.id === filterLevel)?.sets_per_day || 3 }, (_, i) => i + 1)].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterSet(s as any)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            filterSet === s
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                                : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
                                        }`}
                                    >
                                        {s === 'all' ? 'All Sets' : `Set ${s}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <button onClick={handlePurgeAll} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                            <Trash2 size={16} /> Purge
                        </button>
                        <button onClick={handleBulkGenerateAll} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-950 text-slate-400 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-white/30 transition-all">
                            <RefreshCw size={16} /> Auto-Sync
                        </button>
                        <button onClick={() => { setShowCreate(!showCreate); setPreviewUrl(''); setNewItem({ ...emptyForm }); }} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all">
                            <Plus size={18} /> New Product
                        </button>
                    </div>
                </div>

                {filterLevel !== 'all' && (
                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center gap-6 relative">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Batch generation protocols</span>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-white uppercase italic">Targeting VIP Level {filterLevel}</span>
                                <div className="h-1 w-1 rounded-full bg-purple-500/40" />
                                <span className="text-xs text-slate-500 font-medium italic">{levels.find(l => l.id === filterLevel)?.tasks_per_set} tasks/set</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-950 border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="flex items-center">
                                <button onClick={() => setSetsToGenerate(v => Math.max(1, v - 1))} className="w-12 h-12 flex items-center justify-center text-purple-400 hover:bg-white/5 transition-colors font-black text-lg">−</button>
                                <div className="w-12 text-center text-sm font-black text-white">{setsToGenerate}</div>
                                <button onClick={() => setSetsToGenerate(v => Math.min(50, v + 1))} className="w-12 h-12 flex items-center justify-center text-purple-400 hover:bg-white/5 transition-colors font-black text-lg">+</button>
                            </div>
                            <button 
                                onClick={handleBulkGenerateCurrentLevel}
                                className="h-12 px-8 bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 text-[10px] font-black uppercase tracking-widest transition-all border-l border-purple-500/10 flex items-center gap-3"
                            >
                                <Zap size={14} className="fill-purple-400/20" /> 
                                Deploy Units
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Item Overlay */}
            {showCreate && (
                <div className="bg-slate-900/60 border border-purple-500/20 p-10 rounded-[48px] backdrop-blur-3xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                    
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Catalog Acquisition</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Add a unique node to the distribution matrix</p>
                        </div>
                        <button onClick={() => setShowCreate(false)} className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/5 text-slate-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center active:scale-95">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Identity</label>
                                <input 
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold" 
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Classification</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white hover:border-purple-500/30 transition-all cursor-pointer font-bold appearance-none" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>
                                            {['electrical', 'furniture', 'gym', 'fashion', 'automotive', 'general'].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">VIP Tier</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white hover:border-purple-500/30 transition-all cursor-pointer font-bold appearance-none" value={newItem.level_id} onChange={e => setNewItem({ ...newItem, level_id: parseInt(e.target.value) })}>
                                            {levels.map(l => <option key={l.id} value={l.id}>VIP LEVEL {l.id} - ${l.price}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Description</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all h-32 resize-none" 
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Image URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono" 
                                        value={newItem.image_url}
                                        onChange={e => { setNewItem({ ...newItem, image_url: e.target.value }); setPreviewUrl(e.target.value); }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => { const url = generateFallbackUrl(newItem.title || `item-${Date.now()}`); setNewItem({ ...newItem, image_url: url }); setPreviewUrl(url); }}
                                        className="w-[60px] h-[60px] rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                </div>
                            </div>

                            <ImagePreview url={previewUrl || newItem.image_url} alt={newItem.title} size="lg" />

                            <button onClick={handleCreate} disabled={saving || !newItem.title} className="w-full h-16 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-900/40 hover:scale-[1.02] active:scale-95 transition-all">
                                Commit to Matrix
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-40">
                        <RefreshCw size={48} className="animate-spin mb-4" />
                        <span className="font-black uppercase tracking-widest">Synchronizing...</span>
                    </div>
                ) : (
                    finalItems.map(item => (
                        <div key={item.id} className={`bg-slate-900/40 rounded-[40px] border border-white/5 overflow-hidden transition-all duration-500 group flex flex-col h-full ${!item.is_active ? 'grayscale opacity-40' : 'hover:border-purple-500/30 hover:-translate-y-2'}`}>
                            <div className="aspect-video overflow-hidden relative">
                                <img src={item.image_url || generateFallbackUrl(item.title || '')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest text-white border border-white/10">LVL {item.level_id}</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h4 className="font-black text-white text-lg uppercase tracking-tighter italic mb-2">{item.title}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest line-clamp-2 leading-relaxed opacity-60 mb-6">{item.description}</p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex gap-3">
                                    <button onClick={() => { setEditingId(item.id); setEditData(item); }} className="flex-1 py-3 bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:text-white transition-colors">Edit</button>
                                    <button onClick={() => toggleActive(item.id, item.is_active)} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${item.is_active ? 'text-purple-500 bg-purple-500/10' : 'text-slate-600 bg-slate-900'}`}>{item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                                    <button onClick={() => handleDelete(item.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 border border-white/5 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
