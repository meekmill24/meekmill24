'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowUpFromLine, 
  Wallet, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Info,
  Smartphone,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

export default function WithdrawPage() {
    const router = useRouter();
    const { format } = useCurrency();
    const { profile, mutate } = useAuth();
    const [amount, setAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [withdrawalPin, setWithdrawalPin] = useState('');

    useEffect(() => {
        if (profile?.withdrawal_wallet_address) {
            setWalletAddress(profile.withdrawal_wallet_address);
        }
    }, [profile]);

    const [network, setNetwork] = useState<'TRC20' | 'USDC' | 'ETH' | 'BTC'>('TRC20');
    const [loading, setLoading] = useState(false);

    const minWithdrawal = 30;
    const balance = profile?.wallet_balance || 0;

    const handleSubmitWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = parseFloat(amount);

        if (!withdrawAmount || withdrawAmount < minWithdrawal) {
            toast.error(`Minimum withdrawal is $${minWithdrawal}`);
            return;
        }

        if (withdrawAmount > balance) {
            toast.error("Insufficient balance");
            return;
        }

        if (!walletAddress) {
            toast.error("Please enter wallet address");
            return;
        }

        if (profile?.withdrawal_password && withdrawalPin !== profile.withdrawal_password) {
            toast.error("Invalid Withdrawal PIN");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.rpc('request_withdrawal', {
                p_amount: withdrawAmount,
                p_wallet_address: walletAddress,
                p_network: network,
                p_description: `Withdrawal to ${network}`
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.message);

            toast.success("Withdrawal request initiated!");
            mutate();
            router.push('/app/record');
        } catch (err: any) {
            toast.error(err.message || "Failed to initiate withdrawal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-24 relative overflow-hidden">
            <div className='fixed inset-0 z-0 opacity-10 pointer-events-none'>
                <Image src="/hero-bg.png" alt="Background" fill className="object-cover blur-3xl scale-110" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-8">
                    <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight italic uppercase">Asset Payout</h1>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] font-mono">Guaranteed Settlement Node</p>
                    </div>
                </div>

                <div className="px-6 space-y-8">
                    {/* Balance Display */}
                    <div className="bg-gradient-to-br from-rose-500/10 to-purple-600/10 backdrop-blur-xl rounded-[40px] p-10 border border-rose-500/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Wallet size={120} />
                        </div>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-4">Available for Settlement</p>
                        <h2 className="text-6xl font-black tracking-tighter mb-6 font-mono">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        
                        <div className="flex items-center gap-3 px-4 py-2 bg-rose-500/10 w-fit rounded-full border border-rose-500/20">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-rose-200">Protocol Secure</span>
                        </div>
                    </div>

                    {/* Withdrawal Form */}
                    <form onSubmit={handleSubmitWithdraw} className="bg-zinc-900/60 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 shadow-2xl space-y-8">
                        {/* Amount */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block ml-2">Request Amount</label>
                            <div className="relative">
                                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-rose-500 font-black text-2xl">$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="00.00"
                                    className="w-full bg-black/40 border border-white/10 rounded-[32px] py-8 pl-14 pr-8 text-3xl font-black text-white focus:border-rose-500/40 transition-all outline-none"
                                />
                            </div>
                            <div className="flex justify-between items-center px-4">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Min: ${minWithdrawal}</span>
                                <button type="button" onClick={() => setAmount(balance.toString())} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400">Set Maximum</button>
                            </div>
                        </div>

                        {/* Network */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block ml-2">Settlement Network</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['TRC20', 'USDC', 'ETH', 'BTC'].map((net) => (
                                    <button
                                        key={net}
                                        type="button"
                                        onClick={() => setNetwork(net as any)}
                                        className={`py-5 rounded-2xl border transition-all flex items-center justify-center gap-2 ${
                                            network === net 
                                            ? 'bg-rose-500 text-white border-rose-500 shadow-xl' 
                                            : 'bg-white/5 border-white/5 text-zinc-500'
                                        }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{net}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Wallet Address */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block ml-2">Vault Address</label>
                            <div className="relative">
                                <Wallet size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-rose-400 opacity-40" />
                                <input
                                    type="text"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    placeholder="Enter Destination Address"
                                    className="w-full bg-black/40 border border-white/10 rounded-[32px] py-8 pl-16 pr-8 text-sm font-black font-mono text-white focus:border-rose-500/40 transition-all outline-none tracking-tight"
                                />
                            </div>
                        </div>

                        {/* Withdrawal PIN */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block ml-2">Withdrawal Security PIN</label>
                            <div className="relative">
                                <ShieldCheck size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-rose-400 opacity-40" />
                                <input
                                    type="password"
                                    maxLength={6}
                                    value={withdrawalPin}
                                    onChange={(e) => setWithdrawalPin(e.target.value)}
                                    placeholder="Enter 6-digit PIN"
                                    className="w-full bg-black/40 border border-white/10 rounded-[32px] py-8 pl-16 pr-8 text-xl font-black text-white focus:border-rose-500/40 transition-all outline-none tracking-widest font-mono"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || balance < minWithdrawal || !amount}
                            className="w-full bg-white text-black py-8 rounded-[32px] font-black uppercase tracking-[0.4em] text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20 button-shine"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>Initiate Payout <ArrowUpFromLine size={24} /></>
                            )}
                        </button>
                    </form>

                    {/* Security Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 flex items-start gap-4">
                            <Clock className="text-rose-500 shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Timeframe</h4>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase leading-relaxed tracking-wider">Settlement typically finalized within 24 business hours post-audit.</p>
                            </div>
                        </div>
                        <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 flex items-start gap-4">
                            <ShieldCheck className="text-green-500 shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Protection</h4>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase leading-relaxed tracking-wider">All payouts secured by institutional escrow protocol layer V4.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl flex gap-4">
                        <AlertCircle size={20} className="text-zinc-600 shrink-0" />
                        <p className="text-[9px] font-bold text-zinc-500 uppercase leading-relaxed tracking-wider italic">
                            Ensure your vault address is correctly specified for the selected network. Protocol settlement errors due to incorrect addressing are non-reversible.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
