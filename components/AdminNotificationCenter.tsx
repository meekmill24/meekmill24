'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  Info, 
  X,
  ShieldCheck,
  Zap,
  TrendingUp,
  Filter,
  AlertCircle,
  ChevronRight,
  History,
  Wallet,
  ArrowUpFromLine
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type AdminAlert = {
  id: number;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  profile?: { username: string };
};

export default function AdminNotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, user_id, type, amount, status, created_at,
          profile:profiles(username)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        // Map over data to handle case where profile is returned as an array
        const formattedData = data.map((d: any) => ({
          ...d,
          profile: Array.isArray(d.profile) ? d.profile[0] : d.profile
        }));
        setAlerts(formattedData as AdminAlert[]);
      }
    };

    fetchAlerts();

    // Subscribe to new transactions
    const channel = supabase
      .channel('admin:transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions'
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch user profile info since payload doesn't include joined tables
          const { data } = await supabase.from('profiles').select('username').eq('id', payload.new.user_id).single();
          const newAlert = { ...payload.new, profile: data } as AdminAlert;
          setAlerts(prev => [newAlert, ...prev].slice(0, 50));
        } else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => prev.map(a => a.id === payload.new.id ? { ...a, status: payload.new.status } : a));
        } else if (payload.eventType === 'DELETE') {
          setAlerts(prev => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.status === 'pending');

  const getAlertDetails = (alert: AdminAlert) => {
    const isDeposit = alert.type === 'deposit';
    return {
      title: isDeposit ? 'Deposit Request' : 'Withdrawal Request',
      icon: isDeposit ? <Wallet size={18} /> : <ArrowUpFromLine size={18} />,
      colorClass: isDeposit ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' : 'text-blue-400 border-blue-500/20 bg-blue-500/10',
      path: isDeposit ? '/admin/deposits' : '/admin/withdrawals'
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl bg-[#0f0f12] flex items-center justify-center border border-white/5 shadow-lg group relative hover:bg-slate-900 transition-all"
      >
        <Bell className={cn('w-6 h-6 transition-transform text-slate-400', isOpen ? 'rotate-12' : 'group-hover:rotate-12')} />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white animate-pulse">
            {pendingCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-4 w-[380px] bg-slate-900/95 backdrop-blur-3xl border border-slate-800 rounded-[32px] shadow-2xl z-[100] overflow-hidden"
          >
            {/* Dropdown Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/20">
              <div>
                <h3 className="text-sm font-black italic tracking-tighter uppercase text-white">System Events</h3>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Global Action Requests</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFilter(filter === 'all' ? 'pending' : 'all')}
                  className={cn(
                    "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                    filter === 'pending' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                  )}
                  title={filter === 'all' ? "Show Pending Actions" : "Show All"}
                >
                  {filter === 'pending' ? 'Pending Actions' : 'All Events'}
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredAlerts.length > 0 ? (
                <div className="divide-y divide-slate-800/50">
                  {filteredAlerts.map((alert) => {
                     const details = getAlertDetails(alert);
                     return (
                      <div 
                        key={alert.id}
                        className={cn(
                          "p-6 hover:bg-white/[0.02] transition-all cursor-pointer group relative",
                          alert.status === 'pending' && "bg-rose-500/[0.03]"
                        )}
                        onClick={() => {
                            setIsOpen(false);
                            router.push(details.path);
                        }}
                      >
                        <div className="flex gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                            details.colorClass
                          )}>
                            {details.icon}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className={cn(
                                "text-xs font-black uppercase tracking-tight",
                                alert.status === 'pending' ? "text-white" : "text-slate-500"
                              )}>
                                {details.title}
                              </h4>
                              <span className="text-[9px] font-bold text-slate-600 flex items-center gap-1">
                                <Clock size={8} />
                                {new Date(alert.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                              <span className="font-bold text-slate-300">{alert.profile?.username || 'Unknown Node'}</span> initiated a {alert.type.toUpperCase()} for <span className="text-white font-bold">${alert.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </p>
                            
                            {/* Status indicator */}
                            <div className="mt-2 text-[9px] font-black uppercase tracking-[0.2em]">
                              {alert.status === 'pending' ? (
                                <span className="text-rose-500 animate-pulse flex items-center gap-1"><AlertCircle size={10} /> Pending Approval</span>
                              ) : alert.status === 'approved' ? (
                                <span className="text-emerald-500 flex items-center gap-1"><Check size={10} /> Authorized</span>
                              ) : (
                                <span className="text-slate-600 flex items-center gap-1"><X size={10} /> Rejected</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                     );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-800 flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Check size={24} className="text-slate-600" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System is optimal. No events.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-black/20 border-t border-slate-800 flex items-center text-[9px] font-black text-slate-600 uppercase tracking-widest justify-center">
              SYSTEM LOG FEED
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
