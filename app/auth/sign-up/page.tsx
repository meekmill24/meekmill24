'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signUp } from '@/lib/actions/index'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      await signUp(email, password, displayName)
      router.push('/auth/sign-up-success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
        <h1 className='text-center text-2xl font-bold leading-9 tracking-tight'>
          Create your account
        </h1>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form onSubmit={handleSignUp} className='space-y-6'>
          <div>
            <label htmlFor='displayName' className='block text-sm font-medium leading-6'>
              Display Name
            </label>
            <Input
              id='displayName'
              name='displayName'
              type='text'
              autoComplete='name'
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder='Your name'
            />
          </div>

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
              autoComplete='new-password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
            />
          </div>

          {errorMessage && (
            <div className='rounded-md bg-red-50 p-4'>
              <p className='text-sm font-medium text-red-800'>{errorMessage}</p>
            </div>
          )}

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Signing up...' : 'Sign up'}
          </Button>
        </form>

        <p className='mt-10 text-center text-sm'>
          Already have an account?{' '}
          <Link href='/auth/login' className='font-semibold leading-6 hover:underline'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
