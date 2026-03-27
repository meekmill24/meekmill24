'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Access Denied. Administrator privileges required.');
        }

        router.replace('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-slate-200 font-sans relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-[#121215]/80 backdrop-blur-2xl border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            {/* Top Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            
            <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Shield className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white mb-2">Terminal Access</h1>
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Restricted Node Authority</p>
            </div>
            
            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                    <AlertCircle className="text-red-400 shrink-0" size={18} />
                    <p className="text-red-400 text-xs font-bold leading-tight">{error}</p>
                </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Identifier</label>
                <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-purple-400 transition-colors">
                        <User size={18} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@sys.cap" 
                      required
                      className="w-full bg-black/40 border border-white/5 text-white rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm placeholder:text-slate-700" 
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Passphrase</label>
                <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-purple-400 transition-colors">
                        <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                      className="w-full bg-black/40 border border-white/5 text-white rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm placeholder:text-slate-700" 
                    />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={16} />
                        Authenticating...
                    </>
                ) : 'Initialize Session'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">NodeFlow Operating System v4.0</p>
            </div>
        </div>
      </div>
    </div>
  );
}
