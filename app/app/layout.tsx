'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Spinner } from '@/components/ui/spinner'
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
        {children}
        <div className="flex flex-col items-center pb-8 opacity-40 hover:opacity-100 transition-opacity">
            <Link href="https://www.wfp.org" target="_blank" className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/10 p-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/WFP_Logo.svg" alt="WFP" className="w-full h-full object-contain invert" />
                </div>
                <span className="text-[8px] font-black tracking-[0.3em] uppercase text-white">Institutional Support: WFP.ORG</span>
            </Link>
        </div>
        <div className="flex justify-center">
           <BottomNav />
        </div>
      </div>
    </div>
  )
}
