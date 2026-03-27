'use client'

import { ChevronLeft, ShieldCheck, Globe, Zap, Users, Award } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'

export default function AboutPage() {
  return (
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-60'>
      {/* Header */}
      <div className='px-6 pt-10 pb-6 sticky top-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/5'>
        <div className='flex items-center justify-between'>
          <Link href='/app/profile'>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors hover:bg-white/10 border border-white/5">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Mission Protocol</h1>
          <div className='w-10' />
        </div>
      </div>

      <div className='px-6 mt-8 space-y-12'>
        {/* Hero Section */}
        <div className='relative rounded-[48px] bg-gradient-to-tr from-zinc-900 via-black to-zinc-900 p-10 border border-white/10 shadow-3xl text-center overflow-hidden'>
            <div className='absolute inset-0 bg-[url("/strategic_hub_bg.png")] bg-cover bg-center opacity-10 mix-blend-overlay' />
            <div className='relative z-10 space-y-4'>
                <div className='w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 border border-cyan-500/20'>
                    <Globe className='w-10 h-10 text-cyan-400' />
                </div>
                <h2 className='text-4xl font-black tracking-tighter italic uppercase'>CAPTIV8 GLOBAL</h2>
                <p className='text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]'>The Institutional Standard</p>
                <div className='h-1 w-20 bg-cyan-600 mx-auto rounded-full mt-6 shadow-[0_0_15px_rgba(6,182,212,0.5)]' />
            </div>
        </div>

        {/* Narrative Section */}
        <div className='space-y-6'>
            <div className='flex items-center gap-4'>
                <div className='w-1.5 h-6 bg-cyan-600 rounded-full' />
                <h3 className='text-lg font-black italic tracking-tight uppercase'>Our Directive</h3>
            </div>
            <p className='text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed'>
                NodeFlow is a global leader in AI-driven task synchronization and institutional data processing. We specialize in high-frequency node verification, bridging the gap between decentralized algorithms and human-verified datasets.
            </p>
            <p className='text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed'>
                Our mission is to provide an elite, encrypted infrastructure for agents seeking to contribute to the global digital economy through seamless, secure, and incentivized node operations.
            </p>
        </div>

        {/* Value Grid */}
        <div className='grid grid-cols-2 gap-4'>
            {[
                { icon: ShieldCheck, label: 'Secured', sub: 'Neural Encryption' },
                { icon: Zap, label: 'Instant', sub: 'Sync Protocol' },
                { icon: Users, label: 'Global', sub: 'Agent Network' },
                { icon: Award, label: 'Vetted', sub: 'Institutional' }
            ].map((item, idx) => (
                <div key={idx} className='p-6 bg-zinc-900/40 border border-white/5 rounded-[32px] flex flex-col items-center gap-3 text-center'>
                    <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400'>
                        <item.icon size={20} />
                    </div>
                    <div>
                        <p className='text-[10px] font-black uppercase tracking-tight'>{item.label}</p>
                        <p className='text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5'>{item.sub}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Footer Audit */}
        <div className='p-8 bg-zinc-900/20 border border-dashed border-white/10 rounded-[40px] text-center'>
            <p className='text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]'>Authorized Version: 4.0.0A</p>
            <p className='text-[8px] font-bold text-zinc-800 uppercase tracking-widest mt-2'>Established 2024 • Blockchain Verified</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
