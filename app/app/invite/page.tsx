'use client';

import { ArrowLeft, TrendingUp, Copy, CheckCircle, Share2, Users, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Image from 'next/image';

export default function InvitePage() {
    const router = useRouter();
    const { profile, loading } = useAuth();
    const [copied, setCopied] = useState(false);

    const referralCode = profile?.referral_code || profile?.id?.slice(0, 4).toUpperCase() || (loading ? 'SYNCHRONIZING...' : 'N/A');
    const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/sign-up?ref=${referralCode}`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-24 relative overflow-hidden">
            <div className='fixed inset-0 z-0 opacity-10 pointer-events-none'>
                <Image src="/hero-bg.png" alt="Background" fill className="object-cover blur-3xl scale-110" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 px-6 py-8">
                    <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight italic uppercase text-teal-400">Expansion</h1>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] font-mono">Agent Referral Node</p>
                    </div>
                </div>

                <div className="px-6 space-y-8">
                    <div className="bg-gradient-to-br from-teal-500/10 to-blue-600/10 backdrop-blur-2xl rounded-[40px] p-10 border border-teal-500/20 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6 glow-mesh">
                        <div className="w-24 h-24 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-[0_0_50px_rgba(20,184,166,0.3)]">
                            <Rocket size={48} className="text-teal-400 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Share the Protocol</h2>
                            <p className="text-[10px] font-black text-teal-400/60 uppercase tracking-[0.2em]">Earn institutional rewards for every verified agent</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 shadow-2xl space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block ml-2">Verification Code</label>
                            <div className="relative bg-black/40 rounded-3xl p-6 border border-white/5 flex items-center justify-between group overflow-hidden">
                                <span className="text-2xl font-black tracking-[0.3em] text-white italic">{referralCode}</span>
                                <button onClick={() => copyToClipboard(referralCode)} className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all button-shine">
                                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block ml-2">Secure Invite Link</label>
                            <div className="relative bg-black/40 rounded-3xl p-6 border border-white/5 flex items-center justify-between group overflow-hidden">
                                <span className="text-xs font-black tracking-tight text-white/40 truncate max-w-[200px]">{inviteLink}</span>
                                <button onClick={() => copyToClipboard(inviteLink)} className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all button-shine">
                                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900/40 p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center space-y-4">
                            <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center">
                                <Users size={24} className="text-teal-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Active Peers</h4>
                                <p className="text-2xl font-black italic">{profile?.referred_users_count || 0}</p>
                            </div>
                        </div>
                        <div className="bg-zinc-900/40 p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center space-y-4">
                            <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center">
                                <TrendingUp size={24} className="text-teal-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Yield Bonus</h4>
                                <p className="text-2xl font-black italic">${(profile?.referral_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
