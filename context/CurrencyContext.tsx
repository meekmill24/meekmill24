'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSiteSettings } from './SettingsContext';
import { supabase } from '@/lib/supabase';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'CHF' | 'AUD' | 'SGD' | 'AED' | 'ZAR' | 'BRL' | 'GHC' | 'BTC';

interface Currency {
    code: CurrencyCode;
    symbol: string;
    rate: number; 
}

const currencies: Record<CurrencyCode, Currency> = {
    USD: { code: 'USD', symbol: '$', rate: 1 },
    EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
    JPY: { code: 'JPY', symbol: '¥', rate: 150.5 },
    CAD: { code: 'CAD', symbol: '$', rate: 1.35 },
    CHF: { code: 'CHF', symbol: 'Fr', rate: 0.88 },
    AUD: { code: 'AUD', symbol: 'A$', rate: 1.52 },
    SGD: { code: 'SGD', symbol: 'S$', rate: 1.34 },
    AED: { code: 'AED', symbol: 'Dh', rate: 3.67 },
    ZAR: { code: 'ZAR', symbol: 'R', rate: 19.05 },
    BRL: { code: 'BRL', symbol: 'R$', rate: 4.97 },
    GHC: { code: 'GHC', symbol: 'GH₵', rate: 12.85 },
    BTC: { code: 'BTC', symbol: '₿', rate: 0.000015 },
};

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (code: CurrencyCode) => void;
    convert: (amount: number) => number;
    format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const { currency: backendCurrency, loading } = useSiteSettings();
    const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies.USD);

    useEffect(() => {
        if (loading) return;
        
        const defaultCurrency = backendCurrency?.default && currencies[backendCurrency.default as CurrencyCode] 
            ? { ...currencies[backendCurrency.default as CurrencyCode], symbol: backendCurrency.symbol || currencies[backendCurrency.default as CurrencyCode].symbol }
            : currencies.USD;

        const savedCurrency = localStorage.getItem('currency') as CurrencyCode;
        if (savedCurrency && currencies[savedCurrency]) {
            setCurrentCurrency(currencies[savedCurrency]);
        } else if (profile?.currency && currencies[profile.currency as CurrencyCode]) {
            setCurrentCurrency(currencies[profile.currency as CurrencyCode]);
        } else {
            setCurrentCurrency(defaultCurrency);
        }
    }, [profile?.currency, backendCurrency, loading]);

    const handleSetCurrency = async (code: CurrencyCode) => {
        if (currencies[code]) {
            setCurrentCurrency(currencies[code]);
            localStorage.setItem('currency', code);

            if (profile?.id) {
                try {
                    await supabase
                        .from('profiles')
                        .update({ currency: code })
                        .eq('id', profile.id);
                } catch (err) {
                    console.error('Failed to persist currency setting:', err);
                }
            }
        }
    };

    const convert = (amount: number) => {
        return amount * currentCurrency.rate;
    };

    const format = (amount: number) => {
        const converted = convert(amount);
        if (currentCurrency.code === 'JPY') {
            return `${currentCurrency.symbol}${Math.round(converted).toLocaleString()}`;
        }
        if (currentCurrency.code === 'BTC') {
            return `${currentCurrency.symbol}${converted.toFixed(8)}`;
        }
        return `${currentCurrency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency: currentCurrency, setCurrency: handleSetCurrency, convert, format }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
    return context;
};
