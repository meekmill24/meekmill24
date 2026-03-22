'use client';

import { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    Lock, 
    Fingerprint, 
    Smartphone, 
    Key, 
    ChevronRight, 
    ChevronLeft,
    ShieldAlert,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SecurityPage() {
    const router = useRouter();
    const { profile, refreshProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [toggles, setToggles] = useState({
        biometric: false,
        twoFactor: false,
        loginAlerts: true
    });

    useEffect(() => {
        if (profile?.security_settings) {
            setToggles(profile.security_settings);
        }
    }, [profile]);

    const isVerified = profile?.is_verified || false;

    const toggle = async (key: keyof typeof toggles) => {
        if (!isVerified) {
            toast.error("IDENTITY VERIFICATION REQUIRED", {
                description: "Complete your professional node verification to unlock advanced security protocols."
            });
            return;
        }

        const newToggles = { ...toggles, [key]: !toggles[key] };
        setToggles(newToggles);
        
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ security_settings: newToggles })
                .eq('id', profile?.id);
            
            if (error) throw error;
            toast.success(`${key.toUpperCase()} PROTOCOL UPDATED`);
        } catch (error) {
            toast.error("SYNC FAILED");
            setToggles(toggles); // Revert
        }
    };

    const securityNodes = [
        { 
            id: 'biometric', 
            icon: Fingerprint, 
            label: 'Biometric Protocol', 
            desc: 'FaceID / TouchID Node Gateway', 
            active: toggles.biometric,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 border-cyan-500/20'
        },
        { 
            id: 'twoFactor', 
            icon: Smartphone, 
            label: '2FA Auth Node', 
            desc: 'Dual-sequence verification', 
            active: toggles.twoFactor,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10 border-indigo-500/20'
        },
        { 
            id: 'loginAlerts', 
            icon: ShieldAlert, 
            label: 'Node Access Alerts', 
            desc: 'Real-time session monitoring', 
            active: toggles.loginAlerts,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-6 pb-40 space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <ChevronLeft size={20} className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight italic text-indigo-500">Security Node</h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-60">Global Access Protocols</p>
                    </div>
                </div>
            </div>

            {/* Verification Status Card */}
            <div className={`glass-card-strong p-8 rounded-[40px] border transition-all duration-700 ${isVerified ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner ${isVerified ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {isVerified ? <CheckCircle2 size={32} /> : <ShieldAlert size={32} />}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tight italic">
                                {isVerified ? 'Protocol Verified' : 'Compliance Pending'}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic opacity-60 italic">
                                {isVerified ? 'Your corporate node identity is confirmed.' : 'Verification required to enable security nodes.'}
                            </p>
                        </div>
                    </div>
                    {!isVerified && (
                        <Link href="/app/profile/verify">
                            <button className="px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                                Verify Now
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Shield Hero */}
            <div className="glass-card-strong p-12 lg:p-16 rounded-[64px] border border-white/10 bg-indigo-500/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] -mr-40 -mt-40 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                    <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 border border-white/10 shrink-0 transform hover:rotate-6 transition-transform">
                        <Lock size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Asset Shield V4.2</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-xl italic opacity-60">
                            Our neural protection layer ensures institutional-grade security for your corporate assets. All session nodes are end-to-end encrypted.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                             <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black text-indigo-400 italic">
                                <CheckCircle2 size={14} /> TLS 1.3 ACTIVE
                             </div>
                             <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-2xl text-[10px] font-black text-green-400 italic">
                                <ShieldCheck size={14} /> AES-256 SYNCED
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Nodes List */}
            <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] pl-6 italic opacity-50 flex items-center gap-3">
                    <ShieldCheck size={16} /> Authentication Matrix
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {securityNodes.map((node, i) => (
                        <div key={i} className={`glass-card-strong p-8 flex items-center justify-between border border-white/10 rounded-[40px] bg-slate-950/20 group hover:border-white/20 transition-all shadow-xl ${!isVerified ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <div className="flex items-center gap-8">
                                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${node.bg} ${node.color} shadow-inner transition-all group-hover:scale-110`}>
                                    <node.icon size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-white italic uppercase tracking-tight">{node.label}</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic opacity-50">{node.desc}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggle(node.id as any)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${node.active ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5 border border-white/5'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all transform ${node.active ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Critical Action Node */}
            <div className="glass-card-strong p-10 rounded-[48px] border border-rose-500/20 bg-rose-500/5 group hover:bg-rose-500/10 transition-all cursor-pointer shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                            <Key size={28} />
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tight italic">Governance Sequence</h4>
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest italic opacity-60">Update Master Access Key</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic group-hover:text-white transition-colors">Emergency Protocol</span>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-rose-500/20 transition-all">
                             <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-8 rounded-[40px] bg-slate-900/40 border border-white/5 flex items-center justify-center gap-4 text-center">
                <AlertCircle size={20} className="text-slate-600" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic opacity-80 leading-relaxed italic italic">
                    All biometric data is encrypted on the local node. No sensitive biometric identification is transmitted to the neural cloud.
                </p>
            </div>
        </div>
    );
}
