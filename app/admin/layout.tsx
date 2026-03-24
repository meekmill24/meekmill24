'use client'; 
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import Link from 'next/link'; 
import { usePathname } from 'next/navigation'; 
import { LayoutDashboard, Users, Layers, Grid3X3, Share2, Receipt, LogOut, DollarSign, Menu, X, ArrowDownToLine, ArrowUpFromLine, Package, Bell, Settings, AlertCircle, Wallet as WalletIcon, } from 'lucide-react'; 
import AnimatePage from '@/components/AnimatePage'; 
import NotificationCenter from '@/components/NotificationCenter';

const navItems = [ 
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' }, 
  { icon: Users, label: 'Users', href: '/admin/users' }, 
  { icon: WalletIcon, label: 'Deposit Wallet', href: '/admin/deposits' }, 
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
  const [pendingCounts, setPendingCounts] = useState({ deposits: 0, withdrawals: 0 });

  useEffect(() => {
    if (!loading) {
      // Check if user is already on the login page
      if (pathname === '/admin/login') {
        // If they are already authenticated as an admin, redirect them out of the login page
        if (user && profile?.role === 'admin') {
          router.replace('/admin');
        }
        return;
      }

      // Normal protection for /admin/* pages:
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

  // Do not render layout shell on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );
  
  if (!user || !profile || profile.role !== 'admin') return null; 

  const totalPending = pendingCounts.deposits + pendingCounts.withdrawals;

  return ( 
    <div className="min-h-screen flex bg-[#0F172A] text-slate-200 relative overflow-x-hidden"> 
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-[76px] left-6 z-50 p-3 bg-purple-600/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 text-white"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="mb-10 px-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Captiv8 Admin
            </h1>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const hasAlert = (item.label === 'Deposit Wallet' && (pendingCounts.deposits > 0 || pendingCounts.withdrawals > 0));
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-purple-400'} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {hasAlert && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {item.label === 'Deposit Wallet' ? (pendingCounts.deposits + pendingCounts.withdrawals) : 0}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button 
            onClick={() => signOut()}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-64 relative z-10 min-h-screen"> 
        <header className="p-6 md:p-8 flex items-center justify-between lg:justify-end border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-30">
          <div className="lg:hidden text-xl font-bold text-purple-400">Captiv8</div>
          <div className="flex items-center gap-4">
            {totalPending > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-xs font-semibold animate-pulse">
                <AlertCircle size={14} />
                <span>{totalPending} Action Needed</span>
              </div>
            )}
            <NotificationCenter />
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-sm font-medium hidden sm:block">
                {profile?.username || 'Admin'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.05),transparent)]"> 
          <div className="max-w-[1600px] mx-auto"> 
            <AnimatePage key={pathname}>{children}</AnimatePage> 
          </div> 
        </div> 
      </main> 
    </div> 
  ); 
}
