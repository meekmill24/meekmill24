'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Spinner } from '@/components/ui/spinner'

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
    <div className='relative pb-24'>
      {children}
      <BottomNav />
    </div>
  )
}
