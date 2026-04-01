'use client'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import type { Transaction } from '@/lib/types'; 
import { Search, ArrowUpRight, ArrowDownLeft, Snowflake, DollarSign, Filter, RefreshCcw, User as UserIcon, Calendar, Info, Eye, ExternalLink, Trash2 } from 'lucide-react'; 

export default function AdminTransactionsPage() { 
  const [transactions, setTransactions] = useState<(Transaction & { profile?: { username: string } })[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [search, setSearch] = useState(''); 
  const [typeFilter, setTypeFilter] = useState<string>('all'); 

  const fetchTransactions = async () => { 
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, profile:profiles(username)')
      .order('created_at', { ascending: false })
      .limit(200); 
    if (data) setTransactions(data as any); 
    setLoading(false); 
  }; 

  useEffect(() => { fetchTransactions(); }, []); 

  const handleDelete = async (id: number) => { 
    if (!confirm('EXTREME WARNING: Deleting a transaction record does NOT reverse the financial impact on the user balance. Proceed?')) return; 
    await supabase.from('transactions').delete().eq('id', id); 
    fetchTransactions(); 
  }; 

  const filtered = transactions.filter(t => 
    (typeFilter === 'all' || t.type === typeFilter) && 
    (t.description?.toLowerCase().includes(search.toLowerCase()) || 
     t.profile?.username?.toLowerCase().includes(search.toLowerCase()))
  );


  return ( 
    <div className="space-y-8 animate-in fade-in duration-500"> 
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"> 
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Financial Ledger</h1> 
          <p className="text-slate-400 mt-1">Audit log of all platform financial movements.</p>
        </div>
        <button onClick={fetchTransactions} className="p-3 bg-slate-900/50 border border-slate-800 text-slate-400 rounded-2xl hover:text-purple-400 transition-all">
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div> 

      <div className="flex flex-col md:flex-row gap-4"> 
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by user or description..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all" 
          /> 
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)} 
            className="pl-12 pr-10 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-bold uppercase tracking-widest text-xs"
          > 
            <option value="all">Global Ledger</option> 
            <option value="deposit">Deposits Only</option> 
            <option value="withdrawal">Withdrawals Only</option> 
            <option value="commission">Commissions</option> 
            <option value="freeze">Hold / Freeze</option> 
          </select> 
        </div>
      </div> 

      <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-sm"> 
        <div className="overflow-x-auto">
          <table className="w-full text-sm"> 
            <thead> 
              <tr className="text-left text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800"> 
                <th className="px-8 py-6">Identity</th> 
                <th className="px-8 py-6">Classification</th> 
                <th className="px-8 py-6 font-bold text-white">Quantum</th> 
                <th className="px-8 py-6">Evidence</th>
                <th className="px-8 py-6">Manifestation</th> 
                <th className="px-8 py-6 text-right text-rose-500">Purge</th> 
              </tr> 
            </thead> 
            <tbody className="divide-y divide-slate-800/50"> 
              {filtered.map(tx => ( 
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group"> 
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <UserIcon size={14} />
                      </div>
                      <span className="font-bold text-slate-200">{tx.profile?.username || 'System Account'}</span>
                    </div>
                  </td> 
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {tx.type === 'deposit' ? <ArrowDownLeft className="text-green-500" size={14} /> : 
                        tx.type === 'withdrawal' ? <ArrowUpRight className="text-rose-500" size={14} /> :
                        tx.type === 'freeze' ? <Snowflake className="text-blue-400" size={14} /> :
                        <DollarSign className="text-purple-400" size={14} />}
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tx.type}</span>
                    </div>
                  </td> 
                  <td className="px-8 py-6 font-black text-white italic tracking-tight text-lg">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td> 
                  <td className="px-8 py-6">
                    {tx.type === 'deposit' && tx.proof_url ? (
                      <a 
                        href={tx.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2 w-fit"
                      >
                        <Eye size={12} />
                        View Proof
                      </a>
                    ) : (
                      <span className="text-slate-700 text-[10px] italic font-medium opacity-40">—</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[200px] truncate text-xs text-slate-500 font-medium mb-1" title={tx.description}>
                      {tx.description}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <Calendar size={10} />
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right"> 
                    <button onClick={() => handleDelete(tx.id)} className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                       <Trash2 size={16} />
                    </button> 
                  </td> 
                </tr> 
              ))} 
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 italic font-medium">No financial records detected in this audit scope</td>
                </tr>
              )}
            </tbody> 
          </table> 
        </div>
      </div> 
    </div> 
  ); 
}

