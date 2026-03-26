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
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
};

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n));
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id === payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user?.id)
      .eq('is_read', false);
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const clearAll = async () => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user?.id);
    if (!error) {
      setNotifications([]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group relative hover:bg-white/10 transition-all"
      >
        <Bell className={cn('w-6 h-6 transition-transform', isOpen ? 'rotate-12' : 'group-hover:rotate-12')} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-4 w-[380px] bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-3xl z-[100] overflow-hidden"
          >
            {/* Dropdown Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-black italic tracking-tighter uppercase">Notifications</h3>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">System Audit Center</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                  className={cn(
                    "p-2 rounded-xl border border-white/5 transition-all",
                    filter === 'unread' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-white/5 text-zinc-400"
                  )}
                  title={filter === 'all' ? "Show Unread" : "Show All"}
                >
                  <Filter size={14} />
                </button>
                <button 
                  onClick={clearAll}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                  title="Clear All"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "p-6 hover:bg-white/[0.02] transition-all cursor-pointer group relative",
                        !notification.is_read && "bg-cyan-500/[0.03]"
                      )}
                      onClick={() => {
                          if (!notification.is_read) markAsRead(notification.id);
                          setExpandedId(expandedId === notification.id ? null : notification.id);
                      }}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                          notification.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          notification.type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          notification.type === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                          "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                        )}>
                          {notification.type === 'success' ? <ShieldCheck size={18} /> :
                           notification.type === 'warning' ? <AlertCircle size={18} /> :
                           notification.type === 'error' ? <X size={18} /> :
                           <Info size={18} />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              "text-xs font-black uppercase tracking-tight",
                              !notification.is_read ? "text-white" : "text-zinc-400"
                            )}>
                              {notification.title}
                            </h4>
                            <span className="text-[9px] font-bold text-zinc-600 flex items-center gap-1">
                              <Clock size={8} />
                              {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={cn(
                              "text-[11px] text-zinc-500 font-medium leading-relaxed italic transition-all",
                              expandedId !== notification.id && "line-clamp-2"
                          )}>
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="absolute top-1/2 -right-1 w-1 h-8 bg-cyan-500 rounded-full -translate-y-1/2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4 opacity-20">
                    <Bell size={24} className="text-zinc-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">No active alerts detected</p>
                </div>
              )}
            </div>

            {/* View All Utility */}
            <div className="p-4 bg-white/[0.04] border-t border-white/5">
                <Link 
                  href="/app/notifications" 
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <History size={16} className="text-cyan-500" />
                    <span>View Audit Trail</span>
                  </div>
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
