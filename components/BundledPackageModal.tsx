'use client';

import React from 'react';
import { CheckCircle, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import Portal from './Portal';

export interface BundlePackage {
    id: string;
    name: string;
    description: string;
    shortageAmount: number;
    totalAmount: number;
    bonusAmount: number;
    expiresIn: number;
    taskItem?: {
        title: string;
        image_url: string;
        category: string;
    };
    taskItems?: Array<{
        title: string;
        image_url: string;
        category: string;
    }>;
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
                                    {bundle.description || "You've successfully triggered a high-yield bundle sequence."}
                                </p>
                            </div>

                            <div className={cn(
                                "flex flex-wrap justify-center gap-4 mb-8 w-full",
                                (bundle.taskItems?.length || (bundle.taskItem ? 1 : 0)) > 1 ? "grid grid-cols-2" : "flex"
                            )}>
                                {(() => {
                                    const items = bundle.taskItems || (bundle.taskItem ? [bundle.taskItem] : []);
                                    const totalItems = items.length;
                                    
                                    // Generate randomized weights for splitting
                                    const weights = items.map((_, i) => {
                                        if (totalItems === 1) return 1;
                                        // Simple deterministic random-ish weight based on title length
                                        const seed = ((items[i]?.title || "").length * 7) % 100;
                                        return 40 + (seed % 21); // 40-60 range
                                    });
                                    const totalWeight = weights.reduce((a, b) => a + b, 0);
                                    
                                    return items.map((item, idx) => {
                                        if (!item) return null;
                                        
                                        // Calculate proportional split based on weight
                                        let itemPrice, itemProfit;
                                        if (idx === totalItems - 1) {
                                            // Ensure the final item rounds out the total exactly
                                            const previousPriceSum = weights.slice(0, idx).reduce((sum, w) => sum + Math.floor((w/totalWeight) * bundle.totalAmount), 0);
                                            const previousProfitSum = weights.slice(0, idx).reduce((sum, w) => sum + Math.floor((w/totalWeight) * bundle.bonusAmount), 0);
                                            itemPrice = bundle.totalAmount - previousPriceSum;
                                            itemProfit = bundle.bonusAmount - previousProfitSum;
                                        } else {
                                            itemPrice = Math.floor((weights[idx] / totalWeight) * bundle.totalAmount);
                                            itemProfit = Math.floor((weights[idx] / totalWeight) * bundle.bonusAmount);
                                        }
                                        
                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-3">
                                                <div className="relative group cursor-pointer">
                                                    <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500/40 to-cyan-500/40 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-[28px] bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl">
                                                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-4">
                                                            <div className="flex flex-col items-center">
                                                                <p className="text-[13px] font-black text-amber-500 leading-none mb-2">{format(itemPrice)}</p>
                                                                <p className="text-[9px] font-black text-green-500 leading-none">Yield: {format(itemProfit)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center px-1">
                                                    <p className="text-[9px] font-black text-white uppercase tracking-tighter truncate w-20 md:w-24">{item.title}</p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
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
