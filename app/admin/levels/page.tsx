'use client'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import type { Level } from '@/lib/types'; 
import { Plus, Edit2, Trash2, Save, X, Layers, Percent, CreditCard, ClipboardList, Palette } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AdminLevelsPage() { 
  const [levels, setLevels] = useState<Level[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [editingId, setEditingId] = useState<number | null>(null); 
  const [editData, setEditData] = useState<Partial<Level>>({}); 
  const [showCreate, setShowCreate] = useState(false); 
  const [newLevel, setNewLevel] = useState({ 
    name: '', 
    price: 0, 
    commission_rate: 0.0045, 
    tasks_per_set: 40, 
    sets_per_day: 3, 
    description: '', 
    badge_color: '#7c3aed' 
  }); 

  const fetchLevels = async () => { 
    setLoading(true);
    const { data } = await supabase.from('levels').select('*').order('price', { ascending: true }); 
    if (data) setLevels(data as Level[]); 
    setLoading(false); 
  }; 

  useEffect(() => { fetchLevels(); }, []); 

  const handleCreate = async () => { 
    const { error } = await supabase.from('levels').insert(newLevel); 
    if (!error) { 
      setShowCreate(false); 
      setNewLevel({ 
        name: '', 
        price: 0, 
        commission_rate: 0.0045, 
        tasks_per_set: 40, 
        sets_per_day: 3, 
        description: '', 
        badge_color: '#7c3aed' 
      }); 
      fetchLevels(); 
    } 
  }; 

  const handleSave = async () => { 
    if (!editingId) return; 
    const { error } = await supabase.from('levels').update(editData).eq('id', editingId); 
    if (!error) { 
      setEditingId(null); 
      fetchLevels(); 
    } 
  }; 

  const handleDelete = async (id: number) => { 
    if (!confirm('Permanently delete this VIP tier?')) return; 
    try {
        const res = await fetch('/api/admin/delete-item', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type: 'level' })
        });
        if (!res.ok) throw new Error('Delete failed');
        toast.success('VIP tier purged.');
        fetchLevels(); 
    } catch (err: any) {
        toast.error(err.message);
    }
  }; 


  return ( 
    <div className="space-y-8 animate-in fade-in duration-500"> 
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">VIP Tiers</h2>
          <p className="text-slate-400 mt-1">Configure level progression and reward structures.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)} 
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-purple-900/30 active:scale-95 w-fit"
        > 
          <Plus size={20} /> Add Tier 
        </button> 
      </div>

      {showCreate && ( 
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm animate-in slide-in-from-top duration-500"> 
          <h3 className="text-xl font-bold text-white mb-6">Create New VIP Tier</h3> 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
            <div className="space-y-1.5"> 
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tier Name</label> 
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium" 
                value={newLevel.name} 
                onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })} 
                placeholder="e.g. VIP 1 Platinum" 
              /> 
            </div> 
            <div className="space-y-1.5"> 
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Activation Price ($)</label> 
              <input 
                type="number" 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium" 
                value={newLevel.price} 
                onChange={(e) => setNewLevel({ ...newLevel, price: parseFloat(e.target.value) })} 
              /> 
            </div> 
            <div className="space-y-1.5"> 
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Commission Multiplier</label> 
              <input 
                type="number" 
                step="0.0001" 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium" 
                value={newLevel.commission_rate} 
                onChange={(e) => setNewLevel({ ...newLevel, commission_rate: parseFloat(e.target.value) })} 
              /> 
            </div> 
            <div className="space-y-1.5"> 
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Tasks per Set</label> 
              <input 
                type="number" 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium" 
                value={newLevel.tasks_per_set} 
                onChange={(e) => setNewLevel({ ...newLevel, tasks_per_set: parseInt(e.target.value) })} 
              /> 
            </div> 
            <div className="space-y-1.5"> 
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Daily Sets</label> 
              <input 
                type="number" 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium" 
                value={newLevel.sets_per_day} 
                onChange={(e) => setNewLevel({ ...newLevel, sets_per_day: parseInt(e.target.value) })} 
              /> 
            </div> 
            <div className="space-y-1.5"> 
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Brand Color (Badge)</label> 
              <div className="flex gap-2"> 
                <input 
                  type="color" 
                  value={newLevel.badge_color} 
                  onChange={(e) => setNewLevel({ ...newLevel, badge_color: e.target.value })} 
                  className="w-16 h-12 bg-slate-950 border border-slate-800 rounded-2xl p-1 cursor-pointer" 
                /> 
                <input 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono" 
                  value={newLevel.badge_color} 
                  onChange={(e) => setNewLevel({ ...newLevel, badge_color: e.target.value })} 
                /> 
              </div> 
            </div> 
          </div> 
          <div className="flex gap-3 justify-end mt-8"> 
            <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-all">Cancel</button> 
            <button onClick={handleCreate} className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-purple-900/30">Activate Tier</button> 
          </div> 
        </div> 
      )} 

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"> 
        {levels.map((level) => ( 
          <div 
            key={level.id} 
            className="group relative bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-sm transition-all duration-500 hover:border-purple-500/30 overflow-hidden"
          > 
            <div 
              className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40" 
              style={{ backgroundColor: level.badge_color }} 
            />
            
            <div className="relative z-10">
              {editingId === level.id ? ( 
                <div className="space-y-4"> 
                  <input className="w-full bg-slate-950 border border-purple-500/50 rounded-2xl px-4 py-2 text-white font-bold" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /> 
                  <div className="grid grid-cols-2 gap-3"> 
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Price</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" value={editData.price || 0} onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })} /> 
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Comm %</label>
                      <input type="number" step="0.0001" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" value={editData.commission_rate || 0} onChange={(e) => setEditData({ ...editData, commission_rate: parseFloat(e.target.value) })} /> 
                    </div>
                  </div> 
                  <div className="grid grid-cols-2 gap-3"> 
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tasks/Set</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" value={editData.tasks_per_set || 0} onChange={(e) => setEditData({ ...editData, tasks_per_set: parseInt(e.target.value) })} /> 
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Sets/Day</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white" value={editData.sets_per_day || 0} onChange={(e) => setEditData({ ...editData, sets_per_day: parseInt(e.target.value) })} /> 
                    </div>
                  </div> 
                  <textarea className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-slate-400 text-sm h-20" placeholder="Description" value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                  <div className="flex gap-2"> 
                    <button onClick={handleSave} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/40"><Save size={16} /> Save</button> 
                    <button onClick={() => setEditingId(null)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-colors"><X size={20} /></button> 
                  </div> 
                </div> 
              ) : ( 
                <> 
                  <div className="flex items-start justify-between mb-8"> 
                    <div> 
                      <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 w-fit bg-white/5 border border-white/10" style={{ color: level.badge_color }}>
                        Active Tier
                      </div>
                      <h3 className="text-2xl font-black text-white italic tracking-tight">{level.name.toUpperCase()}</h3> 
                    </div> 
                    <div className="flex gap-1.5"> 
                      <button onClick={() => { setEditingId(level.id); setEditData({ ...level }); }} className="p-2.5 rounded-2xl bg-slate-800/50 text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-all"><Edit2 size={16} /></button> 
                      <button onClick={() => handleDelete(level.id)} className="p-2.5 rounded-2xl bg-slate-800/50 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"><Trash2 size={16} /></button> 
                    </div> 
                  </div> 
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50">
                      <div className="text-slate-500 flex items-center gap-1.5 mb-1">
                        <CreditCard size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Entry</span>
                      </div>
                      <div className="text-xl font-black text-white">${level.price.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50">
                      <div className="text-slate-500 flex items-center gap-1.5 mb-1">
                        <Percent size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Comm</span>
                      </div>
                      <div className="text-xl font-black text-white">{(level.commission_rate * 100).toFixed(2)}%</div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-800/50"> 
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-400">
                        <ClipboardList size={16} />
                        <span className="text-sm font-medium">Tasks Per Set</span>
                      </div>
                      <span className="font-bold text-white text-lg">{level.tasks_per_set}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-400">
                        <Layers size={16} />
                        <span className="text-sm font-medium">Daily Limit</span>
                      </div>
                      <span className="font-bold text-white text-lg">{level.sets_per_day} Sets</span>
                    </div>
                  </div> 
                  
                  {level.description && (
                    <p className="text-xs text-slate-500 mt-6 leading-relaxed bg-slate-950/30 p-4 rounded-2xl italic">
                      "{level.description}"
                    </p>
                  )}
                </> 
              )} 
            </div>
          </div> 
        ))} 
      </div> 
    </div> 
  ); 
}
