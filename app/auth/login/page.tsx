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
import { ArrowRight, ShieldCheck, Mail, Lock, Sparkles, Loader2 } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      let loginEmail = email;

      // Check if the input is an email, if not, try to fetch email from profiles by username
      if (!email.includes('@')) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', email)
          .single() as { data: { email: string } | null, error: any };

        if (profileError || !profile || !profile.email) {
          loginEmail = `${email}@captiv8s.com`;
        } else {
          loginEmail = profile.email;
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0F172A]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Decorative Floating Cards (Non-interactive) */}
      <div className="hidden lg:block absolute top-[15%] left-[10%] w-48 h-32 glass-dark rounded-3xl animate-float p-6 rotate-[-6deg]">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="h-2 w-24 bg-cyan-400/20 rounded-full mb-2" />
          <div className="h-2 w-16 bg-cyan-400/10 rounded-full" />
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
            <div className="w-20 h-20 rounded-3xl border-2 border-cyan-500/30 bg-[#1E293B] flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-4 overflow-hidden">
               <NextImage src="/logo.png" alt="Logo" width={80} height={80} className="object-cover" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Captiv8</h1>
            <p className="text-cyan-400/60 text-[10px] font-black uppercase tracking-[0.4em]">Strategic Verification Protocol</p>
          </div>

          <Card className="bg-[#1E293B] border-white/5 shadow-2xl rounded-[40px] overflow-hidden">
            <CardHeader className="pt-10 pb-6 text-center">
              <CardTitle className="text-2xl font-black tracking-tighter text-white uppercase italic">Access Terminal</CardTitle>
              <CardDescription className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">
                Authorize your session to continue earning
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Identity Node</Label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50" />
                       <Input
                        id="email"
                        type="text"
                        placeholder="Email or Username"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 bg-white/5 border-white/5 focus:border-cyan-500/50 transition-all rounded-2xl text-white placeholder:text-zinc-500 font-bold caret-cyan-400 !text-white"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Password</Label>
                      <Link href="#" className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:underline">Reset</Link>
                    </div>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50 grow-0" />
                       <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 bg-white/5 border-white/5 focus:border-cyan-500/50 transition-all rounded-2xl text-white font-bold caret-cyan-400 !text-white"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500/30 hover:text-cyan-400 transition-colors"
                      >
                        {showPassword ? <Sparkles size={18} /> : <Lock size={18} />}
                      </button>
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
                  className="w-full h-14 bg-white text-[#0F172A] hover:bg-cyan-400 hover:text-white rounded-2xl font-black tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase text-xs" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Initialize Session <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="mt-10 text-center">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                  Not registered?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="text-cyan-400 hover:underline"
                  >
                    Join Protocol
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
             <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em]">© 2024 Captiv8 Protocol • v1.0.4</p>
          </div>
        </div>
      </div>
    </div>
  )
}
