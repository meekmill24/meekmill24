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
  Info
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
    <main className='min-h-screen bg-black text-white pb-32'>
      {/* Header */}
      <div className='px-6 pt-10 pb-6 sticky top-0 z-20 bg-black/80 backdrop-blur-md'>
        <div className='flex items-center justify-between'>
          <Link href='/app'>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors hover:bg-white/10">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Control Center</h1>
          <div className='w-10' />
        </div>
      </div>

      <div className='px-6 space-y-8'>
        {/* User Profile Header Card */}
        <div className='relative rounded-[40px] bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 border border-white/10 shadow-2xl overflow-hidden'>
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <User className="w-24 h-24" />
            </div>
            
            <div className='flex items-center gap-6 mb-8 relative z-10'>
                <div className='w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-3xl font-black shadow-lg shadow-cyan-500/20'>
                  {profile?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className='text-2xl font-black tracking-tight mb-1'>{profile?.email?.split('@')[0]}</h2>
                  <p className='text-xs font-bold text-zinc-500 uppercase tracking-widest'>{profile?.email}</p>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 relative z-10'>
                <div className='bg-black/40 rounded-3xl p-5 border border-white/5'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1'>Influence Tier</p>
                    <p className='text-sm font-black text-cyan-400'>LEVEL 1 COLLECTOR</p>
                </div>
                <div className='bg-black/40 rounded-3xl p-5 border border-white/5'>
                    <p className='text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1'>Credit Rating</p>
                    <p className='text-sm font-black text-green-400'>{profile?.credit_rating || 100}%</p>
                </div>
            </div>
        </div>

        {/* Referral Card */}
        <div className='bg-zinc-900/50 rounded-[32px] p-6 border border-white/10 shadow-xl'>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                    <Share2 className='w-5 h-5 text-purple-400' />
                    <span className='text-sm font-black uppercase tracking-widest'>Invite Link</span>
                </div>
                <span className='text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-md'>Active</span>
            </div>
            <div className='flex items-center gap-2'>
                <div className='flex-1 h-14 bg-black rounded-2xl flex items-center px-5 font-black tracking-widest text-lg'>
                    {referralCode}
                </div>
                <Button 
                    onClick={() => copyToClipboard(referralCode)}
                    className='h-14 w-14 bg-purple-600 hover:bg-purple-500 rounded-2xl transition-all active:scale-95'
                >
                    <Copy className='w-5 h-5' />
                </Button>
            </div>
            <p className='text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-4 text-center'>
                Share this code to earn 10% from every task validation
            </p>
        </div>

        {/* Menu Sections */}
        <div className='space-y-4 pb-12'>
            <div className='space-y-2'>
                <p className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-4 mb-3'>Account Settings</p>
                
                {[
                    { icon: Shield, label: 'Security & Access', sub: '2FA and biometric auth', href: '#' },
                    { icon: CreditCard, label: 'Financial Hub', sub: 'Linked cards and payout history', href: '#' },
                    { icon: Bell, label: 'Communication', sub: 'Push, email, and social alerts', href: '#' },
                    { icon: Info, label: 'Platform Knowledge', sub: 'User guides and FAQ', href: '#' },
                    { icon: Globe, label: 'Globalization', sub: 'English (US)', href: '#' },
                ].map((item, idx) => (
                    <Link key={idx} href={item.href} className='group block'>
                        <div className='flex items-center justify-between p-6 rounded-[28px] bg-zinc-900/40 border border-white/5 hover:bg-zinc-800 transition-all hover:border-white/10'>
                            <div className='flex items-center gap-4'>
                                <div className='w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform'>
                                    <item.icon className='w-5 h-5 text-zinc-400 group-hover:text-cyan-400' />
                                </div>
                                <div>
                                    <p className='text-sm font-bold tracking-tight'>{item.label}</p>
                                    <p className='text-[10px] font-medium text-zinc-500'>{item.sub}</p>
                                </div>
                            </div>
                            <ChevronRight className='w-4 h-4 text-zinc-600 group-hover:text-white transition-colors' />
                        </div>
                    </Link>
                ))}
            </div>

            <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className='w-full h-16 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-[28px] font-black tracking-[0.2em] uppercase transition-all shadow-lg active:scale-[0.98]'
            >
                {isLoggingOut ? (
                    <Spinner className="h-4 w-4 mr-2" />
                ) : (
                    <LogOut className='w-5 h-5 mr-3' />
                )}
                {isLoggingOut ? 'Terminating Session...' : 'Disconnect Account'}
            </Button>

            <div className='text-center pt-8 opacity-20'>
                <p className='text-[10px] font-black tracking-[0.3em] uppercase mb-1'>Captiv8 Music v2.4.0</p>
                <p className='text-[8px] font-bold uppercase'>Encrypted Protocol 256-Bit</p>
            </div>
        </div>
      </div>

      <BottomNav active='profile' />
    </main>
  )
}
