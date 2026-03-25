'use client'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import { Check, X, Search, ArrowDownToLine, Clock, Wallet, User as UserIcon, AlertCircle, Loader2, Eye, ExternalLink } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AdminDepositsPage() { 
  const [deposits, setDeposits] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchDeposits = async () => { 
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*, profile:profiles(username, wallet_balance)')
      .eq('type', 'deposit');
    
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query.order('created_at', { ascending: false }); 
    if (data) setDeposits(data); 
    setLoading(false); 
  }; 

  useEffect(() => { fetchDeposits(); }, [statusFilter]); 

  const handleAction = async (id: number, status: 'approved' | 'rejected', amount: number, userId: string) => { 
    setProcessingId(id);
    try {
      const { data, error } = await supabase.rpc('handle_deposit_action', {
        p_transaction_id: id,
        p_status: status
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);

      if (status === 'approved') { 
        toast.success(`Deposit of $${amount} approved.`);
      } else {
        toast.error(`Deposit of $${amount} rejected.`);
      }
      fetchDeposits(); 
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  }; 



  return ( 
    <div className="space-y-8 animate-in fade-in duration-500"> 
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">Deposit Requests</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Review and approve incoming funds to user wallets.</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl gap-1">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={`
                px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${statusFilter === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ArrowDownToLine size={200} className="text-white" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] border-b border-white/[0.05] bg-white/[0.02]">
                <th className="px-4 md:px-8 py-6">Timestamp / ID</th>
                <th className="px-4 md:px-8 py-6">Beneficiary</th>
                <th className="px-4 md:px-8 py-6 font-bold text-white">Amount</th>
                <th className="px-4 md:px-8 py-6">Evidence</th>
                <th className="px-4 md:px-8 py-6">Current Status</th>
                <th className="px-4 md:px-8 py-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {deposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 md:px-8 py-6 text-slate-400 font-mono text-[11px] font-bold">
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="text-purple-500" />
                       {new Date(dep.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className="mt-1 text-[9px] opacity-40 uppercase tracking-widest">TXN-{dep.id.toString().padStart(6, '0')}</div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-white font-black italic shadow-inner">
                        {dep.profile?.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-slate-200 uppercase italic tracking-tight">{dep.profile?.username}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">Balance: ${dep.profile?.wallet_balance?.toLocaleString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6 font-black text-white text-xl italic tracking-tighter">
                    ${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    {dep.proof_url ? (
                      <a 
                        href={dep.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-400 transition-all flex items-center gap-2 w-fit shadow-lg shadow-purple-500/20 active:scale-95"
                      >
                        <Eye size={12} />
                        View Proof
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold italic uppercase tracking-widest">
                        <AlertCircle size={12} /> No Evidence
                      </div>
                    )}
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                      dep.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      dep.status === 'pending' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse' : 
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-6 text-right">
                    {dep.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          disabled={processingId === dep.id}
                          onClick={() => handleAction(dep.id, 'approved', dep.amount, dep.user_id)} 
                          className="p-3 bg-white text-black rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-90 disabled:opacity-50"
                        >
                          {processingId === dep.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} strokeWidth={3} />}
                        </button>
                        <button 
                          disabled={processingId === dep.id}
                          onClick={() => handleAction(dep.id, 'rejected', dep.amount, dep.user_id)} 
                          className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10 active:scale-90 disabled:opacity-50"
                        >
                          {processingId === dep.id ? <Loader2 className="animate-spin" size={20} /> : <X size={20} strokeWidth={3} />}
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 italic text-[10px] font-black uppercase tracking-widest">Processed</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deposits.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center justify-center p-10">
                <div className="w-20 h-20 rounded-[32px] bg-slate-800/50 flex items-center justify-center text-slate-700 mb-6 border border-white/5 shadow-inner">
                    <ArrowDownToLine size={40} />
                </div>
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">No Active Solicitations</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Awaiting Participant Node Funding</p>
            </div>
          )}
        </div>
      </div>
    </div> 
  ); 
}
