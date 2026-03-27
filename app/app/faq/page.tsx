'use client';

import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

const FAQS = [
    {
        q: "What is the NodeFlow Node System?",
        a: "NodeFlow is a decentralized task-verification protocol. You generate yield by providing computational verification to institutional market bundles."
    },
    {
        q: "How to bind my corporate wallet?",
        a: "Navigate to Financial Hub -> Payment Node. Select your network (USDT-TRC20, USDC, etc.) and paste your destination address. This is a one-time secure binding."
    },
    {
        q: "What are 'Lucky Bundles'?",
        a: "Institutional bundles are high-yield task clusters that provide significantly higher commission rates. They are triggered algorithmically based on node activity."
    },
    {
        q: "Withdrawal Protocols",
        a: "Payouts are synchronized within 24 hours. The institutional minimum for settlement is $30.00 USDT."
    },
    {
        q: "Globalization & Language",
        a: "NodeFlow operates primarily in English (US) for global compliance and institutional standard uniformity."
    }
];

export default function FAQPage() {
    const router = useRouter();
    const [openIdx, setOpenIdx] = useState<number | null>(0);

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
                        <h1 className="text-3xl font-black tracking-tight italic uppercase text-purple-500">FAQ HUB</h1>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] font-mono">Knowledge Base Protocol</p>
                    </div>
                </div>

                <div className="px-6 space-y-4">
                    {FAQS.map((faq, idx) => (
                        <div key={idx} className="bg-zinc-900/60 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl transition-all">
                            <button 
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full p-8 flex items-center justify-between text-left group"
                            >
                                <span className="text-xs font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">{faq.q}</span>
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                    {openIdx === idx ? <ChevronUp size={20} className="text-purple-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
                                </div>
                            </button>
                            {openIdx === idx && (
                                <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed tracking-wider">{faq.a}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
