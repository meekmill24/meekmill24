'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import InstitutionalCertificate from '@/components/InstitutionalCertificate';
import { supabase } from '@/lib/supabase';

export default function CertificatePage() {
    const { profile, loading } = useAuth();
    const router = useRouter();
    const [settings, setSettings] = React.useState<any>({});

    React.useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('*');
            if (data) {
                const s: any = {};
                data.forEach(item => s[item.key] = item.value);
                setSettings(s);
            }
        };
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Spinner className="w-8 h-8 text-cyan-500" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center gap-6">
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Access Denied: Node Unregistered</p>
                <button onClick={() => router.push('/auth/login')} className="px-8 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest">
                    Identify Session
                </button>
            </div>
        );
    }

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const nodeId = profile.id.slice(0, 12).toUpperCase();

    return (
        <div className="min-h-screen bg-black text-white pb-32">
            {/* Header Node */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4 print:hidden">
                <button 
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-black italic tracking-tighter uppercase">Registry Hub</h1>
            </div>

            <div className="p-6 md:p-10">
                <div className="mb-12 text-center print:hidden">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Agent Validation</h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Official Institutional Credentials</p>
                </div>

                <InstitutionalCertificate 
                    username={profile.username || profile.email?.split('@')[0] || 'Unknown'} 
                    level={profile.level?.name || 'Standard Agent'} 
                    date={today}
                    nodeId={nodeId}
                    platformName={settings.platform_name}
                    platformAddress={settings.platform_address}
                />
                
                <div className="mt-12 max-w-2xl mx-auto p-8 bg-zinc-900/40 border border-white/5 rounded-[32px] text-center print:hidden">
                    <p className="text-xs text-zinc-500 italic leading-relaxed">
                        "Your institutional certificate is a high-fidelity proof of your synchronized node status. Please ensure this document remains confidential to protect your agent identity."
                    </p>
                </div>
            </div>
        </div>
    );
}
