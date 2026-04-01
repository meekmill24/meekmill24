'use client'; 
import { useAuth } from '@/context/AuthContext'; 
import { useRouter, usePathname } from 'next/navigation'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import Link from 'next/link'; 
import { 
  LayoutDashboard, Users, Layers, Grid3X3, Share2, Receipt, LogOut, Menu, X, ArrowUpFromLine, Package, Bell, Settings, AlertCircle, Wallet as WalletIcon, ShieldCheck, ChevronLeft
} from 'lucide-react'; 
import AnimatePage from '@/components/AnimatePage'; 
import NotificationCenter from '@/components/NotificationCenter';
import { cn } from '@/lib/utils';

const navItems = [ 
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' }, 
  { icon: Users, label: 'Users', href: '/admin/users' }, 
  { icon: WalletIcon, label: 'Deposits', href: '/admin/deposits' },
  { icon: ArrowUpFromLine, label: 'Withdrawals', href: '/admin/withdrawals' },
  { icon: Package, label: 'Bundles', href: '/admin/bundles' }, 
  { icon: Bell, label: 'Notify Users', href: '/admin/notify' }, 
  { icon: Layers, label: 'Levels', href: '/admin/levels' }, 
  { icon: Grid3X3, label: 'Task Items', href: '/admin/tasks' }, 
  { icon: Share2, label: 'Referrals', href: '/admin/referrals' }, 
  { icon: Receipt, label: 'Transactions', href: '/admin/transactions' }, 
  { icon: Settings, label: 'Settings', href: '/admin/settings' }, 
]; 

export default function AdminLayout({ children }: { children: React.ReactNode }) { 
  const { user, profile, loading, signOut } = useAuth(); 
  const router = useRouter(); 
  const pathname = usePathname(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({ deposits: 0, withdrawals: 0 });

  useEffect(() => {
    if (!loading) {
      if (pathname === '/admin/login') {
        if (user && profile?.role === 'admin') {
          router.replace('/admin');
        }
        return;
      }
      if (!user || !profile || profile.role !== 'admin') {
        router.push('/admin/login');
      }
    }
  }, [user, profile, loading, router, pathname]);

  useEffect(() => {
    const fetchPending = async () => {
      const [deps, withs] = await Promise.all([
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'deposit').eq('status', 'pending'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'withdrawal').eq('status', 'pending'),
      ]);
      setPendingCounts({
        deposits: deps.count || 0,
        withdrawals: withs.count || 0,
      });
    };
    if (user && profile?.role === 'admin' && pathname !== '/admin/login') fetchPending();
  }, [user, profile, pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="w-16 h-16 rounded-3xl bg-purple-600/20 flex items-center justify-center text-purple-500">
              <ShieldCheck size={32} />
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500/60">Establishing Root Node...</span>
        </div>
      </div>
    );
  }
  
  if (!user || !profile || profile.role !== 'admin') return null; 

  const totalPending = pendingCounts.deposits + pendingCounts.withdrawals;

  return ( 
    <div className="min-h-screen flex bg-[#0a0a0c] text-slate-200 relative overflow-x-hidden"> 
      {/* Mobile Control Handle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-4 bg-purple-600 rounded-2xl shadow-2xl transition-all active:scale-95"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Command Center */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] bg-[#0f0f12] border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isCollapsed ? "w-24" : "w-72",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-full flex flex-col p-6">
          {/* Collapse Toggle Handle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-purple-600 rounded-full items-center justify-center text-white border-4 border-[#0a0a0c] z-[80] hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} className={cn("transition-transform duration-500", isCollapsed && "rotate-180")} />
          </button>

          <div className={cn("mb-12 px-2 transition-all duration-500", isCollapsed ? "opacity-0 scale-50" : "opacity-100")}>
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent italic tracking-tighter">
              HUB_ROOT
            </h1>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1 ml-1">Admin Command Center</p>
          </div>

          <nav className="flex-1 space-y-2 no-scrollbar overflow-y-auto pr-2 -mr-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-4 rounded-[24px] transition-all duration-300 group",
                    isActive ? "bg-purple-600 text-white shadow-[0_10px_40px_rgba(147,51,234,0.3)] scale-[1.02]" : "hover:bg-white/[0.03] text-slate-500 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={22} className={cn("transition-colors", isActive ? "text-white" : "text-slate-600 group-hover:text-purple-400")} />
                    {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <>
                      {item.label === 'Deposits' && pendingCounts.deposits > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black italic text-white animate-pulse">
                          {pendingCounts.deposits}
                        </span>
                      )}
                      {item.label === 'Withdrawals' && pendingCounts.withdrawals > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black italic text-white animate-pulse">
                          {pendingCounts.withdrawals}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          <button 
            onClick={() => signOut()}
            className="mt-6 flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">Terminate Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Terminal */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-500 relative z-10 min-h-screen",
        isCollapsed ? "lg:ml-24" : "lg:ml-72"
      )}> 
        <header className="p-8 flex items-center justify-between border-b border-white/[0.03] backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SYSTEM_OPTIMIZED</span>
             </div>
          </div>

          <div className="flex items-center gap-6">
            {totalPending > 0 && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                <AlertCircle size={14} />
                <span>{totalPending} ACTIONS_PENDING</span>
              </div>
            )}
            <NotificationCenter />
            <div className="flex items-center gap-4 px-5 py-2.5 bg-white/[0.02] rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-black shadow-lg">
                {profile?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest hidden sm:block italic">
                {profile?.username || 'Admin'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.03),transparent)]"> 
          <div className="max-w-[1600px] mx-auto"> 
            <AnimatePage key={pathname}>{children}</AnimatePage> 
          </div> 
        </div> 
      </main> 
    </div> 
  ); 
}
