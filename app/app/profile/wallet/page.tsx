'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Wallet, Shield, CheckCircle, AlertCircle, Loader2, LogOut, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BindWalletPage() {
    const { profile, refreshProfile } = useAuth();
    const router = useRouter();
    const [network, setNetwork] = useState<'USDT-TRC20' | 'USDC' | 'ETH' | 'BTC'>('USDT-TRC20');
    const [walletAddress, setWalletAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (profile?.wallet_address) {
            setWalletAddress(profile.wallet_address);
        }
        if (profile?.wallet_network) {
            setNetwork(profile.wallet_network as any);
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!walletAddress.trim()) {
            setMessage({ type: 'error', text: `Please enter a valid ${network} wallet address` });
            return;
        }

        // Basic validation
        if (network === 'USDT-TRC20') {
            if (!walletAddress.startsWith('T') || walletAddress.length !== 34) {
                setMessage({ type: 'error', text: 'Invalid TRC20 address format' });
                return;
            }
        } else if (network === 'USDC' || network === 'ETH') {
            if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
                setMessage({ type: 'error', text: `Invalid ${network} address format` });
                return;
            }
        } else if (network === 'BTC') {
            const btcRegex = /^(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[ac-hj-np-z02-9]{11,71})$/;
            if (!btcRegex.test(walletAddress)) {
                setMessage({ type: 'error', text: 'Invalid BTC address format' });
                return;
            }
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    wallet_address: walletAddress,
                    wallet_network: network
                })
                .eq('id', profile?.id);

            if (error) throw error;

            await refreshProfile();
            setMessage({ type: 'success', text: 'Wallet configuration saved successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to bind wallet address' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 pb-24 space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <ChevronLeft size={20} className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight italic text-indigo-500">Security Node</h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-60">Payout Binding & Clearance</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-10">
                <div className="glass-card-strong overflow-hidden animate-slide-up rounded-[56px] bg-slate-950/40 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
                    {/* Network Selector Scroller */}
                    <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar bg-white/[0.02]">
                        {[
                            { id: 'USDT-TRC20', label: 'TRC20', color: 'bg-red-500', initial: 'T' },
                            { id: 'USDC', label: 'USDC', color: 'bg-blue-500', initial: 'U' },
                            { id: 'ETH', label: 'ERC20', color: 'bg-purple-500', initial: 'E' },
                            { id: 'BTC', label: 'BTC', color: 'bg-orange-500', initial: '₿' }
                        ].map((net) => (
                            <button 
                                key={net.id}
                                onClick={() => { setNetwork(net.id as any); setWalletAddress(''); setMessage(null); }}
                                className={`flex-1 min-w-[120px] py-8 px-4 flex flex-col items-center gap-3 transition-all relative ${network === net.id ? 'text-indigo-400' : 'text-slate-500 opacity-30 hover:opacity-100'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-lg shadow-lg transition-all ${network === net.id ? `${net.color} scale-110 rotate-6` : 'bg-zinc-800'}`}>
                                    {net.initial}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{net.label}</span>
                                {network === net.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)]" />}
                            </button>
                        ))}
                    </div>

                    <div className="p-10 lg:p-14">
                        <div className="flex justify-center mb-10">
                            <div className={`w-24 h-24 rounded-[32px] flex flex-col items-center justify-center border border-white/10 shadow-inner transition-all duration-700 hover:rotate-6 ${
                                network === 'BTC' ? 'bg-orange-500/10 border-orange-500/20' : 
                                network === 'ETH' ? 'bg-purple-500/10 border-purple-500/20' :
                                'bg-indigo-500/10 border-indigo-500/20'
                            }`}>
                                <Wallet size={40} className={
                                    network === 'BTC' ? 'text-orange-400' :
                                    network === 'ETH' ? 'text-purple-400' :
                                    'text-indigo-400'
                                } />
                            </div>
                        </div>

                        <div className="text-center space-y-4 mb-12">
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter italic">{network} Endpoint</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm mx-auto leading-relaxed italic opacity-60">
                                Maintain sync integrity. Ensure the network matches your node's destination address.
                            </p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-10">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block opacity-50">
                                    Destination Node Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Shield size={20} className="text-slate-600 transition-colors group-focus-within:text-indigo-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                        placeholder="Enter wallet address 0x..."
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-6 pl-16 pr-6 text-sm text-white font-bold placeholder-slate-700 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`p-6 rounded-[28px] flex items-center gap-4 animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                                    {message.type === 'success' ? <CheckCircle size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed italic">{message.text}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-6 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl flex justify-center items-center shadow-indigo-500/20 ${
                                    network === 'BTC' ? 'bg-orange-500 text-white' : 
                                    network === 'ETH' ? 'bg-purple-600 text-white' :
                                    'bg-indigo-600 text-white'
                                }`}
                            >
                                {isLoading ? <Loader2 size={24} className="animate-spin text-white" /> : `Bind ${network} Protocol`}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="glass-card-strong p-10 animate-slide-up rounded-[48px] bg-indigo-500/5 border border-indigo-500/10">
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                            <AlertCircle size={24} />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Compliance Notice</h4>
                            <ul className="space-y-3">
                                {[
                                    `Verification Node: ${network} (Must Match Selection)`,
                                    'Irreversible: Incorrect addresses result in permanent asset loss.',
                                    'Security: Node mapping is locked post-initialization for asset protection.',
                                    'Help: Contact the Concierge Desk for governance-level modifications.'
                                ].map((rule, idx) => (
                                    <li key={idx} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed opacity-60 flex items-center gap-3 italic italic italic">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
