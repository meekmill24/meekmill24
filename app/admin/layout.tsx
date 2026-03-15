'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminTabs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Transactions', href: '/admin/transactions' },
  { label: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const isAdminUser = user.user_metadata?.is_admin === true
      if (!isAdminUser) {
        router.push('/app')
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAdmin()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Spinner className='h-8 w-8' />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Admin Header */}
      <header className='sticky top-0 z-50 bg-slate-900 text-white'>
        <div className='flex items-center justify-between px-4 py-4'>
          <div className='flex items-center gap-3'>
            <Link href='/app'>
              <Button variant='ghost' size='icon' className='text-white hover:bg-slate-800'>
                <ArrowLeft className='h-5 w-5' />
              </Button>
            </Link>
            <div>
              <h1 className='text-lg font-semibold'>Admin Dashboard</h1>
              <p className='text-sm text-slate-300'>Manage your platform</p>
            </div>
          </div>
          <Button variant='ghost' size='icon' className='text-white hover:bg-slate-800' onClick={handleLogout}>
            <LogOut className='h-5 w-5' />
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className='flex gap-2 overflow-x-auto px-4 pb-4'>
          {adminTabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link key={tab.href} href={tab.href}>
                <div
                  className={cn(
                    'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  )}
                >
                  {tab.label}
                </div>
              </Link>
            )
          })}
        </div>
      </header>

      {/* Content */}
      <main className='p-4'>{children}</main>
    </div>
  )
}
