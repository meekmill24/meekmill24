'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteSettings {
    currency: {
        default: string;
        symbol: string;
        conversion_rate: number;
        [key: string]: any;
    };
    languages: string[];
    theme_colors: {
        primary?: string;
        primary_light?: string;
        primary_dark?: string;
        accent?: string;
        accent_light?: string;
        success?: string;
        warning?: string;
        danger?: string;
        surface?: string;
        [key: string]: any;
    };
    loading: boolean;
}

const SettingsContext = createContext<SiteSettings>({
    currency: { default: 'USDT', symbol: '$', conversion_rate: 1 },
    languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'],
    theme_colors: {},
    loading: true
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>({
        currency: { default: 'USDT', symbol: '$', conversion_rate: 1 },
        languages: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'],
        theme_colors: {},
        loading: true
    });

    const applyThemeColors = (colors: any) => {
        if (!colors || typeof window === 'undefined') return;
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, color]) => {
            if (color) {
                const cssVarName = `--${key.replace(/_/g, '-')}`;
                root.style.setProperty(cssVarName, color as string);
            }
        });
    };

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('key, value');

                if (error) {
                    setSettings(prev => ({ ...prev, loading: false }));
                    return;
                }

                if (data && data.length > 0) {
                    const newSettings: any = { ...settings, loading: false };
                    data.forEach(item => {
                        newSettings[item.key] = item.value;
                    });
                    
                    setSettings(newSettings);

                    if (newSettings.theme_colors) {
                        applyThemeColors(newSettings.theme_colors);
                    }
                } else {
                    setSettings(prev => ({ ...prev, loading: false }));
                }
            } catch (err) {
                setSettings(prev => ({ ...prev, loading: false }));
            }
        }

        fetchSettings();

        const channel = supabase
            .channel('site-settings-changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'site_settings' 
            }, () => {
                fetchSettings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSiteSettings = () => useContext(SettingsContext);
