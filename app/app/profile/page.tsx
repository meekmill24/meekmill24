'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, Shield, Lock, Bell, Moon, Globe, LogOut, MessageCircle, FileText, Lock as LockIcon } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { Button } from '@/components/ui/button'
import { getUserProfile, logout } from '@/lib/actions/index'
import { useRouter } from 'next/navigation'

interface Profile {
  display_name: string
  username: string
  wallet_balance: number
  completed_tasks_count: number
  credit_rating: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getUserProfile()
        setProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    )
  }

  return (
    <main className='pb-32'>
      {/* Header */}
      <div className='bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-6 pt-6 pb-8 sticky top-0 z-20'>
        <div className='flex items-center justify-between'>
          <Link href='/app' className='hover:opacity-80 transition-opacity'>
            <ChevronLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-xl font-bold'>Profile</h1>
          <div className='w-6' />
        </div>
      </div>

      {/* Main Content */}
      <div className='px-6 py-6 space-y-6'>
        {/* User Info Card */}
        <div className='bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10'>
          <div className='flex items-start gap-4'>
            <div className='w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold'>
              {profile?.display_name?.[0]?.toUpperCase()}
            </div>
            <div className='flex-1'>
              <h2 className='font-bold text-lg'>{profile?.display_name}</h2>
              <p className='text-sm text-muted-foreground'>{profile?.username || 'No username'}</p>
              <div className='flex gap-4 mt-2 text-sm'>
                <div>
                  <p className='text-muted-foreground text-xs'>Tasks</p>
                  <p className='font-bold'>{profile?.completed_tasks_count || 0}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Rating</p>
                  <p className='font-bold'>{profile?.credit_rating}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div>
          <h3 className='text-xs font-bold text-muted-foreground uppercase mb-2'>SECURITY</h3>
          <div className='space-y-2'>
            <button className='w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border'>
              <Shield className='w-5 h-5 text-muted-foreground' />
              <div className='flex-1 text-left'>
                <p className='font-semibold text-sm'>Security</p>
                <p className='text-xs text-muted-foreground'>Password, 2FA</p>
              </div>
              <ChevronLeft className='w-4 h-4 text-muted-foreground rotate-180' />
            </button>
            <button className='w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border'>
              <LockIcon className='w-5 h-5 text-muted-foreground' />
              <div className='flex-1 text-left'>
                <p className='font-semibold text-sm'>Change Password</p>
                <p className='text-xs text-muted-foreground'>Update your password</p>
              </div>
              <ChevronLeft className='w-4 h-4 text-muted-foreground rotate-180' />
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div>
          <h3 className='text-xs font-bold text-muted-foreground uppercase mb-2'>PREFERENCES</h3>
          <div className='space-y-2'>
            <button className='w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border'>
              <Bell className='w-5 h-5 text-muted-foreground' />
              <div className='flex-1 text-left'>
                <p className='font-semibold text-sm'>Notifications</p>
                <p className='text-xs text-muted-foreground'>Push, email alerts</p>
              </div>
              <ChevronLeft className='w-4 h-4 text-muted-foreground rotate-180' />
            </button>
            <button className='w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border'>
              <Moon className='w-5 h-5 text-muted-foreground' />
              <div className='flex-1 text-left'>
                <p className='font-semibold text-sm'>Dark Mode</p>
                <p className='text-xs text-muted-foreground'>Switch appearance</p>
              </div>
              <ChevronLeft className='w-4 h-4 text-muted-foreground rotate-180' />
            </button>
            <button className='w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border'>
              <Globe className='w-5 h-5 text-muted-foreground' />
              <div className='flex-1 text-left'>
                <p className='font-semibold text-sm'>Language</p>
                <p className='text-xs text-muted-foreground'>English (US)</p>
              </div>
              <ChevronLeft className='w-4 h-4 text-muted-foreground rotate-180' />
            </button>
          </div>
        </div>

        {/* About Section */}
        <div>
          <h3 className='text-xs font-bold text-muted-foreground uppercase mb-2'>ABOUT US</h3>
          <div className='space-y-2'>
            <button className='w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border'>
              <MessageCircle className='w-5 h-5 text-muted-foreground' />
              <div className='flex-1 text-left'>
                <p className='font-semibold text-sm'>Contact us</p>
              </div>
              <ChevronLeft className='w-4 h-4 text-muted-foreground rotate-180' />
            </button>
            <button className='w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border'>
              <FileText className='w-5 h-5 text-muted-foreground' />
              <div className='flex-1 text-left'>
                <p className='font-semibold text-sm'>User Agreement</p>
              </div>
              <ChevronLeft className='w-4 h-4 text-muted-foreground rotate-180' />
            </button>
            <button className='w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border'>
              <Lock className='w-5 h-5 text-muted-foreground' />
              <div className='flex-1 text-left'>
                <p className='font-semibold text-sm'>Privacy Policy</p>
              </div>
              <ChevronLeft className='w-4 h-4 text-muted-foreground rotate-180' />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className='w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
        >
          <LogOut className='w-4 h-4 mr-2' />
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </Button>

        {/* Version Info */}
        <div className='text-center text-xs text-muted-foreground'>
          <p>Simple Music v1.0.0</p>
          <p>© 2024 Simple Music. All rights reserved.</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active='profile' />
    </main>
  )
}
