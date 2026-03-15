'use client'

import { ChevronLeft, CreditCard, History, ArrowUpRight, ArrowDownLeft, Plus, Wallet, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'

export default function FinancialPage() {
  const transactions = [
    { type: 'reward', amount: '+12.50', status: 'Completed', date: '2024-03-15', id: 'TX-9921' },
    { type: 'withdrawal', amount: '-45.00', status: 'Pending', date: '2024-03-14', id: 'TX-9844' },
    { type: 'reward', amount: '+15.20', status: 'Completed', date: '2024-03-14', id: 'TX-9821' },
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
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Financial Hub</h1>
        </div>
      </div>

      <div className='px-6 space-y-8 mt-8'>
        {/* Card Section */}
        <div className="relative aspect-[1.58/1] w-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-black rounded-[40px] p-10 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
                <Wallet className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Global Assets</p>
                    <p className="text-4xl font-black tracking-tighter">$ 2,450.00</p>
                </div>
                <div className="w-14 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 backdrop-blur-md">
                    <span className="text-[10px] font-black italic">PRIORITY</span>
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-[12px] font-black tracking-[0.4em] opacity-40">•••• •••• •••• 8842</p>
                <div className="flex justify-between items-end mt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Strategic Multi-Wallet</p>
                    <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/80 border border-white/10" />
                        <div className="w-8 h-8 rounded-full bg-yellow-500/80 border border-white/10" />
                    </div>
                </div>
            </div>
        </div>

        <div className="flex gap-4">
            <Button className="flex-1 h-16 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 shadow-xl active:scale-95 transition-all">
                <Plus className="w-5 h-5 mr-3" /> Add Fund
            </Button>
            <Button variant="outline" className="flex-1 h-16 border-white/5 bg-zinc-900/40 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-800 transition-all active:scale-95">
                Payout
            </Button>
        </div>

        <div className='space-y-4'>
            <div className="flex items-center justify-between ml-4 mb-4">
                <p className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600'>Transfer History</p>
                <div className="h-px flex-1 mx-6 bg-white/5" />
            </div>
            
            <div className="space-y-3">
                {transactions.map((tx, idx) => (
                    <div key={idx} className="p-6 rounded-[32px] bg-zinc-900/30 border border-white/5 flex items-center justify-between group hover:bg-zinc-900/60 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'reward' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                {tx.type === 'reward' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight italic">{tx.type === 'reward' ? 'VERIFICATION REWARD' : 'PLATFORM WITHDRAWAL'}</p>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">{tx.date} • {tx.id}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black tracking-tight">{tx.amount}</p>
                            <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${tx.status === 'Completed' ? 'text-green-500' : 'text-orange-500'}`}>{tx.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-[32px] flex items-center gap-4">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none">
                All payouts are verified by the Captiv8 Global Settlement Protocol.
            </p>
        </div>
      </div>

      <BottomNav active='profile' />
    </main>
  )
}
