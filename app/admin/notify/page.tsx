'use client'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import { Send, Users, Bell, Info, CheckCircle, AlertTriangle, XCircle, Loader2, MessageSquare, Zap, History } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AdminNotifyPage() { 
  const [users, setUsers] = useState<any[]>([]); 
  const [title, setTitle] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [sending, setSending] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      // Fetch notifications, grouped by title/message conceptually by selecting unique combinations
      const { data } = await supabase
        .from('notifications')
        .select('title, message, created_at, type')
        .order('created_at', { ascending: false })
        .limit(200);

      if (data) {
        // Simple grouping by title + message
        const grouped = data.reduce((acc: any[], current) => {
          const existing = acc.find(item => item.title === current.title && item.message === current.message);
          if (!existing) {
            acc.push({ ...current, count: 1 });
          } else {
            existing.count++;
          }
          return acc;
        }, []);
        setHistory(grouped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    supabase.from('profiles').select('id, username').then(({ data }) => {
      if (data) setUsers(data);
      setLoading(false);
    });
    fetchHistory();
  }, []);

  const handleDelete = async (title: string, message: string) => {
    if (!confirm("Decomission this broadcast protocol?")) return;
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('title', title)
            .eq('message', message);
        
        if (error) throw error;
        toast.success("Protocol de-indexed.");
        fetchHistory();
    } catch (err: any) {
        toast.error(err.message || "De-index failure");
    }
  }

  const handleSend = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!title || !message) return;
    
    setSending(true); 
    try {
      const records = users.map(u => ({ 
        user_id: u.id, 
        title, 
        message, 
        type: 'info',
        is_read: false
      })); 
      
      const { error } = await supabase.from('notifications').insert(records); 
      if (error) throw error;

      toast.success(`Broadcasting to ${users.length} users completed.`);
      setTitle(''); 
      setMessage(''); 
      fetchHistory();
    } catch (err: any) {
      toast.error(err.message || 'Transmission failure');
    } finally {
      setSending(true); // Artificial delay for UX feel
      setTimeout(() => setSending(false), 800);
    }
  }; 

  return ( 
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl pb-20"> 
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">System Broadcast</h2>
        <p className="text-slate-400 mt-1">Deploy and monitor global push notifications across the agent network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Form */}
          <form onSubmit={handleSend} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-sm space-y-6 shadow-2xl"> 
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center gap-4 mb-2">
               <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-900/40">
                  <MessageSquare size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-white uppercase italic tracking-widest text-sm">Compose Transmission</h3>
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.1em]">Target: {loading ? 'Scanning...' : `${users.length} Active Agents`}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Protocol Title</label>
                    <input 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all italic text-lg" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        placeholder="INCIDENT_REPORT_X" 
                        required 
                    /> 
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Encrypted Payload</label>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all h-32 leading-relaxed text-sm" 
                        value={message} 
                        onChange={e => setMessage(e.target.value)} 
                        placeholder="Enter detailed notification content here..." 
                        required 
                    /> 
                </div>
            </div>

            <button 
              type="submit" 
              disabled={sending || loading || users.length === 0} 
              className={`
                w-full py-5 rounded-[24px] font-black uppercase tracking-[0.3em] italic text-lg transition-all flex items-center justify-center gap-4
                ${sending ? 'bg-slate-800 text-slate-500' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-900/30 active:scale-95'}
              `}
            >
              {sending ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
              {sending ? 'Broadcasting...' : 'Execute Protocol'}
            </button> 
          </form> 

          {/* History Ledger */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 pl-2 flex items-center gap-2 italic">
               <History size={14} className="text-purple-500" />
               Transmission Ledger
            </h3>
            
            <div className="space-y-4">
               {loadingHistory ? (
                   <div className="p-12 flex justify-center text-slate-700 italic font-medium">Synchronizing Ledger...</div>
               ) : history.length === 0 ? (
                   <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[32px] text-slate-600 font-bold uppercase tracking-widest text-[10px]">No historical protocols found.</div>
               ) : (
                history.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-[32px] group hover:border-purple-500/30 transition-all">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 shrink-0">
                                    <Bell size={20} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-black text-white italic uppercase">{item.title}</h4>
                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[8px] font-black text-purple-400 uppercase tracking-widest">{item.count} NODES</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-xl">{item.message}</p>
                                    <div className="flex items-center gap-3 pt-2">
                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">STAMP: {new Date(item.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(item.title, item.message)}
                                className="p-3 rounded-xl bg-white/5 text-slate-600 hover:bg-rose-500/10 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>
                    </div>
                ))
               )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-sm sticky top-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                 <Users size={14} className="text-purple-500" />
                 Engagement Status
              </h4>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Total Reach</span>
                    <span className="text-lg font-black text-white italic">{users.length} Agents</span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                 </div>
                 <p className="text-[10px] text-slate-600 italic leading-relaxed">System protocols are distributed horizontally across all authorized nodes instantly upon execution.</p>
              </div>

              <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-amber-500">
                    <AlertTriangle size={20} />
                    <h4 className="font-black uppercase italic tracking-tighter">Caution</h4>
                </div>
                <p className="text-[10px] text-amber-200/60 leading-relaxed font-bold uppercase tracking-widest opacity-80">
                    Broadcasts are immutable and cannot be recalled once the execution protocol is initiated. Verify payload integrity before confirming.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div> 
  ); 
}
