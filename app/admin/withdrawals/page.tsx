'use client'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import { Check, X, Search, ArrowUpFromLine, Clock, Wallet, User as UserIcon, AlertTriangle, Loader2 } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AdminWithdrawalsPage() { 
  const [withdrawals, setWithdrawals] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchWithdrawals = async () => { 
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*, profile:profiles(username, wallet_balance, withdrawal_wallet_address)')
      .eq('type', 'withdrawal');

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data } = await query.order('created_at', { ascending: false }); 
    if (data) setWithdrawals(data); 
    setLoading(false); 
  }; 

  useEffect(() => { fetchWithdrawals(); }, [statusFilter]); 

  const handleAction = async (id: number, status: 'approved' | 'rejected', amount: number, userId: string) => { 
    setProcessingId(id);
    try {
      const { data, error } = await supabase.rpc('handle_withdrawal_action', {
        p_transaction_id: id,
        p_status: status
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);

      if (status === 'rejected') { 
        toast.info(`Withdrawal for $${amount} rejected and refunded.`);
      } else {
        toast.success(`Withdrawal for $${amount} marked as processed.`);
      }
      fetchWithdrawals(); 
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  }; 



  return ( 
    <div className="space-y-8 animate-in fade-in duration-500"> 
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight italic uppercase">Withdrawal Requests</h2>
          <p className="text-slate-400 mt-1">Review and process fund disbursement requests to external wallets.</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl gap-1">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={`
                px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${statusFilter === s ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                <th className="px-4 md:px-8 py-6">Timestamp / ID</th>
                <th className="px-4 md:px-8 py-6">Beneficiary & Destination Node</th>
                <th className="px-4 md:px-8 py-6 font-bold text-white">Quantum</th>
                <th className="px-4 md:px-8 py-6">Status</th>
                <th className="px-4 md:px-8 py-6 text-right">Approval Cycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {withdrawals.map((withd) => (
                <tr key={withd.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-4 md:px-8 py-6 text-slate-500 font-mono text-xs">
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="text-slate-700" />
                       {new Date(withd.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className="mt-1 text-[10px] opacity-30">OUT-{withd.id.toString().padStart(6, '0')}</div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <UserIcon size={14} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="font-bold text-slate-200">{withd.profile?.username}</div>
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] text-rose-400 font-black font-mono tracking-tighter bg-rose-500/10 px-2 py-1 rounded-xl border border-rose-500/20 w-fit">
                            {withd.wallet_address || withd.profile?.withdrawal_wallet_address || 'UNSET'}
                          </code>
                          {(withd.network || withd.profile?.wallet_network) && (
                            <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{withd.network || withd.profile?.wallet_network}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6 font-black text-rose-500 text-lg italic tracking-tight">
                    ${withd.amount.toLocaleString()}
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      withd.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      withd.status === 'pending' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {withd.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-6 text-right">
                    {withd.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          disabled={processingId === withd.id}
                          onClick={() => handleAction(withd.id, 'approved', withd.amount, withd.user_id)} 
                          className="p-3 bg-green-500/10 text-green-500 rounded-2xl hover:bg-green-500 hover:text-white transition-all shadow-lg hover:shadow-green-900/40 disabled:opacity-50"
                        >
                          {processingId === withd.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                        </button>
                        <button 
                          disabled={processingId === withd.id}
                          onClick={() => handleAction(withd.id, 'rejected', withd.amount, withd.user_id)} 
                          className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-900/40 disabled:opacity-50"
                        >
                          {processingId === withd.id ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 italic text-[10px] font-bold uppercase tracking-widest">Disbursed</div>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 font-medium italic">No payout requests pending review</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div> 
  ); 
}
