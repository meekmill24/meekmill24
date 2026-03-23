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
  Phone,
  ArrowUpRight,
  RefreshCcw,
  Award,
} from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/index'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import Portal from '@/components/Portal'
import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'

export default function ProfilePage() {
  const { profile, loading: isLoading, mutate } = useAuth()
  const { format } = useCurrency()
  const { t } = useLanguage()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [formData, setFormData] = useState({
      displayName: '',
      phoneNumber: ''
  })
  
  const router = useRouter()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setIsUploading(true)
    const toastId = toast.loading('Syncing node identity...')

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${profile.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      await mutate()
      toast.success('Node identity synchronized', { id: toastId })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Identity sync failed: ' + error.message, { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (profile) {
        setFormData({
            displayName: profile.display_name || '',
            phoneNumber: profile.phone_number || ''
        })
    }
  }, [profile])

  const handleSyncProfile = async () => {
    if (!profile) return
    setSyncLoading(true)
    const toastId = toast.loading('Syncing node registries...')
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName,
          phone_number: formData.phoneNumber
        })
        .eq('id', profile.id)

      if (error) throw error
      
      await mutate()
      setIsSyncModalOpen(false)
      toast.success('Node heartbeats synchronized', { id: toastId })
    } catch (err: any) {
      toast.error('Sync failed: ' + err.message, { id: toastId })
    } finally {
      setSyncLoading(false)
    }
  }

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
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-60'>
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
                <div className='relative group/avatar cursor-pointer' onClick={() => !isUploading && document.getElementById('avatar-input')?.click()}>
                    <div className='w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-1 shadow-[0_20px_60px_rgba(6,182,212,0.3)] group-hover/avatar:scale-105 transition-all duration-500'>
                        <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-md overflow-hidden flex items-center justify-center relative">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Agent" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                            ) : (
                                <span className="text-4xl font-black text-white italic drop-shadow-lg">
                                    {profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}
                                </span>
                            )}
                            
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Spinner className="w-8 h-8 text-cyan-400" />
                                </div>
                            )}
                            
                            <div className="absolute inset-0 bg-cyan-600/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                <User className="text-white" size={24} />
                                <span className="text-[8px] font-black uppercase text-white tracking-widest">Update</span>
                            </div>
                        </div>
                    </div>
                </div>
                <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                <div className="text-center">
                  <h2 className='text-3xl font-black tracking-tighter mb-2 italic'>{profile?.display_name || profile?.username || profile?.email?.split('@')[0]}</h2>
                  <div className="flex items-center justify-center gap-2 opacity-40">
                    <AtSign className="w-3 h-3" />
                    <p className='text-[10px] font-black uppercase tracking-widest'>{profile?.email}</p>
                  </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 relative z-10'>
                <Link href="/app/profile/verify" className="block">
                    <div className={`rounded-3xl p-6 border backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        profile?.verification_status === 'verified' ? 'bg-green-500/10 border-green-500/20' : 
                        profile?.verification_status === 'pending' ? 'bg-amber-500/10 border-amber-500/20' : 
                        'bg-rose-500/10 border-rose-500/20'
                    }`}>
                        <p className='text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2'>Identity</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${
                                profile?.verification_status === 'verified' ? 'bg-green-500' : 
                                profile?.verification_status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                            <p className='text-[10px] font-black text-white uppercase tracking-widest italic'>
                                {profile?.verification_status === 'verified' ? 'PROTOCOL VERIFIED' : 
                                 profile?.verification_status === 'pending' ? 'REVIEW PENDING' : 'ACTION REQUIRED'}
                            </p>
                        </div>
                    </div>
                </Link>
                <div 
                    onClick={() => setIsSyncModalOpen(true)}
                    className='bg-cyan-500/10 rounded-3xl p-6 border border-cyan-500/20 backdrop-blur-md cursor-pointer hover:bg-cyan-500/20 transition-all active:scale-[0.98]'
                >
                    <p className='text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-2'>Node Update</p>
                    <p className='text-[10px] font-black text-white uppercase tracking-widest'>SYNC REGISTRY</p>
                </div>
            </div>
        </div>

        {/* Executive Metrics */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-8 flex flex-col gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">Global Assets</p>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-black italic tabular-nums">
                            {format(profile?.wallet_balance || 0).split('.')[0]}
                            <span className="text-xs opacity-40">.{format(profile?.wallet_balance || 0).split('.')[1] || '00'}</span>
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-[40px] p-8 flex flex-col gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600 mb-1">Total Yield</p>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-xl font-black text-cyan-400 italic tabular-nums">
                            {format(profile?.total_earned || 0).split('.')[0]}
                            <span className="text-xs opacity-40">.{format(profile?.total_earned || 0).split('.')[1] || '00'}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Referral Card */}
        <div className='bg-zinc-900/40 rounded-[40px] p-8 border border-white/10 shadow-xl relative overflow-hidden group'>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className='flex items-center justify-between mb-8 relative z-10'>
                <div className='flex items-center gap-4'>
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                        <Share2 className='w-5 h-5 text-purple-400' />
                    </div>
                    <div>
                        <span className='text-xs font-black uppercase tracking-widest'>Identity Link</span>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase mt-1 italic">{profile?.phone_number || 'ENCRYPTED LINE UNSET'}</p>
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
                <div className="flex items-center justify-between ml-4 mb-4 mt-8">
                    <p className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600'>Compliance & Recognition</p>
                    <div className="h-px flex-1 mx-6 bg-white/5" />
                </div>

                {[
                    { icon: Award, label: 'Agent Certification', sub: 'Authorized proof of performance', href: '/app/profile/certificate' },
                    { icon: FileText, label: 'User Agreement', sub: 'Regulatory protocol and terms', href: '/app/terms' },
                ].map((item, idx) => (
                    <Link key={idx} href={item.href} className='group block'>
                        <div className='flex items-center justify-between p-6 rounded-[32px] bg-zinc-900/30 border border-white/5 hover:bg-zinc-800/80 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-black/40'>
                            <div className='flex items-center gap-5'>
                                <div className='w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 shadow-xl group-hover:shadow-amber-500/20'>
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

                <div className="flex items-center justify-between ml-4 mb-4 mt-8">
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

      <BottomNav />

      {/* Sync Modal */}
      {isSyncModalOpen && (
          <Portal>
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSyncModalOpen(false)} />
                  <div className="relative w-full max-w-md bg-[#121215] border border-white/5 rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300">
                      <div className="flex flex-col items-center mb-8">
                          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
                              <User className="text-cyan-400" size={24} />
                          </div>
                          <h3 className="text-xl font-black text-white uppercase italic">Registry Update</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-60">Synchronize Node Handle</p>
                      </div>

                      <div className="space-y-6">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Node Handle</label>
                              <input 
                                  value={formData.displayName}
                                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                                  placeholder="Eg. Apex Commander"
                                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-cyan-500/50 transition-all font-bold"
                              />
                          </div>

                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Encrypted Line (Phone)</label>
                              <input 
                                  value={formData.phoneNumber}
                                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                  placeholder="+1 ••• ••• ••••"
                                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-cyan-500/50 transition-all font-mono"
                              />
                          </div>
                      </div>

                      <div className="mt-10 flex flex-col gap-3">
                          <button 
                              onClick={handleSyncProfile}
                              disabled={syncLoading}
                              className="w-full h-14 bg-cyan-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                              {syncLoading ? 'SYNCHRONIZING...' : 'UPDATE REGISTRY'}
                          </button>
                          <button 
                              onClick={() => setIsSyncModalOpen(false)}
                              disabled={syncLoading}
                              className="w-full h-14 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all"
                          >
                              CANCEL
                          </button>
                      </div>
                  </div>
              </div>
          </Portal>
      )}
    </main>
  )
}
