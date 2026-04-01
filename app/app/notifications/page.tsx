'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  ArrowLeft, 
  Trash2, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Info, 
  AlertCircle, 
  X,
  Search,
  Filter,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (data) setNotifications(data);
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
        
        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    const markAllRead = async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user?.id)
            .eq('is_read', false);
        
        if (!error) {
            toast.success("Protocol synchronization complete.");
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
        
        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const filtered = filter === 'all' 
        ? notifications 
        : notifications.filter(n => !n.is_read);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-32 relative overflow-hidden">
            {/* Ambient Background */}
            <div className='fixed inset-0 z-0 opacity-10 pointer-events-none'>
                <Image src="/hero-bg.png" alt="Background" fill className="object-cover blur-3xl scale-110" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 lg:px-12 py-10 lg:py-16">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => router.back()} 
                            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                        >
                            <ArrowLeft size={28} />
                        </button>
                        <div>
                            <h1 className="text-3xl lg:text-5xl font-black tracking-tight italic uppercase text-cyan-500">Audit Trail</h1>
                            <p className="text-[10px] lg:text-xs font-black text-zinc-500 uppercase tracking-[0.4em] mt-1 opacity-60">Neural System Notifications</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                filter === 'unread' 
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                                : 'bg-white/5 border-white/10 text-zinc-500'
                            }`}
                        >
                            {filter === 'all' ? 'Filter Unread' : 'Show All'}
                        </button>
                        <button 
                            onClick={markAllRead}
                            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-zinc-400"
                            title="Synchronize All"
                        >
                            <CheckCircle size={24} />
                        </button>
                    </div>
                </div>

                {/* Notification List */}
                <div className="px-6 lg:px-12 max-w-5xl mx-auto space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Zap className="w-12 h-12 text-cyan-500 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Retrieving Protocol Logs...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 rounded-[56px] border border-dashed border-white/5 bg-white/[0.01]">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 opacity-20">
                                <Bell size={32} className="text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-700 uppercase italic">Zero Alerts Detected</h3>
                            <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mt-2">{filter === 'unread' ? 'Neural registry is fully synchronized' : 'Audit trail is currently empty'}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((notification) => (
                                <div 
                                    key={notification.id}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    className={`group relative p-8 rounded-[40px] border transition-all cursor-pointer ${
                                        !notification.is_read 
                                        ? 'bg-zinc-900 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02]' 
                                        : 'bg-zinc-900/40 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <div className="flex gap-8">
                                        <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:rotate-6 ${
                                            notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            notification.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                            notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                            'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                        }`}>
                                            {notification.type === 'success' ? <ShieldCheck size={28} /> :
                                             notification.type === 'warning' ? <AlertCircle size={28} /> :
                                             notification.type === 'error' ? <X size={28} /> :
                                             <Info size={28} />}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h4 className={`text-xl font-black uppercase italic tracking-tight ${!notification.is_read ? 'text-white' : 'text-zinc-500'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[9px] font-black text-zinc-600 flex items-center gap-2 uppercase tracking-widest">
                                                            <Clock size={12} />
                                                            {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {!notification.is_read && (
                                                            <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[8px] font-black uppercase">Unread</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-700 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-95"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <p className={`text-sm lg:text-base font-medium leading-relaxed italic ${!notification.is_read ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {!notification.is_read && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-cyan-500 rounded-r-full shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
