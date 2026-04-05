'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
import GoogleTranslate from '@/components/GoogleTranslate'
import Link from 'next/link'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setIsAuthenticated(true)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Spinner className='h-8 w-8' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className='min-h-screen bg-black flex justify-center'>
      <div className='w-full max-w-md lg:max-w-4xl relative pb-24 bg-black shadow-2xl border-x border-white/5'>
        <GoogleTranslate />
        {children}
        <div className="flex flex-col items-center py-10 opacity-80 hover:opacity-100 transition-opacity">
            <Link href="https://www.wfp.org" target="_blank" className="flex flex-col items-center gap-3 transition-all">
                <div className="w-12 h-12 flex items-center justify-center p-1">
                    <img src="/wfp-institutional.png" alt="WFP" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">Institutional Support</span>
                    <span className="text-[11px] font-black tracking-[0.2em] uppercase text-cyan-500">WFP.ORG</span>
                </div>
            </Link>
        </div>
        <div className="flex justify-center">
           <BottomNav />
        </div>
      </div>
    </div>
  )
}
