'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSiteSettings, updateSiteSettings } from '@/lib/actions/index'

interface Setting {
  key: string
  value: string
  description: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSiteSettings()
        setSettings(data || [])
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSettingChange = (key: string, value: string) => {
    setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)))
  }

  const handleSave = async (key: string) => {
    setSaving(true)
    try {
      const setting = settings.find((s) => s.key === key)
      if (setting) {
        await updateSiteSettings(key, setting.value)
      }
    } catch (error) {
      console.error('Error saving setting:', error)
    } finally {
      setSaving(false)
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
    <main>
      {/* Header */}
      <div className='bg-gradient-to-r from-gray-950 to-gray-900 text-white px-6 py-8 sticky top-0 z-20'>
        <div className='flex items-center gap-4'>
          <Link href='/admin' className='hover:opacity-80 transition-opacity'>
            <ChevronLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-3xl font-bold'>Site Controls</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-6 max-w-2xl mx-auto space-y-8'>
        {/* Site Controls */}
        <section>
          <h2 className='text-xl font-bold mb-4'>Site Controls</h2>
          <div className='space-y-4 bg-card border border-border rounded-lg p-6'>
            <div>
              <label className='block text-sm font-semibold mb-2'>Maintenance Mode</label>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  className='w-5 h-5 rounded border-border'
                  defaultChecked={false}
                />
                <span className='text-sm text-muted-foreground'>Disable site access for users</span>
              </div>
            </div>
            <div className='border-t border-border pt-4'>
              <label className='block text-sm font-semibold mb-2'>New Registrations</label>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  className='w-5 h-5 rounded border-border'
                  defaultChecked={true}
                />
                <span className='text-sm text-muted-foreground'>Allow new user signups</span>
              </div>
            </div>
            <div className='border-t border-border pt-4'>
              <label className='block text-sm font-semibold mb-2'>Deposits</label>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  className='w-5 h-5 rounded border-border'
                  defaultChecked={true}
                />
                <span className='text-sm text-muted-foreground'>Enable deposit functionality</span>
              </div>
            </div>
            <div className='border-t border-border pt-4'>
              <label className='block text-sm font-semibold mb-2'>Withdrawals</label>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  className='w-5 h-5 rounded border-border'
                  defaultChecked={true}
                />
                <span className='text-sm text-muted-foreground'>Enable withdrawal functionality</span>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Settings */}
        <section>
          <h2 className='text-xl font-bold mb-4'>Financial Settings</h2>
          <div className='space-y-4 bg-card border border-border rounded-lg p-6'>
            {settings
              .filter((s) => s.key.includes('minimum') || s.key.includes('bonus'))
              .map((setting) => (
                <div key={setting.key} className='flex items-end gap-3'>
                  <div className='flex-1'>
                    <label className='block text-sm font-semibold mb-2 capitalize'>
                      {setting.key.replace(/_/g, ' ')}
                    </label>
                    <Input
                      type='text'
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className='w-full'
                    />
                    {setting.description && (
                      <p className='text-xs text-muted-foreground mt-1'>{setting.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSave(setting.key)}
                    disabled={saving}
                    className='bg-primary text-primary-foreground hover:bg-primary/90'
                  >
                    Save
                  </Button>
                </div>
              ))}
          </div>
        </section>

        {/* App Information */}
        <section>
          <h2 className='text-xl font-bold mb-4'>App Information</h2>
          <div className='space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-6'>
            {settings
              .filter((s) => s.key.includes('version'))
              .map((setting) => (
                <div key={setting.key}>
                  <p className='text-sm text-blue-900'>
                    <strong>{setting.key.replace(/_/g, ' ')}:</strong> {setting.value}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  )
}
