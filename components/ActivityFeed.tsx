'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { Award, Zap, TrendingUp, UserCheck } from 'lucide-react';

interface Activity {
    id: number;
    username: string;
    action: string;
    amount?: number;
    type: 'earning' | 'upgrade' | 'deposit';
}

const MOCK_USERNAMES = [
    'Jack***', 'Liam***', 'Noah***', 'Oliver***', 'James***', 'Elijah***', 
    'Lucas***', 'Mason***', 'Ethan***', 'Logan***', 'Aiden***', 'Sofia***', 
    'Emma***', 'Olivia***', 'Isabella***', 'Mia***', 'Charlotte***', 'Amelia***'
];

const ACTIONS = [
    { text: 'just earned', type: 'earning' as const },
    { text: 'upgraded to', type: 'upgrade' as const },
    { text: 'just deposited', type: 'deposit' as const }
];

export default function ActivityFeed() {
    const { format } = useCurrency();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const generateActivity = () => {
            const username = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
            const actionInfo = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            
            let amount: number | undefined;
            let actionText = actionInfo.text;

            if (actionInfo.type === 'earning') {
                amount = Math.random() * 50 + 5; 
            } else if (actionInfo.type === 'deposit') {
                amount = [30, 50, 100, 300, 500, 1000][Math.floor(Math.random() * 6)];
            } else {
                actionText = `upgraded to VIP ${Math.floor(Math.random() * 4) + 2}`;
            }

            const newActivity: Activity = {
                id: Date.now(),
                username,
                action: actionText,
                amount,
                type: actionInfo.type
            };

            setCurrentActivity(newActivity);
            setIsVisible(true);

            setTimeout(() => {
                setIsVisible(false);
            }, 6000);
        };

        const interval = setInterval(() => {
            generateActivity();
        }, 12000);

        setTimeout(generateActivity, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleSupportClick = () => {
        const tawk = (window as any).Tawk_API;
        if (tawk) {
            tawk.maximize?.();
        }
    };

    if (!currentActivity) return null;

    return (
        <div className={`fixed !top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-out transform ${
            isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-95'
        }`}>
            <div 
                onClick={handleSupportClick}
                className={`px-4 py-3 flex items-center gap-3 border transition-all duration-300 min-w-[240px] cursor-pointer hover:scale-105 active:scale-95 border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-none rounded-[20px]`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    currentActivity.type === 'earning' ? 'bg-green-500/20 text-green-500' : 
                    currentActivity.type === 'upgrade' ? 'bg-amber-500/20 text-amber-500' : 'bg-purple-500/20 text-purple-400'
                }`}>
                    {currentActivity.type === 'earning' ? <Zap size={14} /> : 
                     currentActivity.type === 'upgrade' ? <Award size={14} /> : <TrendingUp size={14} />}
                </div>
                
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-cyan-500 uppercase tracking-tighter">
                            {currentActivity.username}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            {currentActivity.action}
                        </span>
                    </div>
                    {currentActivity.amount && (
                        <span className={`text-xs font-black tracking-tight ${
                            currentActivity.type === 'earning' ? 'text-green-500' : 'text-purple-400'
                        }`}>
                            {format(currentActivity.amount)}
                        </span>
                    )}
                    {!currentActivity.amount && (
                        <div className="flex items-center gap-1 mt-0.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                           <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Unlocked Benefits</span>
                        </div>
                    )}
                </div>

                <div className="ml-auto pl-2 border-l border-white/5 flex flex-col items-center">
                    <UserCheck size={12} className="text-slate-500 opacity-30" />
                    <span className="text-[8px] font-mono text-slate-600">SECURE</span>
                </div>
            </div>
        </div>
    );
}
