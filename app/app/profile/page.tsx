'use client'

import { useEffect, useState } from 'react'
import { 
  ChevronLeft, 
  Shield, 
  Lock, 
  Bell, 
  Moon, 
  Globe, 
  LogOut, 
  MessageCircle, 
  FileText, 
  Lock as LockIcon,
  User,
  CreditCard,
  Share2,
  Copy,
  ChevronRight,
  Info,
  AtSign,
  Phone
} from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/index'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/use-profile'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { profile, isLoading, mutate } = useProfile()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
      setIsLoggingOut(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Referral code copied!')
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <Spinner className='h-8 w-8 text-primary' />
      </div>
    )
  }

  const referralCode = profile?.referral_code || profile?.id?.slice(0, 4).toUpperCase() || 'N/A'

  return (
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-32'>
      {/* Header */}
      <div className='px-6 pt-10 pb-6 sticky top-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/5'>
        <div className='flex items-center justify-between'>
          <Link href='/app'>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors hover:bg-white/10 border border-white/5">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Control Center</h1>
          <div className='w-10' />
        </div>
      </div>

      <div className='px-6 space-y-8 mt-6'>
        {/* User Profile Header Card */}
        <div className='relative rounded-[48px] bg-zinc-900/60 p-10 border border-white/10 shadow-2xl relative overflow-hidden'>
            <div className="absolute top-0 right-0 p-10 opacity-5">
                <AtSign className="w-32 h-32" />
            </div>
            
            <div className='flex flex-col items-center gap-6 mb-10 relative z-10'>
                <div className='w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20 p-1'>
                    <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md">
                        <span className="text-3xl font-black">{profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}</span>
                    </div>
                </div>
                <div className="text-center">
                  <h2 className='text-3xl font-black tracking-tighter mb-2 italic'>{profile?.username || profile?.email?.split('@')[0]}</h2>
                  <div className="flex items-center justify-center gap-2 opacity-40">
                    <AtSign className="w-3 h-3" />
                    <p className='text-[10px] font-black uppercase tracking-widest'>{profile?.email}</p>
                  </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 relative z-10'>
                <div className='bg-black/40 rounded-3xl p-6 border border-white/5 backdrop-blur-md'>
                    <p className='text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2'>Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className='text-xs font-black text-white hover:text-cyan-400 transition-colors uppercase tracking-widest'>ACTIVE AGENT</p>
                    </div>
                </div>
                <div className='bg-black/40 rounded-3xl p-6 border border-white/5 backdrop-blur-md'>
                    <p className='text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2'>ID Priority</p>
                    <p className='text-xs font-black text-cyan-400 uppercase tracking-widest'>PRIORITY ALPHA</p>
                </div>
            </div>
        </div>

        {/* Action Row */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Encrypted Line</p>
                    <p className="text-xs font-bold truncate opacity-80">{profile?.phone_number || 'NOT LINKED'}</p>
                </div>
            </div>
            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-900">Wallet</p>
                    <p className="text-xs font-black text-white">$ {profile?.wallet_balance?.toFixed(2) || '0.00'}</p>
                </div>
            </div>
        </div>

        {/* Referral Card */}
        <div className='bg-zinc-900/40 rounded-[40px] p-8 border border-white/10 shadow-xl relative overflow-hidden group'>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className='flex items-center justify-between mb-6 relative z-10'>
                <div className='flex items-center gap-4'>
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Share2 className='w-5 h-5 text-purple-400' />
                    </div>
                    <div>
                        <span className='text-xs font-black uppercase tracking-widest'>Agent Referral</span>
                        <p className="text-[8px] font-bold text-zinc-600 uppercase mt-0.5">Encrypted invitation link</p>
                    </div>
                </div>
                <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full'>
                    <div className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span className='text-[8px] font-black text-zinc-500 uppercase tracking-widest'>Live</span>
                </div>
            </div>
            <div className='flex items-center gap-3 relative z-10'>
                <div className='flex-1 h-14 bg-black rounded-2xl flex items-center px-6 font-black tracking-[0.3em] text-lg border border-white/5'>
                    {referralCode}
                </div>
                <Button 
                    onClick={() => copyToClipboard(referralCode)}
                    className='h-14 w-14 bg-purple-600 hover:bg-purple-500 rounded-2xl transition-all active:scale-95 shadow-lg shadow-purple-900/20'
                >
                    <Copy className='w-5 h-5' />
                </Button>
            </div>
        </div>

        {/* Menu Sections */}
        <div className='space-y-6 pb-20'>
            <div className='space-y-3'>
                <div className="flex items-center justify-between ml-4 mb-4">
                    <p className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600'>System Configuration</p>
                    <div className="h-px flex-1 mx-6 bg-white/5" />
                </div>
                
                {[
                    { icon: Shield, label: 'Security & Access', sub: '2FA and biometric auth', href: '/app/profile/security' },
                    { icon: CreditCard, label: 'Financial Hub', sub: 'Linked cards and payout history', href: '/app/profile/financial' },
                    { icon: Bell, label: 'Communication', sub: 'Push, email, and social alerts', href: '/app/profile/communication' },
                    { icon: Info, label: 'Platform Knowledge', sub: 'User guides and FAQ', href: '/app/profile/knowledge' },
                    { icon: Globe, label: 'Globalization', sub: 'English (US)', href: '/app/profile/globalization' },
                ].map((item, idx) => (
                    <Link key={idx} href={item.href} className='group block'>
                        <div className='flex items-center justify-between p-6 rounded-[32px] bg-zinc-900/30 border border-white/5 hover:bg-zinc-800/80 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-black/40'>
                            <div className='flex items-center gap-5'>
                                <div className='w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500 shadow-xl group-hover:shadow-cyan-500/20'>
                                    <item.icon className='w-5 h-5 transition-transform duration-500 group-hover:scale-110' />
                                </div>
                                <div>
                                    <p className='text-sm font-black tracking-tight uppercase italic'>{item.label}</p>
                                    <p className='text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5 group-hover:text-zinc-400'>{item.sub}</p>
                                </div>
                            </div>
                            <ChevronRight className='w-4 h-4 text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all' />
                        </div>
                    </Link>
                ))}
            </div>

            <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className='w-full h-16 bg-red-600/5 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/10 rounded-[32px] font-black tracking-[0.4em] uppercase transition-all shadow-xl active:scale-[0.98] mt-8'
            >
                {isLoggingOut ? (
                    <Spinner className="h-4 w-4 mr-2" />
                ) : (
                    <LogOut className='w-5 h-5 mr-4' />
                )}
                {isLoggingOut ? 'Terminating...' : 'Disconnect'}
            </Button>

            <div className='text-center pt-12 opacity-15'>
                <p className='text-[10px] font-black tracking-[0.5em] uppercase mb-1'>Captiv8 Protocol v4.0</p>
                <p className='text-[8px] font-bold uppercase tracking-[0.2em]'>Neural Encryption 512-Bit</p>
            </div>
        </div>
      </div>

      <BottomNav active='profile' />
    </main>
  )
}
