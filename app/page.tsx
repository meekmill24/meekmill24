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
  Play,
  Star,
  Quote,
  Layers,
  Activity
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

  const operationalSteps = [
    { id: '01', title: 'NODE REGISTRY', desc: 'Secure your unique institutional agent ID and activate your terminal.', icon: Lock },
    { id: '02', title: 'ASSET DEPLOY', desc: 'Settle liquidity into your personal vault to invoke yield-optimization protocols.', icon: Zap },
    { id: '03', title: 'YIELD HARVEST', desc: 'Execute daily node tasks to audit assets and harvest institutional gains.', icon: TrendingUp }
  ];

  const tiers = [
    { name: 'JUNIOR NODE', price: '100', yield: '0.5%', tasks: '40', color: 'cyan' },
    { name: 'ASSOCIATE NODE', price: '500', yield: '1.2%', tasks: '45', color: 'purple' },
    { name: 'EXECUTIVE NODE', price: '2,500', yield: '1.8%', tasks: '50', color: 'emerald' },
    { name: 'INSTITUTIONAL HUB', price: '10,000', yield: '2.5%', tasks: '60', color: 'rose' }
  ];

  const testimonials = [
    { name: 'Aleksey Volkov', role: 'Elite Agent Hub 4', text: 'The protocol stability in V2.4 is unmatched. Yield synchronization is instantaneous.', avatar: '/avatar-1.png' },
    { name: 'Sarah Chen', role: 'Liquidity Auditor', text: 'Absolute high-fidelity terminal aesthetics coupled with professional settlement logic.', avatar: '/avatar-2.png' },
    { name: 'Marcus Thorne', role: 'Strategic Node Lead', text: 'Optimizing $50k+ daily via the Institutional Hub. Captiv8 is the definitive matrix.', avatar: '/avatar-3.png' }
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
            <Link href="#how-it-works" className="hover:text-cyan-400 transition-colors">PROTOCOL</Link>
            <Link href="#tiers" className="hover:text-cyan-400 transition-colors">TIERS</Link>
            <Link href="#testimonials" className="hover:text-cyan-400 transition-colors">AGENTS</Link>
            <Link href="#features" className="hover:text-cyan-400 transition-colors">SECURITY</Link>
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
            {['PROTOCOL', 'TIERS', 'AGENTS', 'SECURITY'].map((item, i) => (
                <Link key={i} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black italic tracking-tighter uppercase text-white/40 hover:text-cyan-400 transition-colors">{item}</Link>
            ))}
            <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
              <button className="px-16 py-6 bg-cyan-500 text-slate-950 rounded-[32px] font-black text-sm uppercase tracking-[0.4em]">ACCESS HUB</button>
            </Link>
          </div>
        </div>

        {/* Hero Hub - Institutional Split */}
        <section className="relative pt-12 lg:pt-24 pb-32 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
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
            </div>
          </div>

          {/* Right Node: Vertical Metric Hub */}
          <div className="hero-cards flex-1 w-full max-w-lg lg:max-w-none">
             <div className="relative space-y-6 lg:pl-20">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] shadow-3xl flex items-center gap-10 group cursor-pointer relative overflow-hidden"
                    >
                        <div className={cn("w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl transition-all group-hover:rotate-6", stat.bg, stat.color)}>
                            <stat.icon size={36} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2">{stat.label}</p>
                            <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
             </div>
          </div>
        </section>

        {/* How it Works - Operational Path */}
        <section id="how-it-works" className="px-8 py-32 max-w-7xl mx-auto">
            <div className="text-center mb-24">
                 <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-4">PROTOCOL DEPLOYMENT</h2>
                 <p className="text-slate-500 text-xs font-black uppercase tracking-[0.6em]">Three Stages of Institutional Acquisition</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-y-1/2 z-0" />
                
                {operationalSteps.map((step, i) => (
                    <div key={i} className="relative z-10 bg-slate-950/40 backdrop-blur-2xl border border-white/5 p-12 rounded-[56px] text-center hover:border-cyan-500/20 transition-all group">
                        <span className="text-[100px] font-black italic text-white/5 absolute -top-8 left-1/2 -translate-x-1/2 group-hover:text-cyan-500/10 transition-colors">{step.id}</span>
                        <div className="w-20 h-20 rounded-[28px] bg-cyan-500/10 flex items-center justify-center text-cyan-400 mx-auto mb-10 shadow-3xl group-hover:scale-110 transition-transform">
                             <step.icon size={36} />
                        </div>
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-6">{step.title}</h4>
                        <p className="text-sm font-medium text-slate-500 italic leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Node Tiers - VIP SECTION */}
        <section id="tiers" className="px-8 py-32 bg-slate-950/40 border-y border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-baseline justify-between gap-8 mb-24">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4">VERIFIED NODES</h2>
                        <p className="text-cyan-400 text-xs font-black uppercase tracking-[0.5em]">INSTITUTIONAL GRADE YIELD TIERS</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tiers.map((tier, i) => (
                        <div key={i} className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-10 rounded-[48px] shadow-3xl flex flex-col group hover:scale-[1.02] transition-all">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">{tier.name}</h5>
                            <h3 className="text-5xl font-black italic tracking-tighter mb-10">${tier.price}</h3>
                            
                            <div className="space-y-6 mb-12">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">YIELD RATE</span>
                                    <span className="text-xl font-bold italic text-cyan-400">{tier.yield}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">DAILY UNITS</span>
                                    <span className="text-xl font-bold italic text-white">{tier.tasks}</span>
                                </div>
                            </div>

                            <Link href="/auth/login" className="mt-auto">
                                <button className="w-full py-5 rounded-[24px] bg-white/5 border border-white/10 font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-slate-950 transition-all">
                                    INVOKE TIER
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials - Agent Feedback */}
        <section id="testimonials" className="px-8 py-32 max-w-7xl mx-auto">
            <div className="text-center mb-24">
                 <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-4">AGENT REGISTRY</h2>
                 <p className="text-slate-500 text-xs font-black uppercase tracking-[0.6em]">Verified Global Feedback Loops</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <div key={i} className="bg-slate-900/40 border border-white/5 p-12 rounded-[56px] relative group">
                        <Quote className="absolute top-8 right-8 text-cyan-500/10 group-hover:text-cyan-400/20 transition-colors" size={60} />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center p-1 overflow-hidden">
                                <Activity className="text-cyan-400" />
                            </div>
                            <div>
                                <h5 className="font-black italic uppercase tracking-tighter text-white">{t.name}</h5>
                                <p className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60">{t.role}</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-lg italic leading-relaxed">"{t.text}"</p>
                        
                        <div className="mt-10 flex items-center gap-1">
                            {[1,2,3,4,5].map(s => <Star key={s} size={10} fill="currentColor" className="text-cyan-400" />)}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Feature Grid - Security */}
        <section id="features" className="px-8 pb-40 max-w-7xl mx-auto">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[64px] border border-white/5 p-12 md:p-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-10">
                        LEDGER <br />
                        <span className="text-cyan-500">CONSENSUS</span>
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
                    <div className="relative rounded-[56px] border border-white/10 overflow-hidden shadow-3xl bg-slate-950 aspect-square flex items-center justify-center p-12">
                         <div className="w-full h-full border-2 border-dashed border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center p-20">
                             <ShieldCheck className="text-cyan-500" size={120} strokeWidth={1} />
                         </div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Ready to Start - Final Call to Action */}
        <section className="px-8 pb-32 max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[80px] bg-slate-900 border border-white/5 py-24 md:py-32 px-10 text-center group">
            {/* High-Fidelity Background Asset */}
            <div className="absolute inset-0 z-0">
               <Image 
                src="/ready_to_start_bg_1774267671240.png" 
                alt="Institutional Background" 
                fill 
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-12">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                READY TO INITIATE SESSION?
              </div>

              <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">
                FINALIZE YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">AGENT LINK</span>
              </h2>

              <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic">
                Join our elite global network of synchronized agent nodes. Verify high-fidelity assets and harvest institutional gains in real-time.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-16 py-6 bg-cyan-500 text-slate-950 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group/btn">
                    ACTIVATE NODE <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/auth/sign-up" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[32px] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                    CREATE REGISTRY
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
            
            <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] italic">
               © 2026 GLOBAL INSTITUTIONAL DISTRIBUTION MATRIX. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
