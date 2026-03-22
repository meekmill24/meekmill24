'use client'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import { Check, X, Search, ArrowDownToLine, Clock, Wallet, User as UserIcon, AlertCircle, Loader2, Eye, ExternalLink } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AdminDepositsPage() { 
  const [deposits, setDeposits] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchDeposits = async () => { 
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, profile:profiles(username, wallet_balance)')
      .eq('type', 'deposit')
      .order('created_at', { ascending: false }); 
    if (data) setDeposits(data); 
    setLoading(false); 
  }; 

  useEffect(() => { fetchDeposits(); }, []); 

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

  if (loading && deposits.length === 0) return <div className="text-center py-20 text-slate-500 italic">Scanning for deposit requests...</div>;

  return ( 
    <div className="space-y-8 animate-in fade-in duration-500"> 
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight italic uppercase">Deposit Requests</h2>
        <p className="text-slate-400 mt-1">Review and approve incoming funds to user wallets.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                <th className="px-4 md:px-8 py-6">Timestamp / ID</th>
                <th className="px-4 md:px-8 py-6">Beneficiary</th>
                <th className="px-4 md:px-8 py-6 font-bold text-white">Amount</th>
                <th className="px-4 md:px-8 py-6">Evidence</th>
                <th className="px-4 md:px-8 py-6">Current Status</th>
                <th className="px-4 md:px-8 py-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {deposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-4 md:px-8 py-6 text-slate-500 font-mono text-xs">
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="text-slate-700" />
                       {new Date(dep.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className="mt-1 text-[10px] opacity-30">TXN-{dep.id.toString().padStart(6, '0')}</div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <UserIcon size={14} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">{dep.profile?.username}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Bal: ${dep.profile?.wallet_balance?.toLocaleString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6 font-black text-white text-lg italic tracking-tight">
                    ${dep.amount.toLocaleString()}
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    {dep.proof_url ? (
                      <a 
                        href={dep.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2 w-fit"
                      >
                        <Eye size={12} />
                        View Proof
                      </a>
                    ) : (
                      <span className="text-slate-700 text-[10px] italic font-medium">No proof uploaded</span>
                    )}
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      dep.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      dep.status === 'pending' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
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
                          className="p-3 bg-green-500/10 text-green-500 rounded-2xl hover:bg-green-500 hover:text-white transition-all shadow-lg hover:shadow-green-900/40 disabled:opacity-50"
                        >
                          {processingId === dep.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                        </button>
                        <button 
                          disabled={processingId === dep.id}
                          onClick={() => handleAction(dep.id, 'rejected', dep.amount, dep.user_id)} 
                          className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-900/40 disabled:opacity-50"
                        >
                          {processingId === dep.id ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 italic text-[10px] font-bold uppercase tracking-widest">Completed</div>
                    )}
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 font-medium italic">No deposit requests recorded in the system</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div> 
  ); 
}
