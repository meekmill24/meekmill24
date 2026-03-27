'use client';

import { ArrowLeft, Info, Shield, Target, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AboutPage() {
    const router = useRouter();

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
                        <h1 className="text-3xl font-black tracking-tight italic uppercase text-blue-500">Corporate</h1>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] font-mono">Institutional Overview</p>
                    </div>
                </div>

                <div className="px-6 space-y-8">
                    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 shadow-2xl space-y-8">
                        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Info size={40} className="text-blue-500" />
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Our Vision</h2>
                            <p className="text-sm font-bold text-zinc-400 leading-relaxed uppercase tracking-wider">
                                NodeFlow is a global leader in liquidity settlement protocol automation. 
                                We empower individuals and institutions to leverage optimized market flows through our decentralized verification network.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
                                <Shield className="text-blue-500 shrink-0" size={24} />
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Security First</h4>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Multi-layer encryption with institutional escrow standards.</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
                                <Target className="text-blue-500 shrink-0" size={24} />
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Precision Growth</h4>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Algorithmically optimized task sets for maximum yield efficiency.</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
                                <Award className="text-blue-500 shrink-0" size={24} />
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Global Scale</h4>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Operations across 40+ countries with verified settlement cycles.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-blue-500/5 rounded-[40px] border border-blue-500/10 text-center space-y-4">
                        <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.5em] font-mono">Identity Verified • Protocol Active</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase italic tracking-widest">Established 2024 • Settlement Authority V4.2</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
