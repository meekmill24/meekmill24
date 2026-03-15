'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Check if user is admin
      const isAdmin = data.user?.user_metadata?.is_admin === true
      router.push(isAdmin ? '/admin' : '/app')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
        <h1 className='text-center text-2xl font-bold leading-9 tracking-tight'>
          Sign in to your account
        </h1>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form onSubmit={handleLogin} className='space-y-6'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium leading-6'>
              Email
            </label>
            <Input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='your@email.com'
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium leading-6'>
              Password
            </label>
            <Input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
            />
          </div>

          {error && (
            <div className='rounded-md bg-red-50 p-4'>
              <p className='text-sm font-medium text-red-800'>{error}</p>
            </div>
          )}

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className='mt-10 text-center text-sm'>
          Don&apos;t have an account?{' '}
          <Link href='/auth/sign-up' className='font-semibold leading-6 hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
