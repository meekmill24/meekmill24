'use client'

import { ChevronLeft, Bell, Mail, MessageSquare, AtSign, Settings2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Switch } from '@/components/ui/switch'

export default function CommunicationPage() {
  const channels = [
    { icon: Bell, title: 'Push Notifications', sub: 'In-app real-time alerts', active: true },
    { icon: Mail, title: 'Email Digests', sub: 'Weekly earning summaries', active: true },
    { icon: MessageSquare, title: 'SMS Protocol', sub: 'Security and verification codes', active: false },
    { icon: AtSign, title: 'Social Integration', sub: 'Mention and tag alerts', active: true },
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
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Communication</h1>
        </div>
      </div>

      <div className='px-6 space-y-8 mt-8'>
        <div className='bg-zinc-900/40 rounded-[40px] p-10 border border-white/10 shadow-xl overflow-hidden relative'>
            <div className="absolute top-0 right-0 p-10 opacity-5">
                <Bell className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                        <Settings2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tight">Signal Config</h2>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Adjust protocol transmission</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {channels.map((channel, idx) => (
                        <div key={idx} className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5 transition-all hover:border-white/10 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-colors group-hover:bg-cyan-500/10">
                                    <channel.icon className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight">{channel.title}</p>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">{channel.sub}</p>
                                </div>
                            </div>
                            <Switch defaultChecked={channel.active} />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-8 rounded-[40px] bg-zinc-900/40 border border-white/5 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-4 mb-2">Priority Channels</h3>
            
            <div className="p-6 rounded-3xl bg-black/60 border border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500 flex items-center justify-center text-black font-black">
                        AI
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight italic">Direct Neural Link</p>
                        <p className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest mt-0.5">ESTABLISHED • V4.0</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </div>
            </div>
        </div>

        <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-[32px] flex items-center gap-4">
            <ShieldAlert className="w-6 h-6 text-orange-500" />
            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-relaxed">
                Critical system alerts and security breaches will bypass these settings to ensure account integrity.
            </p>
        </div>
      </div>

      <BottomNav active='profile' />
    </main>
  )
}
