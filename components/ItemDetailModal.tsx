'use client';

import React from 'react';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import Portal from './Portal';

interface ItemDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string | number;
        title: string;
        image_url: string;
        description: string;
        category: string;
    } | null;
    onSubmit: (item: any, displayValue: number) => Promise<void>;
    balance: number;
    commissionRate: number;
    format: (val: number) => string;
    isSubmitting: boolean;
}

export default function ItemDetailModal({
    isOpen,
    onClose,
    item,
    onSubmit,
    balance,
    commissionRate,
    format,
    isSubmitting
}: ItemDetailModalProps) {
    if (!isOpen || !item) return null;

    // Randomize product value between 40% and 85% of balance to ensure uniqueness
    const displayProductValue = React.useMemo(() => {
        if (!balance || balance <= 0) return 0;
        // Seeded-ish randomization: use balance and item title to keep it consistent while modal is open 
        // but unique per task. 
        const min = 0.40;
        const max = 0.85;
        const randomFactor = Math.random() * (max - min) + min;
        return Math.floor(balance * randomFactor);
    }, [balance, item?.id]);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        try {
            await onSubmit(item, displayProductValue);
        } catch (err) {
            console.error("Local Submit Error:", err);
        }
    };

    return (
        <Portal>
            <div
                className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300"
                onClick={onClose}
            >
                <div
                    className="bg-black/90 w-full max-w-sm rounded-[32px] overflow-hidden shadow-[0_50px_140px_rgba(0,0,0,0.95)] border border-white/10 animate-scale-in relative flex flex-col md:fixed md:left-[50%] md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Area */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] opacity-80">Processing Task</span>
                        </div>
                    </div>

                    {/* High-Quality Premium Arrangement */}
                    <div className="p-6 pb-2">
                        <div className="flex gap-5 mb-8 items-start">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/5 p-2 shrink-0 shadow-inner">
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col gap-2.5 pt-1 flex-1">
                                <h3 className="text-[15px] font-black text-white leading-tight uppercase tracking-tight line-clamp-2 drop-shadow-sm">
                                    {item.title}
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em] border border-cyan-500/20 shadow-sm">Active</span>
                                    <span className="px-3 py-1 rounded-lg bg-green-500/20 text-[9px] font-black text-green-400 uppercase tracking-[0.2em] border border-green-500/20 shadow-sm">Verified</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-0.5 p-6 rounded-[32px] bg-black/60 border border-white/5 shadow-[inset_0_4px_25px_rgba(0,0,0,0.7)] mb-8">
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] opacity-40 mb-2.5">Value</span>
                                <span className="text-[14px] font-black text-white tracking-tight">{format(displayProductValue)}</span>
                                <div className="flex items-center gap-1.5 mt-2 opacity-60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                    <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">USDT</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center border-x border-white/10 px-2">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] opacity-40 mb-2.5">Rate</span>
                                <span className="text-[14px] font-black text-cyan-400 tracking-tight">{(commissionRate * 100).toFixed(2)}%</span>
                                <span className="text-[7px] font-black text-cyan-400/70 uppercase mt-2 tracking-tighter">REBATE</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] opacity-40 mb-2.5">Profit</span>
                                <span className="text-[14px] font-black text-green-400 tracking-tight">+{format(displayProductValue * commissionRate)}</span>
                                <div className="flex items-center gap-1.5 mt-2 opacity-60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse" />
                                    <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">USDT</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer Button */}
                    <div className="p-8 pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-5 rounded-[24px] bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-cyan-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Processing...
                                </>
                            ) : (
                                <>
                                    SUBMIT TASK <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                        <p className="text-[8px] text-center text-zinc-500 font-black opacity-30 mt-4 uppercase tracking-[0.3em]">
                            <span className="inline-block w-1 h-1 rounded-full bg-green-500 mr-2 animate-pulse" />
                            Secured Channel
                        </p>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
