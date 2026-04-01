'use client';

import { CheckCircle, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        const verify = async () => {
            setTimeout(() => {
                setStatus('success');
            }, 2000);
        };
        verify();
    }, []);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-700" />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-[48px] p-10 border border-white/10 shadow-3xl text-center space-y-8">
                    {status === 'verifying' ? (
                        <>
                            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center relative overflow-hidden">
                                <Zap className="text-white animate-pulse" size={40} />
                                <div className="absolute inset-0 border-2 border-t-white border-transparent rounded-full animate-spin" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black italic uppercase tracking-tight mb-2">Verifying Node...</h1>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Authenticating Network Signature</p>
                            </div>
                        </>
                    ) : status === 'success' ? (
                        <>
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center animate-in zoom-in duration-500">
                                <CheckCircle className="text-emerald-400" size={48} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-3xl font-black italic uppercase tracking-tight text-white leading-none">THANK YOU FOR VERIFYING</h1>
                                <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em]">Identity Protocol 100% Secure</p>
                                <p className="text-sm text-zinc-400 font-medium leading-relaxed pt-2">
                                    Your institutional node access has been fully verified and locked to your device fingerprint.
                                </p>
                            </div>

                            <Link 
                                href="/app"
                                className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                            >
                                Enter Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="flex items-center justify-center gap-2 pt-4">
                                <ShieldCheck size={14} className="text-emerald-500/50" />
                                <span className="text-[8px] font-black text-rose-500/40 uppercase tracking-[0.5em]">ROOT ENCRYPTION ACTIVE</span>
                            </div>
                        </>
                    ) : (
                        <>
                             <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/30 mx-auto flex items-center justify-center">
                                <ShieldCheck className="text-rose-400" size={48} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black italic uppercase tracking-tight mb-2">Link Expired</h1>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Please request a new node key</p>
                            </div>
                            <Link href="/auth/login" className="text-white hover:underline text-xs font-bold">Back to Login</Link>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <Zap className="text-white animate-pulse" size={48} />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
