'use client'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import { Send, Users, Bell, Info, CheckCircle, AlertTriangle, XCircle, Loader2, MessageSquare, Zap } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AdminNotifyPage() { 
  const [users, setUsers] = useState<any[]>([]); 
  const [title, setTitle] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [sending, setSending] = useState(false); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('id, username').then(({ data }) => {
      if (data) setUsers(data);
      setLoading(false);
    });
  }, []);

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
    } catch (err: any) {
      toast.error(err.message || 'Transmission failure');
    } finally {
      setSending(true); // Artificial delay for UX feel
      setTimeout(() => setSending(false), 800);
    }
  }; 

  return ( 
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl"> 
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">System Broadcast</h2>
        <p className="text-slate-400 mt-1">Deploy global push notifications to all authenticated agents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSend} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-sm space-y-6"> 
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-3xl flex items-center gap-4 mb-2">
               <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-900/40">
                  <MessageSquare size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-white uppercase italic tracking-widest text-sm">Compose Transmission</h3>
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.1em]">Target: {loading ? 'Scanning...' : `${users.length} Active Agents`}</p>
               </div>
            </div>

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
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all h-48 leading-relaxed text-sm" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Enter detailed notification content here..." 
                required 
              /> 
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
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                 <Users size={14} className="text-purple-500" />
                 Engagement Status
              </h4>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Reach</span>
                    <span className="text-lg font-black text-white italic">100%</span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                 </div>
                 <p className="text-[10px] text-slate-600 italic">This message will be visible to all users upon their next authentication reset.</p>
              </div>
           </div>

           <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[40px] backdrop-blur-sm">
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                 <AlertTriangle size={24} />
                 <h4 className="font-black uppercase italic tracking-tighter text-lg">Caution</h4>
              </div>
              <p className="text-xs text-amber-200/60 leading-relaxed font-medium">
                 Broadcasts are immutable and cannot be recalled once the execution protocol is initiated. Verify payload integrity before confirming.
              </p>
           </div>
        </div>
      </div>
    </div> 
  ); 
}
