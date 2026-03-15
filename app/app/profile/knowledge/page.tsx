'use client'

import { ChevronLeft, Info, HelpCircle, FileText, BookOpen, Search, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'

export default function KnowledgePage() {
  const articles = [
    { title: 'The Neural Matching System', sub: 'Understanding how AI verifies tasks', time: '5 min read' },
    { title: 'Tier Progression Guide', sub: 'How to advance from Level 1 to 3', time: '12 min read' },
    { title: 'Payout Protocols', sub: 'Global settlement and withdrawal windows', time: '8 min read' },
    { title: 'Agent Code of Conduct', sub: 'Maintaining high credit ratings', time: '15 min read' },
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
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Platform Knowledge</h1>
        </div>
      </div>

      <div className='px-6 space-y-8 mt-8'>
        {/* Search Header */}
        <div className="p-8 rounded-[48px] bg-gradient-to-br from-cyan-500/20 to-transparent border border-white/10 shadow-3xl">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">Intelligence<br/>Database</h2>
            <div className="relative mt-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search protocol documentation..." 
                    className="w-full h-16 bg-black/40 rounded-3xl pl-14 pr-6 border border-white/5 outline-none text-sm font-bold placeholder:text-zinc-600 focus:border-cyan-500/30 transition-all"
                />
            </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
            <div className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 flex flex-col items-center text-center gap-4 group hover:bg-zinc-800 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-2">FAQ Hub</p>
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest italic">Rapid Response</p>
                </div>
            </div>
            <div className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 flex flex-col items-center text-center gap-4 group hover:bg-zinc-800 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-2">Manuals</p>
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest italic">Deep Dive</p>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between ml-4 mb-4">
                <p className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600'>Latest Intel</p>
                <div className="h-px flex-1 mx-6 bg-white/5" />
            </div>

            <div className="space-y-3">
                {articles.map((article, idx) => (
                    <div key={idx} className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 flex items-center justify-between group hover:bg-zinc-800 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight italic">{article.title}</p>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">{article.sub}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-colors" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400/40">{article.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-8 rounded-[40px] bg-zinc-900/60 border border-white/10 flex items-center justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Zap className="w-20 h-20" />
            </div>
            <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest mb-2">Need Direct Comms?</p>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Connect with our support neural net for immediate assistance.</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center border-4 border-black shadow-xl active:scale-90 transition-all cursor-pointer">
                <Search className="w-6 h-6" />
            </div>
        </div>
      </div>

      <BottomNav active='profile' />
    </main>
  )
}
