'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSiteSettings } from './SettingsContext';

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'tr' | 'gh';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (code: LanguageCode) => void;
    t: (key: string) => string;
}

const translations: Record<LanguageCode, Record<string, string>> = {
    en: { 'start': 'START', 'balance': 'BALANCE', 'tasks': 'TASKS', 'record': 'RECORD', 'settings': 'SETTINGS', 'available_balance': 'AVAILABLE BALANCE', 'welcome_back': 'WELCOME BACK' },
    es: { 'start': 'INICIO', 'balance': 'SALDO', 'tasks': 'TAREAS', 'record': 'REGISTRO', 'settings': 'AJUSTES', 'available_balance': 'SALDO DISPONIBLE', 'welcome_back': 'BIENVENIDO' },
    fr: { 'start': 'DÉMARRER', 'balance': 'SOLDE', 'tasks': 'TÂCHES', 'record': 'REGISTRE', 'settings': 'PARAMÈTRES', 'available_balance': 'SOLDE DISPONIBLE', 'welcome_back': 'BIENVENUE' },
    de: { 'start': 'START', 'balance': 'SALDO', 'tasks': 'AUFGABEN', 'record': 'PROTOKOLL', 'settings': 'EINSTELLUNGEN', 'available_balance': 'VERFÜGBARES SALDO', 'welcome_back': 'WILLKOMMEN' },
    it: { 'start': 'INIZIA', 'balance': 'SALDO', 'tasks': 'COMPITI', 'record': 'REGISTRO', 'settings': 'IMPOSTAZIONI', 'available_balance': 'SALDO DISPONIBILE', 'welcome_back': 'BENVENUTO' },
    pt: { 'start': 'INICIAR', 'balance': 'SALDO', 'tasks': 'TAREFAS', 'record': 'REGISTRO', 'settings': 'CONFIGURAÇÕES', 'available_balance': 'SALDO DISPONÍVEL', 'welcome_back': 'BEM-VINDO' },
    ru: { 'start': 'ПУСК', 'balance': 'БАЛАНС', 'tasks': 'ЗАДАЧИ', 'record': 'ЖУРНАЛ', 'settings': 'НАСТРОЙКИ', 'available_balance': 'ДОСТУПНЫЙ БАЛАНС', 'welcome_back': 'С ВОЗВРАЩЕНИЕМ' },
    zh: { 'start': '开始', 'balance': '余额', 'tasks': '任务', 'record': '记录', 'settings': '设置', 'available_balance': '可用余额', 'welcome_back': '欢迎回来' },
    ja: { 'start': 'スタート', 'balance': '残高', 'tasks': 'タスク', 'record': '記録', 'settings': '設定', 'available_balance': '利用可能残高', 'welcome_back': 'おかえりなさい' },
    ko: { 'start': '시작', 'balance': '잔액', 'tasks': '작업', 'record': '기록', 'settings': '설정', 'available_balance': '가용 잔액', 'welcome_back': '환영합니다' },
    ar: { 'start': 'ابدأ', 'balance': 'רصيد', 'tasks': 'مهام', 'record': 'سجل', 'settings': 'إعدادات', 'available_balance': 'الرصيد المتاح', 'welcome_back': 'مرحباً بعودتك' },
    tr: { 'start': 'BAŞLAT', 'balance': 'BAKİYE', 'tasks': 'GÖREVLER', 'record': 'KAYIT', 'settings': 'AYARLAR', 'available_balance': 'UYGUN BAKİYE', 'welcome_back': 'HOŞ GELDİNİZ' },
    gh: { 'start': 'DZE SE', 'balance': 'GASH', 'tasks': 'ADWUMAYE', 'record': 'REKODO', 'settings': 'NSEKYEREW', 'available_balance': 'SIKA A OWO BI', 'welcome_back': 'AKWAABA' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const settings = useSiteSettings() as any;
    const [language, setLanguage] = useState<LanguageCode>('en');

    useEffect(() => {
        const saved = localStorage.getItem('language') as LanguageCode;
        if (saved && translations[saved]) {
            setLanguage(saved);
        } else if (!settings.loading) {
            const defaultLang = settings.default_language as LanguageCode;
            if (defaultLang && translations[defaultLang]) {
                setLanguage(defaultLang);
            }
        }
    }, [settings.default_language, settings.loading]);

    const handleSetLanguage = (code: LanguageCode) => {
        if (translations[code]) {
            setLanguage(code);
            localStorage.setItem('language', code);
        }
    };

    const t = (key: string) => {
        return translations[language]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
