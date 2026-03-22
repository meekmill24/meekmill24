'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  ChevronRight, 
  Lock, 
  ArrowUpRight,
  MousePointer2,
  Users,
  Trophy
} from 'lucide-react';

export default function LandingPage() {
  const stats = [
    { label: 'Strategic Nodes', value: '1.2M+', icon: Globe },
    { label: 'Global Liquidity', value: '$840M+', icon: TrendingUp },
    { label: 'Authorized Agents', value: '124K+', icon: Users },
  ];

  const features = [
    {
      title: 'Institutional Yield',
      desc: 'Access verified liquidity nodes with a strategic 0.5% - 1.5% yield per optimization cycle.',
      icon: Zap,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Quantum Security',
      desc: 'Our Multi-Sig verification protocol ensures every transaction node is 100% synchronized and secure.',
      icon: ShieldCheck,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Agent Ledger',
      desc: 'Real-time transparent auditing of all platform movements through your personal institutional terminal.',
      icon: Lock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 bg-black/20 border-b border-white/5 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1px]">
              <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-md" />
              </div>
            </div>
            <span className="text-2xl font-black italic tracking-tighter uppercase">Captiv8</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/50">
            <Link href="#features" className="hover:text-white transition-colors">Nodes</Link>
            <Link href="#stats" className="hover:text-white transition-colors">Network</Link>
            <Link href="#security" className="hover:text-white transition-colors">Security</Link>
          </div>
          <Link href="/auth/login">
            <button className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all">
              Access Terminal
            </button>
          </Link>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-40 px-8 max-w-7xl mx-auto overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-8 animate-in slide-in-from-bottom-2 duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Next-Gen Liquidity Protocol
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Strategic</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_40px_rgba(6,182,212,0.3)]">Node Earnings</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium mb-12 leading-relaxed italic">
              Access institutional-grade task optimization nodes. Verify assets, audit liquidity, and optimize for elite daily yields.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-12 py-5 bg-white text-black rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 button-shine">
                  Initiate Session <ChevronRight size={18} />
                </button>
              </Link>
              <button className="w-full sm:w-auto px-12 py-5 bg-white/5 border border-white/10 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                Audit Network
              </button>
            </div>
          </motion.div>

          {/* Floaters */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />
        </section>

        {/* Stats Section */}
        <section id="stats" className="px-8 pb-40 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[40px] group hover:border-white/10 transition-all glow-mesh shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg shadow-cyan-500/10">
                  <stat.icon size={24} />
                </div>
                <h3 className="text-4xl font-black italic tracking-tighter mb-1 text-white">{stat.value}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-8 pb-40 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4">Optimization Hub</h2>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-black">Audit assets, Resolve Node Settlements, and Earn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className={`w-16 h-16 rounded-[24px] ${feature.bg} flex items-center justify-center ${feature.color} mb-8 shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon size={32} strokeWidth={2.5} />
                </div>
                <h4 className="text-xl font-black italic tracking-tighter uppercase mb-4 text-white group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                  {feature.desc}
                </p>
                
                {/* Visual accent */}
                <div className="absolute -bottom-8 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Security / Trust Buffer */}
        <section id="security" className="px-8 pb-40">
          <div className="max-w-5xl mx-auto bg-gradient-to-tr from-zinc-900 via-zinc-900 to-zinc-800 rounded-[56px] border border-white/5 p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
               <ShieldCheck size={400} />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-3xl flex items-center justify-center text-cyan-400 mx-auto mb-10 border border-cyan-500/20">
                <Lock size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-6">
                Institutional Access <br /> 
                <span className="text-cyan-400">Reserved for Professionals</span>
              </h2>
              <p className="max-w-xl mx-auto text-slate-400 text-lg italic mb-12">
                Join the global network of specialized agents optimizing the digital economy. Every node is verified, every transaction is audited.
              </p>
              <Link href="/auth/login">
                <button className="px-16 py-6 bg-cyan-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(6,182,212,0.4)] hover:bg-cyan-500 transition-all active:scale-95">
                  Begin Optimization
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-8 py-20 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5 grayscale opacity-40">
               <Image src="/logo.png" alt="Logo" width={20} height={20} />
            </div>
            <span className="font-black italic uppercase tracking-tighter opacity-40">Captiv8 Protocol</span>
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
             © 2026 Institutional Distribution Matrix. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
