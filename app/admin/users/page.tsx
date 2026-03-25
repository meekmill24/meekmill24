'use client'; 
import { useEffect, useState, useCallback } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import type { Profile } from '@/lib/types'; 
import { Search, UserPlus, Edit2, Trash2, Save, X, Shield, ShieldAlert, Wallet, TrendingUp, Mail, Phone, Calendar, RefreshCcw, DollarSign, Lock, Eye, EyeOff, Zap, CheckCircle, Layers, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() { 
  const [users, setUsers] = useState<Profile[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', username: '', phone: '', role: 'user' as const });
  const [creating, setCreating] = useState(false);

  // Reset Modal
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetType, setResetType] = useState<'full' | 'advance'>('full');
  const [resetting, setResetting] = useState(false);

  const fetchUsers = useCallback(async () => { 
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); 
    if (data) setUsers(data as Profile[]); 
    setLoading(false);
  }, []); 

  useEffect(() => { fetchUsers(); }, [fetchUsers]); 

  const handleSave = async () => {
    if (!editingId) return;
    
    // Explicitly casting and filtering fields for the server API
    const updatePayload = {
      username: editData.username,
      phone: editData.phone,
      level_id: editData.level_id,
      role: editData.role,
      wallet_balance: Number(editData.wallet_balance),
      freeze_balance: Number(editData.freeze_balance),
      profit: Number(editData.profit),
      completed_count: Number(editData.completed_count),
      current_set: Number(editData.current_set),
      total_earned: Number(editData.total_earned),
      pending_bundle: editData.pending_bundle,
      is_admin: editData.role === 'admin',
      withdrawal_password: editData.withdrawal_password,
      tasks_per_set_override: editData.tasks_per_set_override ? Number(editData.tasks_per_set_override) : null,
      sets_per_day_override: editData.sets_per_day_override ? Number(editData.sets_per_day_override) : null,
    };

    try {
        const res = await fetch('/api/admin/update-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: editingId,
                updateData: updatePayload
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to recalibrate node');

        toast.success(`Matrix node calibrated! Balance: $${Number(updatePayload.wallet_balance).toFixed(2)}`);
        setEditingId(null);
        fetchUsers();
    } catch (err: any) {
        console.error('Calibration failure:', err);
        toast.error(err.message);
    }
  };

  const handleResetRecord = async () => {
    if (!resetUserId) return;
    setResetting(true);
    
    const user = users.find(u => u.id === resetUserId);
    if (!user) return;

    let updateData = {};
    if (resetType === 'full') {
        updateData = { current_set: 1, completed_count: 0, profit: 0, wallet_balance: 45 }; 
    } else {
        const nextSet = (user.current_set || 1) + 1;
        updateData = { current_set: nextSet };
    }

    try {
        const res = await fetch('/api/admin/update-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: resetUserId, updateData })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Sync failed');

        toast.success(resetType === 'full' ? 'Hard Reset Node Success' : `Set ${ (user.current_set || 1) + 1} Synchronization Established`);
        setResetUserId(null);
        fetchUsers();
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setResetting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
        const res = await fetch('/api/admin/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create user');
        
        toast.success(`User ${newUser.username} created successfully`);
        setShowCreateModal(false);
        setNewUser({ email: '', password: '', username: '', phone: '', role: 'user' });
        fetchUsers();
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setCreating(false);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    const newPassword = prompt(`Enter a new temporary password for ${name}:`);
    if (!newPassword || newPassword.trim() === '') return;

    try {
        const res = await fetch('/api/admin/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to securely update password');

        toast.success(`Access override successful. Password reset for ${name}.`);
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to PURGE node ${name}? This action is irreversible and will delete all account data and auth credentials.`)) return;
    
    try {
        const res = await fetch('/api/admin/delete-user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: id })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to terminate node');

        toast.success(`Node ${name} terminated from matrix.`);
        fetchUsers();
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery) ||
    u.id.includes(searchQuery)
  );

  return ( 
    <div className="space-y-8 animate-in fade-in duration-500 pb-20"> 
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">NODE REGISTRY</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Matrix Participant Control Panel</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Filter by Node/Identity/ID..." 
              className="pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 w-full md:w-80 transition-all text-sm placeholder:text-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-400 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
          >
            <UserPlus size={14} /> NEW NODE
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] border-b border-slate-800 bg-white/[0.02]">
                <th className="px-4 md:px-8 py-6">IDENTIFIER</th>
                <th className="px-4 md:px-8 py-6">CONTACT PROTOCOL</th>
                <th className="px-4 md:px-8 py-6">AUTHORIZATION</th>
                <th className="px-4 md:px-8 py-6">PORTFOLIO & CAPITAL</th>
                <th className="px-4 md:px-8 py-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group relative">
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 flex items-center justify-center text-white font-black italic shadow-inner">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        {editingId === user.id ? (
                          <input 
                            className="bg-black/40 border border-purple-500/50 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none"
                            value={editData.username || ''}
                            onChange={(e) => setEditData({...editData, username: e.target.value})}
                          />
                        ) : (
                          <div className="font-black text-slate-200 tracking-tight uppercase italic text-sm">{user.username}</div>
                        )}
                        <div className="text-[9px] text-slate-600 mt-1 flex items-center gap-1 font-bold uppercase tracking-widest">
                          <Calendar size={10} />
                          Active since {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail size={12} className="text-slate-700" />
                        <span className="text-[11px] font-bold text-slate-400">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone size={12} className="text-slate-700" />
                        <span className="text-[11px] font-bold text-slate-500">{user.phone || 'NO_LINE_DETECTOR'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest border border-purple-500/20">
                            <Shield size={10} /> ADMIN_ROOT
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-800/50 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-800">
                            STANDARD_NODE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingId === user.id ? (
                          <select 
                            className="bg-black/40 border border-purple-500/50 rounded-xl px-3 py-1.5 text-blue-400 text-xs focus:outline-none appearance-none cursor-pointer font-bold uppercase"
                            value={editData.level_id || 1}
                            onChange={(e) => setEditData({...editData, level_id: parseInt(e.target.value)})}
                          >
                            {[1,2,3,4,5,6,7,8].map(lvl => <option key={lvl} value={lvl}>LVL {lvl}</option>)}
                          </select>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                             LVL {user.level_id || 0}
                          </span>
                        )}
                        <div className="text-[9px] font-black text-slate-700 uppercase">{user.completed_count || 0}/40 Tasks</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="space-y-2">
                        {editingId === user.id ? (
                          <div className="flex flex-col gap-2">
                              <div className="relative">
                                <Wallet className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-700" size={10} />
                                <input 
                                    className="bg-black/40 border border-purple-500/50 rounded-lg pl-6 pr-2 py-1 text-white text-[11px] font-bold focus:outline-none w-32"
                                    type="number"
                                    value={editData.wallet_balance ?? ''}
                                    onChange={(e) => setEditData({...editData, wallet_balance: e.target.value === '' ? undefined : parseFloat(e.target.value)})}
                                    placeholder="Balance"
                                />
                              </div>
                              <div className="relative">
                                <Wallet className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-700" size={10} />
                                <input 
                                    className="bg-black/40 border border-rose-500/50 rounded-lg pl-6 pr-2 py-1 text-white text-[11px] font-bold focus:outline-none w-32"
                                    type="number"
                                    value={editData.freeze_balance ?? ''}
                                    onChange={(e) => setEditData({...editData, freeze_balance: e.target.value === '' ? undefined : parseFloat(e.target.value)})}
                                    placeholder="Clearance"
                                />
                              </div>
                              <div className="relative">
                                <TrendingUp className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-700" size={10} />
                                <input 
                                    className="bg-black/40 border border-purple-500/50 rounded-lg pl-6 pr-2 py-1 text-white text-[11px] font-bold focus:outline-none w-32"
                                    type="number"
                                    value={editData.profit ?? ''}
                                    onChange={(e) => setEditData({...editData, profit: e.target.value === '' ? undefined : parseFloat(e.target.value)})}
                                    placeholder="Profit"
                                />
                              </div>
                              <div className="flex gap-1.5">
                                <div className="relative flex-1">
                                  <CheckCircle className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-700" size={10} />
                                  <input 
                                      className="bg-black/40 border border-purple-500/50 rounded-lg pl-6 pr-2 py-1 text-white text-[11px] font-bold focus:outline-none w-full"
                                      type="number"
                                      value={editData.completed_count ?? ''}
                                      onChange={(e) => setEditData({...editData, completed_count: e.target.value === '' ? undefined : parseInt(e.target.value)})}
                                      placeholder="Tasks"
                                  />
                                </div>
                                <div className="relative flex-1">
                                  <Layers className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-700" size={10} />
                                  <input 
                                      className="bg-black/40 border border-purple-500/50 rounded-lg pl-6 pr-2 py-1 text-white text-[11px] font-bold focus:outline-none w-full"
                                      type="number"
                                      value={editData.current_set ?? ''}
                                      onChange={(e) => setEditData({...editData, current_set: e.target.value === '' ? undefined : parseInt(e.target.value)})}
                                      placeholder="Set"
                                  />
                                </div>
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-800 space-y-2">
                                <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest px-1">Internal Sequence Config</p>
                                <div className="grid grid-cols-1 gap-1.5">
                                  <div className="relative">
                                    <Target className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-700" size={10} />
                                    <input 
                                        className="bg-black/40 border border-amber-500/30 rounded-lg pl-6 pr-2 py-1 text-amber-500 text-[10px] font-bold focus:outline-none w-32 placeholder:text-slate-800"
                                        type="number"
                                        value={editData.pending_bundle?.targetIndex ?? ''}
                                        onChange={(e) => setEditData({
                                            ...editData, 
                                            pending_bundle: { 
                                                ...(editData.pending_bundle || {}), 
                                                targetIndex: e.target.value === '' ? undefined : parseInt(e.target.value) 
                                            }
                                        })}
                                        placeholder="Target Index (e.g. 34)"
                                    />
                                  </div>
                                  <div className="flex gap-1.5">
                                    <input 
                                        className="bg-black/40 border border-amber-500/30 rounded-lg px-2 py-1 text-amber-500 text-[10px] font-bold focus:outline-none w-16 placeholder:text-slate-800"
                                        type="number"
                                        value={editData.pending_bundle?.totalAmount ?? ''}
                                        onChange={(e) => setEditData({
                                            ...editData, 
                                            pending_bundle: { 
                                                ...(editData.pending_bundle || {}), 
                                                totalAmount: e.target.value === '' ? undefined : parseFloat(e.target.value) 
                                            }
                                        })}
                                        placeholder="Cost"
                                    />
                                    <input 
                                        className="bg-black/40 border border-amber-500/30 rounded-lg px-2 py-1 text-amber-500 text-[10px] font-bold focus:outline-none w-16 placeholder:text-slate-800"
                                        type="number"
                                        value={editData.pending_bundle?.bonusAmount ?? ''}
                                        onChange={(e) => setEditData({
                                            ...editData, 
                                            pending_bundle: { 
                                                ...(editData.pending_bundle || {}), 
                                                bonusAmount: e.target.value === '' ? undefined : parseFloat(e.target.value) 
                                            }
                                        })}
                                        placeholder="Profit"
                                    />
                                  </div>
                                </div>
                              </div>
                          </div>
                        ) : (
                          <>
                             <div className="flex items-center gap-2 font-black text-white italic tabular-nums">
                                <Wallet size={12} className="text-green-500" />
                                ${user.wallet_balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                             </div>
                             <div className="flex items-center gap-2 font-black text-rose-500 italic tabular-nums text-[10px]">
                                <Wallet size={11} className="text-rose-600" />
                                ${user.freeze_balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} (Clearance)
                             </div>
                             <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">
                                <TrendingUp size={11} className="text-purple-600" />
                                Yield: ${user.profit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                             </div>
                          </>
                        )}
                    </div>
                  </td>
                  <td className="px-4 md:px-4 md:px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === user.id ? (
                        <>
                          <button onClick={handleSave} className="p-2.5 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/10"><Save size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                            <button 
                                onClick={() => { setResetUserId(user.id); setResetType('full'); }}
                                title="Reset to Set 1"
                                className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all border border-rose-500/10"
                            >
                                <RefreshCcw size={16} />
                            </button>
                            <button 
                                onClick={() => { setResetUserId(user.id); setResetType('advance'); }}
                                title="Advance to Next Set"
                                className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/10"
                            >
                                <Zap size={16} />
                            </button>
                            <button 
                                onClick={() => { setEditingId(user.id); setEditData(user); }}
                                className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-all border border-purple-500/10"
                                title="Edit Node Parameters"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleResetPassword(user.id, user.username || 'unknown')}
                                className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-all border border-amber-500/10"
                                title="Reset Login Password"
                            >
                                <Lock size={16} />
                            </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.username || 'unknown')}
                        className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-24 text-center px-10">
                <Search size={48} className="mx-auto text-slate-800 mb-6" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">NO NODES MATCHING SEARCH_QUERY</p>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
            <div className="bg-[#0f0f12] border border-white/5 rounded-[32px] md:rounded-[40px] w-full max-w-xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">INITIATE NODE</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Register new entity in the Matrix</p>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Identity Handle</label>
                            <input 
                                required
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500/50 transition-all"
                                value={newUser.username}
                                onChange={e => setNewUser({...newUser, username: e.target.value})}
                                placeholder="neo_core"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Authorization Role</label>
                            <select 
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500/50 transition-all appearance-none"
                                value={newUser.role}
                                onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                            >
                                <option value="user">STANDARD_NODE</option>
                                <option value="admin">ROOT_ENTITY</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Network Entry (Email)</label>
                        <input 
                            required
                            type="email"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500/50 transition-all"
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                            placeholder="entity@matrix.hub"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Access Passphrase</label>
                            <input 
                                required
                                type="password"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500/50 transition-all"
                                value={newUser.password}
                                onChange={e => setNewUser({...newUser, password: e.target.value})}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Encrypted Line (Phone)</label>
                            <input 
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-500/50 transition-all"
                                value={newUser.phone}
                                onChange={e => setNewUser({...newUser, phone: e.target.value})}
                                placeholder="+1 000 000..."
                            />
                        </div>
                    </div>

                    <button 
                        disabled={creating}
                        className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-purple-500 hover:text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                    >
                        {creating ? 'COMMITTING DATA...' : 'INITIALIZE PARTICIPANT'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Reset/Advance Confirmation Modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
            <div className="bg-[#0f0f12] border border-white/5 rounded-[40px] w-full max-w-sm p-10 shadow-2xl relative overflow-hidden text-center">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${resetType === 'full' ? 'bg-rose-500/10' : 'bg-blue-500/10'}`}>
                    {resetType === 'full' ? <RefreshCcw size={32} className="text-rose-500" /> : <Zap size={32} className="text-blue-500" />}
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">
                    {resetType === 'full' ? 'Hard Reset Node?' : 'Advance Synchronization?'}
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8">
                    {resetType === 'full' 
                        ? "Revert participant protocol to Set 1 and starting balance. This clears today's metrics." 
                        : "Push participant node to the NEXT task set cycle immediately."}
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleResetRecord}
                        disabled={resetting}
                        className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 ${resetType === 'full' ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                    >
                        {resetting ? 'SYNCHRONIZING...' : 'CONFIRM ACTION'}
                    </button>
                    <button 
                        onClick={() => setResetUserId(null)}
                        className="w-full bg-white/5 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
      )}
    </div> 
  ); 
}
