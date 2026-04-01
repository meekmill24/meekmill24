'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  AlertCircle, 
  QrCode, 
  Upload, 
  Smartphone,
  Info,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useProfile } from '@/hooks/use-profile';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import Image from 'next/image';

const DEPOSIT_AMOUNTS = [30, 50, 100, 300, 500, 1000, 3000, 5000];

export default function DepositPage() {
    const router = useRouter();
    const { format } = useCurrency();
    const { profile } = useProfile();
    const [amount, setAmount] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [network, setNetwork] = useState<'TRC20' | 'USDC' | 'ETH' | 'BTC'>('TRC20');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [walletAddresses, setWalletAddresses] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchWallets = async () => {
            const { data } = await supabase.from('site_settings').select('key, value');
            if (data) {
                const wallets: Record<string, string> = {};
                data.forEach(s => {
                    if (s.key.startsWith('wallet_')) wallets[s.key] = s.value;
                });
                setWalletAddresses(wallets);
            }
        };
        fetchWallets();
    }, []);

    const getWalletKey = (n: string) => {
        if (n === 'ETH') return 'wallet_erc20';
        if (n === 'USDC') return 'wallet_bep20';
        return `wallet_${n.toLowerCase()}`;
    };

    const depositAddress = walletAddresses[getWalletKey(network)] || "THxV7...example_address";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProofPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeFile = () => {
        setProofFile(null);
        setProofPreview(null);
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(depositAddress);
        setCopied(true);
        toast.success("Address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmitDeposit = async () => {
        const finalAmount = amount || customAmount;
        if (!finalAmount || parseFloat(finalAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!proofFile) {
            toast.error("Please upload proof of payment");
            return;
        }

        setLoading(true);
        setUploading(true);

        try {
            const fileExt = proofFile.name.split('.').pop();
            const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('deposit-proofs')
                .upload(fileName, proofFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('deposit-proofs')
                .getPublicUrl(fileName);

            const { error: txError } = await supabase
                .from('transactions')
                .insert({
                    user_id: profile?.id,
                    type: 'deposit',
                    amount: parseFloat(finalAmount),
                    status: 'pending',
                    proof_url: publicUrl,
                    network: network,
                    description: `Deposit via ${network}`
                });

            if (txError) throw txError;

            toast.success("Deposit request submitted successfully!");
            router.push('/app/record');
        } catch (err: any) {
            toast.error(err.message || "Failed to submit deposit");
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const finalAmount = amount || customAmount;

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
                        <h1 className="text-3xl font-black tracking-tight italic uppercase">Recharge Node</h1>
                        <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] font-mono">Secure Liquidity Protocol</p>
                    </div>
                </div>

                <div className="px-6 space-y-8">
                    <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl glow-mesh">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Smartphone size={18} className="text-cyan-400" />
                            1. Select Network
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {['TRC20', 'USDC', 'ETH', 'BTC'].map((net) => (
                                <button
                                    key={net}
                                    onClick={() => setNetwork(net as any)}
                                    className={`py-6 rounded-3xl border transition-all flex flex-col items-center gap-2 ${
                                        network === net 
                                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
                                        : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10'
                                    }`}
                                >
                                    <span className="text-sm font-black tracking-widest">{net}</span>
                                    <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">Verified Node</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl glow-mesh">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Zap size={18} className="text-yellow-500" />
                            2. Deposit Amount
                        </h3>
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {DEPOSIT_AMOUNTS.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => {
                                        setAmount(amt.toString());
                                        setCustomAmount('');
                                    }}
                                    className={`py-4 rounded-2xl border transition-all text-sm font-black ${
                                        amount === amt.toString()
                                        ? 'bg-white text-black border-white shadow-xl' 
                                        : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'
                                    }`}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400 font-black text-xl">$</div>
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => {
                                    setCustomAmount(e.target.value);
                                    setAmount('');
                                }}
                                placeholder="Enter custom amount"
                                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-14 pr-6 text-xl font-black text-white placeholder:text-zinc-700 focus:border-cyan-500/50 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl glow-mesh">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <QrCode size={18} className="text-purple-400" />
                            3. Finalize Transfer
                        </h3>
                        
                        <div className="flex flex-col items-center gap-8">
                            <div className="bg-white p-6 rounded-[40px] shadow-[0_0_60px_rgba(255,255,255,0.1)] relative group">
                                <QRCodeSVG value={depositAddress} size={180} />
                                <div className="absolute inset-0 bg-cyan-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>

                            <div className="w-full bg-black/40 rounded-3xl p-6 border border-white/5 flex items-center justify-between group overflow-hidden">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{network} NODE ADDRESS</span>
                                    <span className="text-sm font-black font-mono text-white tracking-tight truncate max-w-[200px]">{depositAddress}</span>
                                </div>
                                <button onClick={copyAddress} className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all">
                                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/60 backdrop-blur-2xl rounded-[40px] p-8 border border-white/10 shadow-2xl glow-mesh">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Upload size={18} className="text-green-500" />
                            4. Submit Proof
                        </h3>

                        {!proofPreview ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/5 rounded-[40px] p-12 flex flex-col items-center gap-4 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer group"
                            >
                                <div className="w-16 h-16 rounded-3xl bg-white/5 text-zinc-600 group-hover:text-cyan-400 flex items-center justify-center transition-all">
                                    <ImageIcon size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Upload Screenshot</p>
                                    <p className="text-[10px] text-zinc-600 mt-2 font-bold uppercase tracking-widest">Max 5MB • JPG, PNG, WEBP</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-[40px] overflow-hidden border border-white/10 group animate-in zoom-in-95 duration-300">
                                <img src={proofPreview} alt="Proof" className="w-full h-64 object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button onClick={removeFile} className="w-16 h-16 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                                        <X size={32} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-3xl flex gap-4">
                        <Info size={20} className="text-cyan-500 shrink-0" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed tracking-wider italic">
                            Verification nodes process recharge cycles within 10-30 minutes. Ensure the network selection ({network}) matches your wallet settlement to prevent asset loss.
                        </p>
                    </div>

                    <button
                        onClick={handleSubmitDeposit}
                        disabled={loading || !finalAmount || !proofFile}
                        className="w-full bg-cyan-600 text-white py-8 rounded-[32px] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:scale-100 button-shine"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>Initialize Funding Protocol <Smartphone size={20} /></>
                        )}
                    </button>
                </div>
            </div>
        </main>
    );
}
