'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  Wallet, 
  ShieldCheck, 
  ExternalLink, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Portal from '@/components/Portal'
import { Spinner } from '@/components/ui/spinner'

export default function FinancialPage() {
  const { profile, mutate, loading: isLoading } = useAuth()
  const { format } = useCurrency()
  const [transactions, setTransactions] = useState<any[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [isBindModalOpen, setIsBindModalOpen] = useState(false)
  const [bindLoading, setBindLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  useEffect(() => {
    if (profile?.withdrawal_wallet_address) {
      setWalletAddress(profile.withdrawal_wallet_address)
    }
  }, [profile])

  useEffect(() => {
    async function fetchTransactions() {
      if (!profile?.id) return
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setTransactions(data || [])
      } catch (err) {
        console.error('Error fetching transactions:', err)
      } finally {
        setTxLoading(false)
      }
    }

    fetchTransactions()
  }, [profile?.id])

  const handleBindWallet = async () => {
    if (!walletAddress.trim()) {
      return toast.error('Please enter a valid node address')
    }

    setBindLoading(true)
    const toastId = toast.loading('Synchronizing wallet node...')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ withdrawal_wallet_address: walletAddress.trim() })
        .eq('id', profile?.id)

      if (error) throw error

      await mutate()
      setIsBindModalOpen(false)
      toast.success('Withdrawal Node Verified', { id: toastId })
    } catch (err: any) {
      toast.error('Verification failed: ' + err.message, { id: toastId })
    } finally {
      setBindLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <Spinner className='h-8 w-8 text-cyan-400' />
      </div>
    )
  }

  return (
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-60'>
      <div className='px-6 pt-10 pb-6 sticky top-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/5'>
        <div className='flex items-center gap-4'>
          <Link href='/app/profile'>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 transition-colors hover:bg-white/10">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Financial Hub</h1>
        </div>
      </div>

      <div className='px-6 space-y-8 mt-8'>
        {/* Wallet Address Status */}
        <div className='bg-zinc-900/60 rounded-[40px] p-8 border border-white/10 shadow-xl relative overflow-hidden group'>
            <div className={`absolute top-0 right-0 p-8 opacity-5 transition-transform duration-700 group-hover:scale-110 ${profile?.withdrawal_wallet_address ? 'text-green-500' : 'text-orange-500'}`}>
                <ShieldCheck className="w-32 h-32" />
            </div>
            
            <div className='flex items-center gap-4 mb-8 relative z-10'>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${profile?.withdrawal_wallet_address ? 'bg-green-500/10 text-green-400 shadow-green-500/10' : 'bg-orange-500/10 text-orange-400 shadow-orange-500/10'}`}>
                    {profile?.withdrawal_wallet_address ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                    <span className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500'>Settlement Node</span>
                    <p className={`text-xs font-black uppercase tracking-widest mt-0.5 ${profile?.withdrawal_wallet_address ? 'text-green-400' : 'text-orange-400'}`}>
                        {profile?.withdrawal_wallet_address ? 'VERIFIED CRYPTO PROTOCOL' : 'IDENTITY BINDING REQUIRED'}
                    </p>
                </div>
            </div>

            <div className='p-6 bg-black rounded-3xl border border-white/5 mb-8 relative z-10'>
                <p className='text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3'>Node Address (TRC20)</p>
                <div className='flex items-center justify-between'>
                    <p className={`text-xs font-black tracking-[0.1em] ${profile?.withdrawal_wallet_address ? 'text-white' : 'text-zinc-700 italic'}`}>
                        {profile?.withdrawal_wallet_address 
                            ? `${profile.withdrawal_wallet_address.slice(0, 12)}••••••••${profile.withdrawal_wallet_address.slice(-6)}` 
                            : 'BINDING_PENDING_0x00'}
                    </p>
                    {profile?.withdrawal_wallet_address && <ExternalLink size={14} className="text-zinc-600" />}
                </div>
            </div>

            <Button 
                onClick={() => setIsBindModalOpen(true)}
                className='w-full h-14 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-200 active:scale-95 transition-all relative z-10'
            >
                <RefreshCcw className="w-4 h-4 mr-3" />
                {profile?.withdrawal_wallet_address ? 'Update Settlement Node' : 'Initialize Node Binding'}
            </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
                <p className='text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1'>Global Assets</p>
                <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black italic tabular-nums">
                        {format(profile?.wallet_balance || 0).split('.')[0]}
                        <span className="text-xs opacity-40">.{format(profile?.wallet_balance || 0).split('.')[1] || '00'}</span>
                    </span>
                </div>
            </div>
            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6 group hover:bg-cyan-500/10 transition-colors cursor-pointer">
                <p className='text-[9px] font-black uppercase tracking-[0.2em] text-cyan-600 mb-1'>Priority Yield</p>
                <p className='text-lg font-black text-cyan-400 italic'>+ 438% ELITE</p>
            </div>
        </div>

        <div className='space-y-4'>
            <div className="flex items-center justify-between ml-4 mb-4">
                <p className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600'>Transfer History</p>
                <div className="h-px flex-1 mx-6 bg-white/5" />
            </div>
            
            <div className="space-y-3">
                {txLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-20">
                        <Spinner className="w-6 h-6 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Ledger...</p>
                    </div>
                ) : transactions.length > 0 ? (
                    transactions.map((tx, idx) => (
                        <div key={idx} className="p-6 rounded-[32px] bg-zinc-900/30 border border-white/5 flex items-center justify-between group hover:bg-zinc-900/60 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    tx.type === 'commission' || tx.type === 'deposit' || tx.type === 'unfreeze' 
                                    ? 'bg-green-500/10 text-green-400' 
                                    : 'bg-orange-500/10 text-orange-400'
                                }`}>
                                    {tx.type === 'commission' || tx.type === 'deposit' || tx.type === 'unfreeze' 
                                        ? <ArrowDownLeft className="w-6 h-6" /> 
                                        : <ArrowUpRight className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight italic">
                                        {tx.type === 'commission' ? 'VERIFICATION REWARD' : 
                                         tx.type === 'withdrawal' ? 'PLATFORM WITHDRAWAL' : 
                                         tx.type === 'unfreeze' ? 'CAPITAL SETTLEMENT' : 
                                         tx.type === 'deposit' ? 'CREDIT RECHARGE' : 'SYSTEM ADJUSTMENT'}
                                    </p>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                                        {new Date(tx.created_at).toLocaleDateString()} • {tx.id}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black tracking-tight ${tx.amount < 0 ? 'text-orange-400' : 'text-white'}`}>
                                    {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)}
                                </p>
                                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${
                                    tx.status === 'approved' || tx.status === 'completed' ? 'text-green-500' : 
                                    tx.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                                }`}>
                                    {tx.status}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-[40px] border border-dashed border-white/5 opacity-40">
                        <Wallet className="w-10 h-10 mb-4 text-zinc-700" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Node Activity Detected</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {isBindModalOpen && (
          <Portal>
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsBindModalOpen(false)} />
                  <div className="relative w-full max-w-md bg-[#121215] border border-white/5 rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300">
                      <div className="flex flex-col items-center mb-8">
                          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
                              <RefreshCcw className="text-cyan-400" size={24} />
                          </div>
                          <h3 className="text-xl font-black text-white uppercase italic">Node Initialization</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-60">Bind Withdrawal Wallet</p>
                      </div>

                      <div className="space-y-6">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-zinc-600">Enter Settlement Address (TRC20)</label>
                              <div className='relative'>
                                <input 
                                    value={walletAddress}
                                    onChange={e => setWalletAddress(e.target.value)}
                                    placeholder="Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-xs text-white outline-none focus:border-cyan-500/40 transition-all font-mono placeholder:text-zinc-800"
                                />
                                <div className='absolute right-4 top-1/2 -translate-y-1/2 opacity-20'>
                                    <Wallet size={16} />
                                </div>
                              </div>
                          </div>

                          <div className='bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/10'>
                             <p className='text-[8px] font-bold text-cyan-500/60 uppercase leading-relaxed'>
                                 Important: Ensure you use a TRC20 compatible USDT node. NodeFlow cannot reverse settlements made to incorrect node protocols.
                             </p>
                          </div>
                      </div>

                      <div className="mt-10 flex flex-col gap-3">
                          <button 
                              onClick={handleBindWallet}
                              disabled={bindLoading}
                              className="w-full h-14 bg-cyan-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                              {bindLoading ? 'VERIFYING NODE...' : 'INITIALIZE BINDING'}
                          </button>
                          <button 
                              onClick={() => setIsBindModalOpen(false)}
                              disabled={bindLoading}
                              className="w-full h-14 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all"
                          >
                              CANCEL
                          </button>
                      </div>
                  </div>
              </div>
          </Portal>
      )}

      <BottomNav active='profile' />
    </main>
  )
}
