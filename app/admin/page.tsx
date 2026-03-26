'use client'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import { Users, Layers, Grid3X3, DollarSign, TrendingUp, Share2, ArrowDownToLine, ArrowUpFromLine, Clock, Package, Bell, Activity, ArrowRight, Zap } from 'lucide-react'; 
import Link from 'next/link'; 

interface DashStats { 
  totalUsers: number; 
  totalLevels: number; 
  totalTasks: number; 
  totalReferrals: number; 
  totalDepositsAmount: number; 
  totalWithdrawalsAmount: number; 
  totalCommissions: number; 
  pendingDeposits: number; 
  pendingWithdrawals: number; 
  totalBundles: number; 
  todayProfit: number;
  todayTasks: number;
  todayVolume: number;
} 

interface RecentTransaction { 
  id: number; 
  type: string; 
  amount: number; 
  status: string; 
  created_at: string; 
  profile?: { username: string }; 
} 

export default function AdminDashboard() { 
  const [stats, setStats] = useState<DashStats>({ 
    totalUsers: 0, 
    totalLevels: 0, 
    totalTasks: 0, 
    totalReferrals: 0, 
    totalDepositsAmount: 0, 
    totalWithdrawalsAmount: 0, 
    totalCommissions: 0, 
    pendingDeposits: 0, 
    pendingWithdrawals: 0, 
    totalBundles: 0, 
    todayProfit: 0,
    todayTasks: 0,
    todayVolume: 0,
  }); 
  const [recentTx, setRecentTx] = useState<RecentTransaction[]>([]); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => { 
    const fetchAll = async () => { 
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [ 
        users, levels, tasks, referrals, bundles, 
        deposits, withdrawals, commissions, 
        pendingDeps, pendingWiths, recent,
        allProfiles
      ] = await Promise.all([ 
        supabase.from('profiles').select('*', { count: 'exact', head: true }), 
        supabase.from('levels').select('*', { count: 'exact', head: true }), 
        supabase.from('task_items').select('*', { count: 'exact', head: true }), 
        supabase.from('referral_codes').select('*', { count: 'exact', head: true }), 
        supabase.from('bundle_packages').select('*', { count: 'exact', head: true }), 
        supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'approved'), 
        supabase.from('transactions').select('amount').eq('type', 'withdrawal').eq('status', 'approved'), 
        supabase.from('transactions').select('amount').eq('type', 'commission'), 
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'deposit').eq('status', 'pending'), 
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'withdrawal').eq('status', 'pending'), 
        supabase.from('transactions').select('id, type, amount, status, created_at, profile:profiles(username)').order('created_at', { ascending: false }).limit(8), 
        supabase.from('profiles').select('profit, completed_tasks_count'),
      ]); 

      const [todayTx] = await Promise.all([
        supabase.from('transactions').select('amount').gte('created_at', todayISO).eq('status', 'approved')
      ]);

      const sumAmounts = (data: { amount: number }[] | null) => (data || []).reduce((sum, t) => sum + (t.amount || 0), 0); 

      const todayProfit = (allProfiles.data || []).reduce((sum, p) => sum + (p.profit || 0), 0);
      const todayTasksCount = (allProfiles.data || []).reduce((sum, p) => sum + (p.completed_tasks_count || 0), 0);
      const todayVolume = sumAmounts(todayTx.data);

      setStats({ 
        totalUsers: users.count || 0, 
        totalLevels: levels.count || 0, 
        totalTasks: tasks.count || 0, 
        totalReferrals: referrals.count || 0, 
        totalBundles: bundles.count || 0, 
        totalDepositsAmount: sumAmounts(deposits.data), 
        totalWithdrawalsAmount: sumAmounts(withdrawals.data), 
        totalCommissions: sumAmounts(commissions.data), 
        pendingDeposits: pendingDeps.count || 0, 
        pendingWithdrawals: pendingWiths.count || 0, 
        todayProfit,
        todayTasks: todayTasksCount,
        todayVolume,
      }); 

      if (recent.data) setRecentTx(recent.data as any); 
      setLoading(false); 
    }; 
    fetchAll(); 
  }, []); 

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'blue' },
    { label: 'Today Profit', value: `$${stats.todayProfit.toLocaleString()}`, icon: TrendingUp, color: 'cyan' },
    { label: 'Today Volume', value: `$${stats.todayVolume.toLocaleString()}`, icon: Activity, color: 'purple' },
    { label: 'Today Tasks', value: stats.todayTasks.toLocaleString(), icon: Zap, color: 'amber' },
  ];


  return ( 
    <div className="space-y-8 pb-8"> 
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
          <p className="text-slate-400 mt-1">Platform performance and metrics.</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm group hover:border-purple-500/50 transition-all duration-300">
            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Action Alerts */}
      {(stats.pendingDeposits > 0 || stats.pendingWithdrawals > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.pendingDeposits > 0 && (
            <Link href="/admin/deposits" className="flex items-center justify-between p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl hover:bg-blue-500/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/40">
                  <ArrowDownToLine size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{stats.pendingDeposits} Pending Deposits</h4>
                  <p className="text-blue-200/60 text-sm">Action required to update user balances</p>
                </div>
              </div>
              <ArrowRight className="text-blue-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          {stats.pendingWithdrawals > 0 && (
            <Link href="/admin/withdrawals" className="flex items-center justify-between p-6 bg-red-500/10 border border-red-500/20 rounded-3xl hover:bg-red-500/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/40">
                  <ArrowUpFromLine size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{stats.pendingWithdrawals} Pending Withdrawals</h4>
                  <p className="text-red-200/60 text-sm">Review and process payout requests</p>
                </div>
              </div>
              <ArrowRight className="text-red-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* Platforms Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Layers, label: 'VIP Levels', value: stats.totalLevels, href: '/admin/levels' },
          { icon: Grid3X3, label: 'Task Items', value: stats.totalTasks, href: '/admin/tasks' },
          { icon: Share2, label: 'Referrals', value: stats.totalReferrals, href: '/admin/referrals' },
          { icon: Package, label: 'Bundles', href: '/admin/bundles' },
          { icon: Clock, label: 'T-Records', href: '/admin/record' },
          { icon: Activity, label: 'Activity', href: '/admin/activity' },
        ].map((item, i) => (
          <Link key={i} href={item.href} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-slate-600 transition-colors group">
            <item.icon className="text-slate-500 mb-2 group-hover:text-purple-400 transition-colors" size={20} />
            <span className="text-xs font-medium text-slate-400">{item.label}</span>
            {item.value !== undefined && <span className="text-sm font-bold text-white mt-0.5">{item.value}</span>}
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
          <Link href="/admin/transactions" className="text-purple-400 text-sm font-semibold hover:text-purple-300">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-slate-200 font-medium">{tx.profile?.username || 'Unknown'}</span>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-bold tracking-widest text-slate-400">
                    {tx.type}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    ${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      tx.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      tx.status === 'pending' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {recentTx.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No recent transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div> 
  ); 
}
