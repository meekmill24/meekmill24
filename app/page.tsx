'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
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
  Trophy,
  Menu,
  X,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: 'GLOBAL NODES', value: '1.2M+', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'LIQUIDITY FLOW', value: '$840M+', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'VERIFIED AGENTS', value: '124K+', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const features = [
    {
      title: 'INSTITUTIONAL YIELD',
      desc: 'Access verified liquidity nodes with a strategic 0.5% - 1.5% yield per optimization cycle.',
      icon: Zap,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'QUANTUM SECURITY',
      desc: 'Our Multi-Sig verification protocol ensures every transaction node is 100% synchronized and secure.',
      icon: ShieldCheck,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'AGENT LEDGER',
      desc: 'Real-time transparent auditing of all platform movements through your personal institutional terminal.',
      icon: Lock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    }
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // Hero Entrance
      gsap.from(".hero-text", {
        x: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.2
      });

      gsap.from(".hero-cards", {
        x: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.5
      });

      // Stats Reveal
      gsap.from(".reveal-stat", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: "#stats",
          start: "top 80%",
        }
      });

      // Features Reveal
      gsap.from(".reveal-feature", {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "elastic.out(1, 0.75)",
        scrollTrigger: {
          trigger: "#features",
          start: "top 75%",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200" ref={containerRef}>
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[160px] rounded-full animate-pulse delay-1000" />
        
        {/* Animated Globe/Mesh Placeholder Background */}
        <div className="absolute top-1/2 right-[-20%] w-[80%] h-[80%] opacity-20 group">
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full animate-[spin_60s_linear_infinite]" />
             <div className="absolute inset-4 border border-cyan-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Navigation Port */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 bg-slate-950/40 border-b border-white/5 z-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[1.5px] shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-lg" />
              </div>
            </div>
            <span className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">Captiv8</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
            <Link href="#features" className="hover:text-cyan-400 transition-colors">NODE PROTOCOL</Link>
            <Link href="#stats" className="hover:text-cyan-400 transition-colors">NETWORK MESH</Link>
            <Link href="#security" className="hover:text-cyan-400 transition-colors">LEDGER SECURITY</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hidden sm:block">
              <button className="px-8 py-3 rounded-2xl bg-cyan-500 text-slate-950 text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(6,182,212,0.4)] hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all">
                ACCESS HUB
              </button>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-white/70 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/10"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Nav Overlay */}
        <div className={`fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-3xl lg:hidden transition-all duration-700 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col items-center justify-center h-full gap-12">
            {['NODE PROTOCOL', 'NETWORK MESH', 'LEDGER SECURITY'].map((item, i) => (
                <Link key={i} href={`#${item.split(' ')[0].toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black italic tracking-tighter uppercase text-white/40 hover:text-cyan-400 transition-colors">{item}</Link>
            ))}
            <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
              <button className="px-16 py-6 bg-cyan-500 text-slate-950 rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-3xl">ACCESS HUB</button>
            </Link>
          </div>
        </div>

        {/* Hero Hub - Institutional Split */}
        <section className="relative pt-12 lg:pt-24 pb-40 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          {/* Left Node: Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="hero-text inline-flex items-center gap-3 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              PROTOCOL LIVE: VERSION 2.4.0
            </div>
            
            <h1 className="hero-text text-6xl md:text-8xl lg:text-[100px] font-black italic tracking-tighter uppercase leading-[0.85] mb-8">
               STRATEGIC <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 drop-shadow-[0_0_50px_rgba(6,182,212,0.4)]">AGENT NODE</span>
            </h1>
            
            <p className="hero-text max-w-2xl mx-auto lg:mx-0 text-slate-400 text-lg md:text-xl font-medium mb-12 leading-relaxed italic border-l-4 border-cyan-500/20 pl-6">
              Access institutional-grade task optimization nodes. Verify global assets, audit synchronized liquidity, and optimize for elite daily agent yields.
            </p>

            <div className="hero-text flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-16 py-6 bg-white text-slate-950 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-[0_25px_80px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  INITIATE SESSION <Play size={18} fill="currentColor" />
                </button>
              </Link>
              <button className="w-full sm:w-auto text-[11px] font-black uppercase tracking-[0.5em] text-cyan-400 hover:text-white transition-all underline underline-offset-8 decoration-cyan-500/40">
                AUDIT NETWORK PROTOCOL
              </button>
            </div>
          </div>

          {/* Right Node: Vertical Metric Hub */}
          <div className="hero-cards flex-1 w-full max-w-lg lg:max-w-none">
             <div className="relative space-y-6 lg:pl-20">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ x: 20, scale: 1.02 }}
                        className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] shadow-3xl flex items-center gap-10 group cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                             <stat.icon size={120} />
                        </div>
                        <div className={cn("w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl transition-all group-hover:rotate-6", stat.bg, stat.color)}>
                            <stat.icon size={36} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2">{stat.label}</p>
                            <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10" />
             </div>
          </div>
        </section>

        {/* Detailed Stats Segment */}
        <section id="stats" className="px-8 pb-40 max-w-7xl mx-auto border-t border-white/5 pt-32">
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-20">
                 <h2 className="text-5xl font-black italic tracking-tighter uppercase">NETWORK DENSITY</h2>
                 <p className="text-slate-500 text-xs font-black uppercase tracking-[0.5em]">Global Operational Matrix Status: OPTIMIZED</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { label: 'Active Node Settlements', value: '412K', desc: 'Real-time optimization cycles identified' },
                    { label: 'Agent Verification', value: '99.9%', desc: 'Multi-sig consensus protocol stability' },
                    { label: 'Institutional Yield', value: '1.45%', desc: 'Average daily portfolio optimization' },
                ].map((item, i) => (
                    <div key={i} className="reveal-stat p-10 rounded-[40px] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                        <h4 className="text-5xl font-black italic tracking-tighter text-white mb-4 group-hover:text-cyan-400 transition-colors">{item.value}</h4>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">{item.label}</p>
                        <p className="text-[10px] font-medium italic text-slate-500">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="px-8 pb-40 max-w-7xl mx-auto">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[64px] border border-white/5 p-12 md:p-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-10">
                        ELITE NODE <br />
                        <span className="text-cyan-500">SPECIFICATIONS</span>
                    </h2>
                    <p className="text-slate-400 text-lg italic mb-12 leading-relaxed">
                        Every Captiv8 Agent Node is equipped with specialized institutional protocols designed for maximum yield efficiency and global settlement speed.
                    </p>
                    <div className="space-y-8">
                        {features.map((f, i) => (
                            <div key={i} className="reveal-feature flex items-start gap-6 border-b border-white/5 pb-8 last:border-0">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xl", f.bg, f.color)}>
                                    <f.icon size={28} />
                                </div>
                                <div>
                                    <h5 className="text-lg font-black italic tracking-tighter uppercase text-white mb-2">{f.title}</h5>
                                    <p className="text-sm font-medium text-slate-500 italic leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 to-indigo-600 blur-[120px] opacity-20" />
                    <div className="relative rounded-[56px] border border-white/10 overflow-hidden shadow-3xl bg-slate-950 aspect-square flex items-center justify-center p-12">
                         <div className="w-full h-full border-2 border-dashed border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center p-20">
                             <div className="w-full h-full border border-cyan-500/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] bg-cyan-500/5 shadow-[0_0_100px_rgba(6,182,212,0.2)]" />
                         </div>
                         <ShieldCheck className="absolute text-cyan-500" size={120} strokeWidth={1} />
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Security / CTA Hub */}
        <section id="security" className="px-8 pb-40">
          <div className="max-w-5xl mx-auto bg-gradient-to-tr from-slate-900 to-slate-950 rounded-[64px] border border-white/5 p-12 md:p-24 text-center relative overflow-hidden shadow-3xl group">
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-600/10 blur-[120px] rounded-full group-hover:bg-cyan-600/20 transition-all duration-1000" />
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
                READY TO <br />
                <span className="text-cyan-500">OPTIMIZE?</span>
              </h2>
              <p className="max-w-2xl mx-auto text-slate-400 text-xl font-medium mb-12 italic leading-relaxed">
                Join 124,000+ specialized agents optimizing the global digital economy. Your institutional grade yield node is ready for initiation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link href="/auth/login" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-16 py-6 bg-cyan-500 text-slate-950 rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(6,182,212,0.4)] hover:bg-cyan-400 active:scale-95 transition-all">
                        INITIATE NODE
                    </button>
                </Link>
                <Link href="/auth/login" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-16 py-6 bg-white/5 border border-white/10 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                        AUDIT TERMINAL
                    </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Footer */}
        <footer className="px-8 py-24 border-t border-white/5 bg-slate-950/20">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="flex items-center gap-4 mb-10 opacity-60">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center p-2 border border-white/10 grayscale">
                    <Image src="/logo.png" alt="Logo" width={24} height={24} />
                </div>
                <span className="text-2xl font-black italic tracking-tighter uppercase">Captiv8 Protocol</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center mb-16 opacity-40">
                {['GOVERNANCE', 'WHITE PAPER', 'AGENT LEDGER', 'SUPPORT HUB'].map((link, i) => (
                    <span key={i} className="text-[10px] font-black uppercase tracking-[0.5em] hover:text-white cursor-pointer transition-colors">{link}</span>
                ))}
            </div>

            <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] italic">
               © 2026 GLOBAL INSTITUTIONAL DISTRIBUTION MATRIX. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
