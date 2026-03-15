'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, Edit2, Trash2, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAllUsers } from '@/lib/actions/index'

interface User {
  id: string
  display_name: string
  username: string
  email: string
  wallet_balance: number
  total_earned: number
  level_id: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAllUsers()
        setUsers(data || [])
        setFilteredUsers(data || [])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

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
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/admin' className='hover:opacity-80 transition-opacity'>
            <ChevronLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-3xl font-bold'>User Management</h1>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
          <Input
            type='text'
            placeholder='Search users...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
          />
        </div>
      </div>

      {/* Main Content */}
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='bg-card rounded-lg border border-border overflow-hidden'>
          <table className='w-full'>
            <thead className='border-b border-border bg-muted'>
              <tr>
                <th className='px-6 py-3 text-left text-sm font-semibold'>User</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Email</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Balance</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Total Earned</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Joined</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className='hover:bg-muted/50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>
                          {user.display_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className='font-medium'>{user.display_name}</p>
                          {user.username && <p className='text-xs text-muted-foreground'>@{user.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm'>{user.email}</td>
                    <td className='px-6 py-4 font-semibold'>${user.wallet_balance.toFixed(2)}</td>
                    <td className='px-6 py-4 text-green-600 font-medium'>${user.total_earned.toFixed(2)}</td>
                    <td className='px-6 py-4 text-sm text-muted-foreground'>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='h-8 w-8 p-0'
                          title='Edit user'
                        >
                          <Edit2 className='w-4 h-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                          title='Delete user'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className='px-6 py-8 text-center text-muted-foreground'>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <p className='text-sm text-blue-800'>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </p>
        </div>
      </div>
    </main>
  )
}
