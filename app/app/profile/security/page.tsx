'use client'

import { ChevronLeft, Shield, Fingerprint, Key, Smartphone, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

export default function SecurityPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className='min-h-screen bg-[#0a0a0a] text-white pb-32'>
      <div className='px-6 pt-10 pb-6 sticky top-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/5'>
        <div className='flex items-center gap-4'>
          <Link href='/app/profile'>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <ChevronLeft className='w-6 h-6' />
            </div>
          </Link>
          <h1 className='text-xl font-black italic tracking-tighter uppercase'>Security & Access</h1>
        </div>
      </div>

      <div className='px-6 space-y-8 mt-8'>
        <div className='bg-zinc-900/40 rounded-[40px] p-8 border border-white/10 shadow-xl'>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-lg font-black uppercase italic tracking-tight">Access Control</h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Manage your digital perimeter</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-4">
                        <Fingerprint className="w-5 h-5 text-zinc-400" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">Biometric Login</p>
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">FaceID or Fingerprint</p>
                        </div>
                    </div>
                    <Switch />
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-4">
                        <Smartphone className="w-5 h-5 text-zinc-400" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">Two-Factor Auth</p>
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">SMS or Authenticator App</p>
                        </div>
                    </div>
                    <Switch defaultChecked />
                </div>
            </div>
        </div>

        <div className='space-y-4'>
            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-4 mb-4'>Credential Management</p>
            
            <div className="p-8 rounded-[40px] bg-zinc-900/40 border border-white/5 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Current Protocol Key</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            readOnly 
                            value="SH-729-ALPHA-88"
                            className="w-full h-14 bg-black rounded-2xl px-6 font-black tracking-[0.2em] border border-white/5 outline-none text-cyan-400" 
                        />
                        <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-zinc-500"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <Button className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 active:scale-95 transition-all">
                    Reset Access Key
                </Button>
            </div>
        </div>

        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-center gap-4">
            <Lock className="w-5 h-5 text-red-500" />
            <p className="text-[9px] font-black text-red-500/80 uppercase tracking-widest leading-relaxed">
                Security status: High. Your account is protected by military-grade 512-bit neural encryption.
            </p>
        </div>
      </div>

      <BottomNav active='profile' />
    </main>
  )
}
