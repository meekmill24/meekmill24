'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle2, Music, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccess() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fafafa]">
      {/* Background patterns */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#007CBA]/5 rounded-full blur-[120px]" />

      <div className='relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-md'>
        <div className="mb-8 flex flex-col items-center gap-2">
            <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#003d5c]">Simple Music</h2>
        </div>

        <div className='mb-8 flex h-24 w-24 items-center justify-center rounded-3xl glass border-green-200 shadow-xl shadow-green-500/10'>
          <CheckCircle2 className='h-12 w-12 text-green-500' />
        </div>
        
        <h1 className='mb-4 text-4xl font-extrabold tracking-tight text-[#003d5c]'>
          Ready to Start?
        </h1>
        
        <p className='mb-10 text-lg text-slate-500 font-medium leading-relaxed'>
          Your account is verified. Welcome to the elite community of musical earning.
        </p>
        
        <Link href='/auth/login' className='w-full'>
          <Button className='w-full h-14 premium-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2'>
            Enter Platform <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        
        <p className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-widest">Verification Complete</p>
      </div>
    </div>
  )
}
