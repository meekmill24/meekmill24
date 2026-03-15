'use client'

import { ChevronLeft, Globe, Check, MapPin, Languages, Clock } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function GlobalizationPage() {
  const [selectedLang, setSelectedLang] = useState('en')
  
  const languages = [
    { id: 'en', name: 'English (US)', flag: '🇺🇸', zone: 'UTC -5' },
    { id: 'es', name: 'Español', flag: '🇪🇸', zone: 'UTC +1' },
    { id: 'fr', name: 'Français', flag: '🇫🇷', zone: 'UTC +1' },
    { id: 'de', name: 'Deutsch', flag: 'DE', zone: 'UTC +1' },
    { id: 'cn', name: '简体中文', flag: '🇨🇳', zone: 'UTC +8' },
  ]

  return (
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-32'>
      <div className='px-6 pt-10 pb-6 sticky top-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/5'>
        <div className='flex items-center gap-4'>
          <Link href='/app/profile'>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Globalization</h1>
        </div>
      </div>

      <div className='px-6 space-y-8 mt-8'>
        <div className='bg-zinc-900/40 rounded-[40px] p-10 border border-white/10 shadow-xl overflow-hidden relative'>
            <div className="absolute top-0 right-0 p-10 opacity-5">
                <Globe className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                        <Languages className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tight">Locale Config</h2>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Adjust regional platform parameters</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {languages.map((lang) => (
                        <div 
                            key={lang.id} 
                            onClick={() => setSelectedLang(lang.id)}
                            className={cn(
                                "flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer group",
                                selectedLang === lang.id 
                                    ? "bg-white text-black border-white shadow-xl shadow-white/5" 
                                    : "bg-black/40 border-white/5 hover:border-white/10 text-white"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner",
                                    selectedLang === lang.id ? "bg-black/5" : "bg-white/5"
                                )}>
                                    {lang.flag}
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight italic">{lang.name}</p>
                                    <p className={cn(
                                        "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                                        selectedLang === lang.id ? "text-zinc-500" : "text-zinc-600"
                                    )}>{lang.id.toUpperCase()} • {lang.zone}</p>
                                </div>
                            </div>
                            {selectedLang === lang.id && (
                                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
                                    <Check className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className='space-y-4 pb-12'>
            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-4 mb-4'>Regional Services</p>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 flex flex-col gap-3">
                    <MapPin className="w-5 h-5 text-zinc-500" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Main Node</p>
                        <p className="text-xs font-bold uppercase">NORTH AMERICA</p>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 flex flex-col gap-3">
                    <Clock className="w-5 h-5 text-zinc-500" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Timestamp</p>
                        <p className="text-xs font-bold uppercase">UTC -05:00</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <BottomNav active='profile' />
    </main>
  )
}
