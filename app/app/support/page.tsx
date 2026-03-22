'use client';

import { HeadphonesIcon, ChevronLeft, MessageSquare, Mail, Phone, Clock, ChevronRight, Zap, Target, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const WHATSAPP_NUMBER = '1234567890';
const WHATSAPP_MESSAGE = 'Hello, I need help with my Captiv8 AI Node account.';
const TAWK_TO_LINK = '#tawk';

const channels = [
    {
        icon: MessageSquare,
        title: 'Neural Chat Support',
        subtitle: 'Avg. latency: 45ms (Live Node)',
        color: 'bg-indigo-500/20 text-indigo-400',
        badge: 'Online Now',
        badgeColor: 'bg-green-500/20 text-green-500',
        action: TAWK_TO_LINK,
        target: '_blank',
        description: 'Instant verification for account-level queries and transactional support.'
    },
    {
        icon: Phone,
        title: 'Priority WhatsApp',
        subtitle: 'Direct encrypted channel',
        color: 'bg-green-500/20 text-green-500',
        badge: 'Secure',
        badgeColor: 'bg-green-500/20 text-green-500',
        action: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
        target: '_blank',
        description: 'Fast-track communication for VIP tier members and corporate wallet synchronization.'
    },
    {
        icon: Mail,
        title: 'Governance Email',
        subtitle: 'support@captiv8.ai',
        color: 'bg-purple-500/20 text-purple-400',
        badge: '24h SLA',
        badgeColor: 'bg-purple-500/20 text-purple-400',
        action: 'mailto:support@captiv8.ai',
        target: '_self',
        description: 'In-depth inquiries regarding institutional partnership and legal compliance.'
    },
];

export default function CustomerServicePage() {
    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500 space-y-12 px-4 md:px-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/app" className="p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <ChevronLeft size={20} className="text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">Concierge Hub</h1>
                        <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-[0.4em] opacity-60">Governance & Support Gateway</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">Agents Active</span>
                </div>
            </div>

            {/* Support Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Hero Card */}
                <div className="lg:col-span-2 glass-card-strong p-12 relative overflow-hidden flex flex-col justify-between border-indigo-500/20 rounded-[48px] bg-indigo-500/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -mr-48 -mt-48" />

                    <div className="relative z-10 space-y-10">
                        <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-indigo-500/20 border border-white/10">
                            <HeadphonesIcon size={40} className="text-white drop-shadow-xl" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Node Assistance <br/> Required?</h2>
                            <p className="text-slate-400 text-xs md:text-sm uppercase font-bold tracking-[0.2em] opacity-80 max-w-lg leading-relaxed">
                                Captiv8 technicians are monitoring neural optimization processes in real-time. Select a dedicated priority node below.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-8 pt-10 mt-12 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <Activity size={16} className="text-indigo-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Uptime: 99.99%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={16} className="text-green-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AES-256 Verified</span>
                        </div>
                    </div>
                </div>

                {/* Operations Hours Card */}
                <div className="glass-card-strong p-10 flex flex-col justify-between border border-white/10 text-center md:text-left rounded-[48px] bg-slate-950/20">
                    <div className="space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto md:mx-0 shadow-inner">
                            <Clock size={28} className="text-slate-500" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">System Status</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed opacity-60 italic">
                            Platform maintenance typically occurs between 02:00 - 04:00 AM (UTC). Support channels remain persistent.
                        </p>
                    </div>
                    <div className="pt-10 border-t border-white/5 space-y-2">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] block opacity-50">Local Protocol</span>
                        <p className="text-2xl font-black text-white uppercase tracking-tight italic">ACTIVE_NODE</p>
                    </div>
                </div>

            </div>

            {/* Support Channels List */}
            <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] pl-4 opacity-50 flex items-center gap-3 italic">
                    <Target size={16} /> Priority Support Nodes
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {channels.map((c, idx) => {
                        const isTawk = c.action === TAWK_TO_LINK;
                        const Component = isTawk ? 'button' : 'a';
                        const props = isTawk
                            ? { onClick: () => (window as any).Tawk_API?.maximize() }
                            : { href: c.action, target: c.target };

                        return (
                            <Component
                                key={idx}
                                {...props}
                                className="w-full text-left group glass-card-strong p-8 flex flex-col md:flex-row items-center gap-8 hover:border-indigo-500/30 transition-all rounded-[40px] animate-in slide-in-from-bottom-4 duration-500"
                            >
                                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 transition-all group-hover:scale-110 group-hover:rotate-6 ${c.color} shadow-2xl shadow-black/40 border border-white/5`}>
                                    <c.icon size={32} />
                                </div>
                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <div className="flex flex-col md:flex-row items-center gap-4">
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tight italic">{c.title}</h4>
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${c.badgeColor}`}>{c.badge}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic opacity-80">{c.subtitle}</p>
                                    <p className="text-[12px] font-bold text-slate-600 hidden md:block uppercase tracking-widest opacity-40 leading-relaxed max-w-2xl italic">
                                        {c.description}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all border border-white/5">
                                    <ChevronRight size={24} className="text-slate-600 group-hover:text-white transition-colors" />
                                </div>
                            </Component>
                        );
                    })}
                </div>
            </div>

            {/* Quick Resolution Notice */}
            <div className="px-8 py-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[30px] flex items-center justify-center gap-4 shadow-inner">
                <Zap size={16} className="text-indigo-400 animate-pulse" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-70 italic text-center md:text-left">
                    AGENT TIP: Consult the <Link href="/app/faq" className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/30 underline-offset-4">Knowledge Base</Link> for instant node resolutions.
                </p>
            </div>

        </div>
    );
}
