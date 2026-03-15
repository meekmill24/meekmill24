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
import { Music, ArrowRight, Sparkles, User, Mail, Lock, UserCheck, ShieldCheck, Share2, Phone, AtSign } from 'lucide-react'

export default function Page() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [referral, setReferral] = useState('')
  
  // Step 2 Info
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== repeatPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
    }
    setError(null)
    setStep(2)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            display_name: username,
            phone_number: phone,
            referral_code_used: referral
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (signUpError) throw signUpError
      
      // Update profile immediately if possible (trigger usually handles it, but let's ensure)
      if (data.user) {
        await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: username,
                display_name: username,
                phone_number: phone
            }),
        })
      }
      
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fafafa] py-12">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#007CBA]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#007CBA]/5 rounded-full blur-[120px] animate-pulse delay-700" />
      
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
              <div className="flex justify-center gap-2 mb-4">
                <div className={`h-1.5 w-12 rounded-full transition-colors ${step === 1 ? 'bg-[#007CBA]' : 'bg-slate-200'}`} />
                <div className={`h-1.5 w-12 rounded-full transition-colors ${step === 2 ? 'bg-[#007CBA]' : 'bg-slate-200'}`} />
              </div>
              <CardTitle className="text-2xl font-bold text-[#003d5c]">
                {step === 1 ? 'Step 1: Security' : 'Step 2: Profile'}
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                {step === 1 ? 'Configure your access credentials' : 'Tell us a bit about yourself'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              {step === 1 ? (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</Label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-11 bg-white/50 border-white/50 focus:border-[#007CBA] transition-all rounded-xl"
                        />
                        </div>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="password" title="password-label" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</Label>
                        <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-11 bg-white/50 border-white/50 focus:border-[#007CBA] transition-all rounded-xl"
                        />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="repeat-password" title="repeat-password-label" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</Label>
                        <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="repeat-password"
                            type="password"
                            required
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            className="pl-10 h-11 bg-white/50 border-white/50 focus:border-[#007CBA] transition-all rounded-xl"
                        />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="referral" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Referral Code (Optional)</Label>
                        <div className="relative">
                        <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="referral"
                            type="text"
                            placeholder="4-digit code"
                            maxLength={4}
                            value={referral}
                            onChange={(e) => setReferral(e.target.value)}
                            className="pl-10 h-11 bg-white/50 border-white/50 focus:border-[#007CBA] transition-all rounded-xl"
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
                    className="w-full h-11 premium-gradient text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98] mt-2" 
                  >
                    Continue to Profile <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Choose Username</Label>
                        <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="username"
                            type="text"
                            placeholder="johndoe"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 h-11 bg-white/50 border-white/50 focus:border-[#007CBA] transition-all rounded-xl"
                        />
                        </div>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</Label>
                        <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10 h-11 bg-white/50 border-white/50 focus:border-[#007CBA] transition-all rounded-xl"
                        />
                        </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-11 rounded-xl font-bold border-slate-200"
                    >
                        Back
                    </Button>
                    <Button 
                        type="submit" 
                        title="signup-button"
                        className="flex-[2] h-11 premium-gradient text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Finalizing...
                        </div>
                        ) : (
                        <div className="flex items-center justify-center gap-2">
                            Complete Setup <UserCheck className="w-4 h-4" />
                        </div>
                        )}
                    </Button>
                  </div>
                </form>
              )}
              
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-[#007CBA] font-bold hover:underline"
                  >
                    Log in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center pt-4">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">© 2024 Captiv8 Music Platform</p>
          </div>
        </div>
      </div>
    </div>
  )
}
