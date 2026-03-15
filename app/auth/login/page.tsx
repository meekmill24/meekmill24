'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import NextImage from 'next/image'
import { Music, ArrowRight, ShieldCheck, Mail, Lock, Sparkles } from 'lucide-react'

export default function Page() {
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/app')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fafafa]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#007CBA]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#007CBA]/5 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Decorative Floating Cards (Non-interactive) */}
      <div className="hidden lg:block absolute top-[15%] left-[10%] w-48 h-32 glass rounded-2xl animate-float p-4 rotate-[-6deg]">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <Music className="w-4 h-4 text-[#007CBA]" />
          </div>
          <div className="h-2 w-24 bg-[#007CBA]/20 rounded-full mb-2" />
          <div className="h-2 w-16 bg-[#007CBA]/10 rounded-full" />
      </div>

      <div className="hidden lg:block absolute bottom-[20%] right-[12%] w-40 h-28 glass rounded-2xl animate-float delay-2 p-4 rotate-[4deg]">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
          </div>
          <div className="h-2 w-20 bg-green-600/20 rounded-full mb-2" />
          <div className="h-2 w-12 bg-green-600/10 rounded-full" />
      </div>

      <div className="w-full max-w-md px-6 z-10">
        <div className="flex flex-col gap-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-2 overflow-hidden">
               <NextImage src="/logo.png" alt="Logo" width={64} height={64} className="object-cover" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#003d5c]">Captiv8 Music</h1>
            <p className="text-muted-foreground text-sm font-medium">Elevating your strategic impact</p>
          </div>

          <Card className="glass border-white/40 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pt-8 pb-4 text-center">
              <CardTitle className="text-2xl font-bold text-[#003d5c]">Welcome Back</CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Log in to continue your earning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</Label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/50 border-white/50 focus:border-[#007CBA] transition-all rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" title="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
                      <Link href="#" className="text-xs font-semibold text-[#007CBA] hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/50 border-white/50 focus:border-[#007CBA] transition-all rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  title="login-button"
                  className="w-full h-12 premium-gradient text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Sign In <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="text-[#007CBA] font-bold hover:underline"
                  >
                    Join the community
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">© 2024 Simple Music Platform</p>
          </div>
        </div>
      </div>
    </div>
  )
}
