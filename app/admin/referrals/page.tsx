'use client'; 
import React, { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import { Search, Copy, CheckCircle, XCircle, Users, TrendingUp, Share2, Filter, User as UserIcon, ExternalLink } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AdminReferralsPage() { 
  const [referrals, setReferrals] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReferrals = async () => { 
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, phone, referral_code, referred_users_count, referral_earned')
      .order('referred_users_count', { ascending: false }); 
    if (data) setReferrals(data); 
    setLoading(false); 
  }; 

  useEffect(() => { fetchReferrals(); }, []); 

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Referral code copied to clipboard');
  };

  const filteredReferrals = referrals.filter(r => 
    r.referral_code?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return ( 
    <div className="space-y-8 animate-in fade-in duration-500"> 
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"> 
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Affiliate Network</h1> 
          <p className="text-slate-400 mt-1">Monitor growth loops and referral performance.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                 <TrendingUp size={18} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Yield</div>
                 <div className="text-lg font-black text-white italic leading-tight mt-0.5">
                    {referrals.reduce((sum, r) => sum + (Number(r.referred_users_count) || 0), 0)} Leads
                 </div>
              </div>
           </div>
        </div>
      </div> 

      <div className="flex gap-4"> 
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by code or affiliate username..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-3xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium italic" 
          /> 
        </div>
      </div> 

      <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] overflow-hidden backdrop-blur-sm"> 
        <div className="overflow-x-auto">
          <table className="w-full text-sm"> 
            <thead> 
              <tr className="text-left text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800"> 
                <th className="px-8 py-6">Identity</th> 
                <th className="px-8 py-6">Referral Code</th> 
                <th className="px-8 py-6 text-center">Conversion</th> 
                <th className="px-8 py-6">Engagement</th> 
                <th className="px-8 py-6 text-right">Protocol</th> 
              </tr> 
            </thead> 
            <tbody className="divide-y divide-slate-800/50"> 
              {filteredReferrals.map(ref => ( 
                <tr key={ref.id} className="hover:bg-slate-800/30 transition-colors group"> 
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">{ref.username || 'GHOST_USER'}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{ref.phone}</div>
                      </div>
                    </div>
                  </td> 
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => copyCode(ref.referral_code)}
                      className="group flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl hover:border-purple-500/50 transition-all active:scale-95"
                    >
                       <span className="font-mono font-black text-purple-400 italic tracking-widest text-lg">{ref.referral_code}</span>
                       <Copy size={14} className="text-slate-700 group-hover:text-purple-500 transition-colors" />
                    </button>
                  </td> 
                  <td className="px-8 py-6 text-center">
                    <div className="text-2xl font-black text-white italic tracking-tighter">{ref.referred_users_count || 0}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Successful Matches</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      (ref.referred_users_count || 0) > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {(ref.referred_users_count || 0) > 0 ? 'ACTIVE YIELD' : 'DORMANT'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right"> 
                    <button className="p-3 bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-700 hover:text-white transition-all shadow-lg">
                       <ExternalLink size={18} />
                    </button> 
                  </td> 
                </tr> 
              ))} 
              {filteredReferrals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-600 italic font-bold tracking-widest uppercase opacity-40">No affiliate records located in this sector</td>
                </tr>
              )}
            </tbody> 
          </table> 
        </div>
      </div> 
    </div> 
  ); 
}
