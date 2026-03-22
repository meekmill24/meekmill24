'use client';

import React from 'react';
import { CheckCircle, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import Portal from './Portal';

export interface BundlePackage {
    id: string;
    name: string;
    description: string;
    shortageAmount: number;
    totalAmount: number;
    bonusAmount: number;
    expiresIn: number;
    taskItem: {
        title: string;
        image_url: string;
        category: string;
    };
}

interface BundledPackageModalProps {
    isOpen: boolean;
    bundle: BundlePackage | null;
    onAccept: (bundle: BundlePackage) => Promise<void>;
}

export default function BundledPackageModal({
    isOpen,
    bundle,
    onAccept
}: BundledPackageModalProps) {
    const { format } = useCurrency();

    if (!isOpen || !bundle) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
                <div
                    className="bg-slate-950 w-full max-w-sm rounded-[32px] overflow-hidden shadow-[0_50px_140px_rgba(0,0,0,1)] border border-amber-500/30 animate-in fade-in zoom-in duration-300 relative flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Visual Top Bar */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

                    {/* Compact Body */}
                    <div className="p-6 pb-2">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-[24px] bg-amber-500/20 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(245,158,11,0.2)] border border-amber-500/20">
                                <Zap size={32} className="text-amber-500 fill-amber-500/20 animate-pulse" />
                            </div>

                            <div className="text-center mb-6">
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mb-2 block opacity-80">
                                    Combined Sequence Activation
                                </span>
                                <h3 className="text-2xl font-black text-white mb-2 italic tracking-tight">Priority Task Bundle!</h3>
                                <p className="text-[11px] text-slate-400 leading-relaxed opacity-60 px-2 max-w-[280px] mx-auto">
                                    {bundle.description || "You've successfully triggered a high-yield bundle sequence. These are priority matching cycles for institutional merchants."}
                                </p>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="p-4 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-between shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                                            <TrendingUp size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-40">Total Value</span>
                                            <span className="text-lg font-black text-white">{format(bundle.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-[24px] bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-green-500/20 text-green-500">
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em] opacity-60">Locked Profit</span>
                                            <span className="text-lg font-black text-green-500">+{format(bundle.bonusAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="p-6 pt-2 flex flex-col gap-3">
                        <button
                            onClick={() => onAccept(bundle)}
                            className="w-full py-4 rounded-[24px] bg-gradient-to-br from-amber-500 to-amber-700 text-white font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(245,158,11,0.25)] hover:scale-[1.03] active:scale-[0.97] transition-all"
                        >
                            START SEQUENCE <ShieldCheck size={18} />
                        </button>

                        <p className="text-[8px] text-center text-slate-600 font-bold opacity-30 uppercase tracking-[0.2em] mt-2 px-6 leading-relaxed">
                            Funds will remain in the secure clearance node until the full sequence is finalized.
                        </p>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
