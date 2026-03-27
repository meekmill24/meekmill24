'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldCheck, Scale, FileText, Lock, AlertCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header Node */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <button 
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-black italic tracking-tighter uppercase">Regulatory Protocol</h1>
            </div>

            <div className="p-6 max-w-2xl mx-auto space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400 border border-cyan-500/20">
                        <Scale size={32} />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">User Agreement</h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Version 2.4.0 • Institutional Compliance</p>
                </div>

                <div className="space-y-8 text-zinc-400 text-sm leading-relaxed italic font-medium">
                    <section className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-white uppercase font-black text-xs tracking-widest">
                            <ShieldCheck size={16} className="text-cyan-400" />
                            Welcome to NodeFlow
                        </div>
                        <p>
                            To protect the security of personal information between the website and merchants, you must carefully read the "Terms and Conditions" of the platform. It is very important to fully understand the Terms and Conditions, especially the Terms of Service and any related restrictions.
                        </p>
                        <p className="text-cyan-400/80">
                            By using this website, you confirm that you are over 18 years old and have read and agreed to the Terms and Conditions.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-white font-black uppercase tracking-widest border-l-2 border-cyan-500 pl-4">1. Start Maintenance Products</h3>
                        <div className="space-y-2 pl-4">
                            <p>1.1) Before starting a new round of maintenance, the account balance must be at least 100 USDT.</p>
                            <p>1.2) A new maintenance product requires a balance of at least 100 USDT to reset the counter.</p>
                            <p>1.3) After the agent/user completes the full set of maintenance tasks, he/she can choose to withdraw the balance and recharge the account to reset the account.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-white font-black uppercase tracking-widest border-l-2 border-cyan-500 pl-4">2. Staff Levels</h3>
                        <div className="space-y-2 pl-4">
                            <p>2.1) Automatic promotion to mid-level at 500 USDT. Senior Staff promotion requires application at 1500 USDT. Mentor Staff at 5000 USDT.</p>
                            <p>2.3) Choosing to abandon or exit the maintenance process will result in ineligibility to apply for exit or refund.</p>
                            <p>2.5) Credit score must be 100% to initiate a withdrawal.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-white font-black uppercase tracking-widest border-l-2 border-cyan-500 pl-4">3. Financial Security</h3>
                        <div className="space-y-2 pl-4">
                            <p>3.2) All data will be automatically processed by the system without manual intervention.</p>
                            <p className="text-emerald-400 font-bold">3.3) The platform bears full responsibility for any unexpected financial losses.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-white font-black uppercase tracking-widest border-l-2 border-cyan-500 pl-4">5. Standard Products</h3>
                        <p className="pl-4">Ordinary maintenance plans yield 0.4% rebate. Super Orders (randomly allocated) yield more than 2.4% rebate. Super orders are a combination of 1-3 products.</p>
                    </section>

                    <section className="space-y-4 border-y border-white/5 py-8">
                        <h3 className="text-white font-black uppercase tracking-widest border-l-2 border-cyan-500 pl-4">9. Humanitarian Protocol</h3>
                        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                             <div className="flex items-center gap-3 mb-3">
                                <Globe size={18} className="text-rose-400" />
                                <span className="text-rose-200 font-black text-xs uppercase tracking-widest text-white">Section 9.4: WFP Integration</span>
                             </div>
                             <p className="text-rose-200/70 text-xs italic">
                                If the system detects 72 hours of inactivity with a credit score below 90, the system will donate all the funds in the account to the World Food Program (WFP).
                             </p>
                             <a 
                                href="https://www.wfp.org" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white underline underline-offset-4"
                             >
                                Visit WFP.ORG
                             </a>
                        </div>
                    </section>

                    <section className="space-y-4 pb-10">
                        <h3 className="text-white font-black uppercase tracking-widest border-l-2 border-cyan-500 pl-4">11. Taxation Protocol</h3>
                        <p className="pl-4 italic">
                            When merchant account funds reach tax standard (10K+), corresponding taxes must be paid. The company processes taxes uniformly for global employees and provides certificates via CS.
                        </p>
                    </section>
                </div>

                <div className="pt-10 border-t border-white/5 text-center">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">© 2024 NodeFlow Institutional Compliance Hub</p>
                </div>
            </div>
        </div>
    );
}
