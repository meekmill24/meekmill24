'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSiteSettings } from './SettingsContext';

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'tr' | 'gh' | 'hi' | 'vi' | 'th' | 'id' | 'bn' | 'ms' | 'tl';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (code: LanguageCode) => void;
    t: (key: string) => string;
}

const translations: Record<LanguageCode, Record<string, string>> = {
    en: { 
        'start': 'START', 'balance': 'BALANCE', 'tasks': 'TASKS', 'record': 'RECORD', 'settings': 'SETTINGS', 
        'available_balance': 'AVAILABLE BALANCE', 'welcome_back': 'WELCOME BACK', 'deposit': 'DEPOSIT', 
        'withdraw': 'WITHDRAW', 'records': 'RECORDS', 'salary': 'SALARY', 'invite': 'INVITE', 
        'certificate': 'CERTIFICATE', 'wallet': 'WALLET', 'support': 'SUPPORT', 'faq': 'FAQ',
        'hello': 'HELLO', 'operational_hub': 'OPERATIONAL HUB', 'terminal_stats': 'TERMINAL STATS',
        'asset_flow': 'ASSET FLOW', 'node_tiers': 'NODE TIERS'
    },
    es: { 
        'start': 'INICIO', 'balance': 'SALDO', 'tasks': 'TAREAS', 'record': 'REGISTRO', 'settings': 'AJUSTES', 
        'available_balance': 'SALDO DISPONIBLE', 'welcome_back': 'BIENVENIDO', 'deposit': 'DEPÓSITO', 
        'withdraw': 'RETIRAR', 'records': 'REGISTROS', 'salary': 'SALARIO', 'invite': 'INVITAR', 
        'certificate': 'CERTIFICADO', 'wallet': 'BILLETERA', 'support': 'SOPORTE', 'faq': 'PREGUNTAS'
    },
    fr: { 
        'start': 'DÉMARRER', 'balance': 'SOLDE', 'tasks': 'TÂCHES', 'record': 'REGISTRE', 'settings': 'PARAMÈTRES', 
        'available_balance': 'SOLDE DISPONIBLE', 'welcome_back': 'BIENVENUE', 'deposit': 'DÉPÔT', 
        'withdraw': 'RETRAIT', 'records': 'RECORDS', 'salary': 'SALAIRE', 'invite': 'INVITER', 
        'certificate': 'CERTIFICAT', 'wallet': 'PORTEFEUILLE', 'support': 'SUPPORT', 'faq': 'FAQ'
    },
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
    hi: { 'start': 'प्रारंभ', 'balance': 'शेष', 'tasks': 'कार्य', 'record': 'रिकॉर्ड', 'settings': 'समायोजन', 'available_balance': 'उपलब्ध शेष', 'welcome_back': 'स्वागत है' },
    vi: { 'start': 'BẮT ĐẦU', 'balance': 'SỐ DƯ', 'tasks': 'NHIỆM VỤ', 'record': 'HỒ SƠ', 'settings': 'CÀI ĐẶT', 'available_balance': 'SỐ DƯ KHẢ DỤNG', 'welcome_back': 'CHÀO MỪNG TRỞ LẠI' },
    th: { 'start': 'เริ่มต้น', 'balance': 'ยอดคงเหลือ', 'tasks': 'งาน', 'record': 'บันทึก', 'settings': 'การตั้งค่า', 'available_balance': 'ยอดคงเหลือที่ใช้ได้', 'welcome_back': 'ยินดีต้อนรับกลับ' },
    id: { 'start': 'MULAI', 'balance': 'SALDO', 'tasks': 'TUGAS', 'record': 'CATATAN', 'settings': 'PENGATURAN', 'available_balance': 'SALDO TERSEDIA', 'welcome_back': 'SELAMAT DATANG KEMBALI' },
    bn: { 'start': 'শুরু করুন', 'balance': 'ব্যালেন্স', 'tasks': 'কাজ', 'record': 'রেকর্ড', 'settings': 'সেটিংস', 'available_balance': 'উপলব্ধ ব্যালেন্স', 'welcome_back': 'ফিরে আসার জন্য স্বাগতম' },
    ms: { 'start': 'MULA', 'balance': 'BAKI', 'tasks': 'TUGASAN', 'record': 'REKOD', 'settings': 'TETAPAN', 'available_balance': 'BAKI TERSEDIA', 'welcome_back': 'SELAMAT KEMBALI' },
    tl: { 'start': 'SIMULA', 'balance': 'BALANSE', 'tasks': 'GAWAIN', 'record': 'REKORD', 'settings': 'SETTINGS', 'available_balance': 'AVALABOL NA BALANSE', 'welcome_back': 'MALIGAYANG PAGBABALIK' },
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
