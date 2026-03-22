'use client';

import { ChevronLeft, Globe, Check, Coins } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency, CurrencyCode } from '@/context/CurrencyContext';
import { toast } from 'sonner';

export default function GlobalizationPage() {
    const { language, setLanguage, t } = useLanguage();
    const { currency, setCurrency } = useCurrency();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
        { code: 'gh', name: 'Ghanaian', flag: '🇬🇭' },
    ];

    const currencies: { code: CurrencyCode; name: string; symbol: string }[] = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'GHC', name: 'Ghana Cedi', symbol: 'GH₵' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'Dh' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
    ];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-20">
            <div className="px-6 pt-10 pb-6 sticky top-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/app/profile">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                            <ChevronLeft className="w-6 h-6" />
                        </div>
                    </Link>
                    <h1 className="text-xl font-black italic tracking-tighter uppercase">Globalization</h1>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-10">
                {/* Language Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 ml-2">
                        <Globe className="w-4 h-4 text-cyan-500" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Regional Dialect</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                        {languages.map((lang) => (
                            <button 
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as any);
                                    toast.success(`Language set to ${lang.name}`);
                                }}
                                className={`
                                    flex items-center justify-between p-6 rounded-[32px] border transition-all active:scale-[0.98]
                                    ${language === lang.code ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-800/50'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{lang.flag}</span>
                                    <span className={`text-sm font-black uppercase tracking-tight italic ${language === lang.code ? 'text-cyan-400' : 'text-zinc-300'}`}>
                                        {lang.name}
                                    </span>
                                </div>
                                {language === lang.code && <Check className="text-cyan-400" size={20} />}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Currency Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 ml-2">
                        <Coins className="w-4 h-4 text-purple-500" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Monetary Unit</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                        {currencies.map((curr) => (
                            <button 
                                key={curr.code}
                                onClick={() => {
                                    setCurrency(curr.code);
                                    toast.success(`Currency set to ${curr.code}`);
                                }}
                                className={`
                                    flex items-center justify-between p-6 rounded-[32px] border transition-all active:scale-[0.98]
                                    ${currency.code === curr.code ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-800/50'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black border ${currency.code === curr.code ? 'bg-purple-500 text-white' : 'bg-white/5 text-zinc-500 border-white/5'}`}>
                                        {curr.symbol}
                                    </div>
                                    <span className={`text-sm font-black uppercase tracking-tight italic ${currency.code === curr.code ? 'text-purple-400' : 'text-zinc-300'}`}>
                                        {curr.name} ({curr.code})
                                    </span>
                                </div>
                                {currency.code === curr.code && <Check className="text-purple-400" size={20} />}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
