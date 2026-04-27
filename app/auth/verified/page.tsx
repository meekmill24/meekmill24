'use client';

import { CheckCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifiedPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('u');
    const [isUpdating, setIsUpdating] = useState(!!userId);

    useEffect(() => {
        if (userId) {
            fetch('/api/auth/complete-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            }).finally(() => {
                setIsUpdating(false);
            });
        }
    }, [userId]);
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0b] py-12">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#007CBA]/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-700" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-lg px-6 z-10 text-center space-y-8"
            >
                {/* Visual Icon */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-[#007CBA]/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-32 h-32 rounded-full border-2 border-[#007CBA]/30 bg-white/5 flex items-center justify-center shadow-2xl">
                        <CheckCircle className="w-16 h-16 text-green-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                        {isUpdating ? 'Synchronizing Node' : 'Email Verified'}
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] opacity-80">
                        {isUpdating ? 'Finalizing registry update...' : 'Institutional node synchronization complete'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                     <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[24px] text-left space-y-2">
                        <ShieldCheck className="text-cyan-400 w-6 h-6" />
                        <h3 className="text-white font-black uppercase text-[10px] tracking-widest">Security Active</h3>
                        <p className="text-slate-500 text-[10px] font-bold">Encrypted communication channel established.</p>
                     </div>
                     <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[24px] text-left space-y-2">
                        <Sparkles className="text-purple-400 w-6 h-6" />
                        <h3 className="text-white font-black uppercase text-[10px] tracking-widest">Protocol Ready</h3>
                        <p className="text-slate-500 text-[10px] font-bold">Optimization sets are available for processing.</p>
                     </div>
                </div>

                <div className="pt-8">
                    <Link href="/auth/login" className="inline-flex items-center gap-3 px-12 py-5 bg-[#007CBA] hover:bg-[#0091ff] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#007CBA]/30 transition-all hover:scale-[1.05] active:scale-95">
                        Login to Continue <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em] pt-12">
                    © 2024 Captiv8 Protocol • v1.0.4
                </p>
            </motion.div>
        </div>
    );
}
