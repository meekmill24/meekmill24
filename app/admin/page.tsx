'use client'

import { useEffect, useState } from 'react'
import { Users, DollarSign, TrendingUp, Activity, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/cards/stat-cards'
import { getDashboardStats } from '@/lib/actions/index'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  totalUsers: number
  totalBalance: number
  totalTransactions: number
  completedTasks: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    )
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'users', label: 'Users', href: '/admin/users' },
    { id: 'transactions', label: 'Transactions', href: '/admin/transactions' },
    { id: 'settings', label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <main>
      {/* Header */}
      <div className='bg-gradient-to-r from-gray-950 to-gray-900 text-white px-6 py-8 sticky top-0 z-20'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
          <p className='text-gray-400 text-sm mt-1'>Manage your platform</p>
        </div>

        {/* Tab Navigation */}
        <div className='flex gap-2 overflow-x-auto pb-3'>
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-white text-gray-950'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className='p-6 space-y-8 max-w-7xl mx-auto'>
        {/* Key Metrics */}
        <div>
          <h2 className='text-xl font-bold mb-4'>Overview</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <StatCard
              icon={Users}
              label='Total Users'
              value={stats?.totalUsers || 0}
              variant='blue'
            />
            <StatCard
              icon={DollarSign}
              label='Total Balance'
              value={`$${(stats?.totalBalance || 0).toFixed(2)}`}
              variant='green'
            />
            <StatCard
              icon={TrendingUp}
              label='Transactions'
              value={stats?.totalTransactions || 0}
              variant='purple'
            />
            <StatCard
              icon={Activity}
              label='Tasks Completed'
              value={stats?.completedTasks || 0}
              variant='orange'
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className='text-xl font-bold mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Link
              href='/admin/users'
              className='flex items-center justify-between p-6 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors'
            >
              <div>
                <h3 className='font-semibold text-blue-900'>Manage Users</h3>
                <p className='text-sm text-blue-700'>View and manage user accounts</p>
              </div>
              <ChevronRight className='w-5 h-5 text-blue-600' />
            </Link>

            <Link
              href='/admin/transactions'
              className='flex items-center justify-between p-6 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 transition-colors'
            >
              <div>
                <h3 className='font-semibold text-green-900'>View Transactions</h3>
                <p className='text-sm text-green-700'>Monitor all platform transactions</p>
              </div>
              <ChevronRight className='w-5 h-5 text-green-600' />
            </Link>

            <Link
              href='/admin/settings'
              className='flex items-center justify-between p-6 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors'
            >
              <div>
                <h3 className='font-semibold text-purple-900'>Site Controls</h3>
                <p className='text-sm text-purple-700'>Manage platform settings</p>
              </div>
              <ChevronRight className='w-5 h-5 text-purple-600' />
            </Link>

            <Link
              href='/admin/settings'
              className='flex items-center justify-between p-6 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors'
            >
              <div>
                <h3 className='font-semibold text-orange-900'>Financial Settings</h3>
                <p className='text-sm text-orange-700'>Configure withdrawal and bonus settings</p>
              </div>
              <ChevronRight className='w-5 h-5 text-orange-600' />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold'>Recent Activity</h2>
            <Link href='/admin/transactions' className='text-primary hover:underline text-sm font-medium'>
              View all
            </Link>
          </div>
          <div className='bg-card rounded-lg border border-border p-6'>
            <p className='text-muted-foreground text-center text-sm'>No recent activity</p>
          </div>
        </div>
      </div>
    </main>
  )
}
