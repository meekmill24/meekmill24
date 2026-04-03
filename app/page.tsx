'use client';

import { supabase } from '@/lib/supabase';
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
  Users,
  Menu,
  X,
  Play,
  Star,
  Quote,
  Activity,
  ChevronDown,
  CheckCircle2,
  DollarSign,
  Wallet,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEliteRevealed, setIsEliteRevealed] = useState(false);

  // Live earnings mockup data
  const [recentEarnings, setRecentEarnings] = useState([
    { user: 'agent_492', amount: '42.50', time: '2m ago' },
    { user: 'node_master', amount: '128.00', time: '5m ago' },
    { user: 'vault_runner', amount: '15.20', time: '8m ago' },
    { user: 'crypto_king', amount: '84.00', time: '12m ago' },
    { user: 'pro_agent', amount: '210.00', time: '15m ago' },
  ]);

  useEffect(() => {
    async function loadLevels() {
        const mockupTiers = [
            { id: 1, name: 'SILVER NODE', price: 250, commission_rate: 0.12, tasks_per_set: 40 },
            { id: 2, name: 'GOLD NODE', price: 750, commission_rate: 0.18, tasks_per_set: 65 },
            { id: 3, name: 'PLATINUM NODE', price: 2500, commission_rate: 0.25, tasks_per_set: 100 },
            { id: 4, name: 'ELITE HUB', price: 10000, commission_rate: 0.35, tasks_per_set: 250 }
        ];

        try {
            const { data, error } = await supabase.from('levels').select('*').order('price', { ascending: true });
            
            if (data && data.length > 0) {
                // If we have data, we'll use it but fill up to 4 if there's less
                const combined = [...data];
                if (combined.length < 4) {
                    combined.push(...mockupTiers.slice(combined.length));
                }
                setLevels(combined);
            } else {
                setLevels(mockupTiers);
            }
        } catch (e) {
            console.error(e);
            setLevels(mockupTiers);
        } finally {
            setLoading(false);
        }
    }
    loadLevels();

    // Rotate recent earnings every 5 seconds
    const interval = setInterval(() => {
      setRecentEarnings(prev => {
        const next = [...prev];
        const last = next.pop()!;
        return [last, ...next];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.registerPlugin(ScrollTrigger);
      
      const ctx = gsap.context(() => {
        // Hero Entrance
        gsap.from(".hero-content", {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "back.out(1.2)",
          stagger: 0.1
        });

        // Steps Reveal
        gsap.from(".step-card", {
          x: 20,
          opacity: 0.2,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: "#how-it-works",
            start: "top 85%",
          }
        });

        // Ways Reveal
        gsap.to(".way-card", {
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: "#ways-to-earn",
            start: "top 85%",
          }
        });

        // Tiers Reveal
        gsap.to(".tier-card", {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          scrollTrigger: {
            trigger: "#tiers",
            start: "top 80%",
          }
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading]);

  const stats = [
    { label: 'GLOBAL ASSETS', value: '$1.4B+', icon: Globe, color: 'text-cyan-400' },
    { label: 'ACTIVE AGENTS', value: '142K+', icon: Users, color: 'text-purple-400' },
    { label: 'TOTAL PAYOUTS', value: '$84M+', icon: DollarSign, color: 'text-emerald-400' },
  ];

  const simplifiedSteps = [
    { id: '01', title: 'CREATE ACCOUNT', desc: 'Secure your unique institutional agent ID and activate your terminal in 60 seconds.', icon: Lock, bg: 'bg-rose-500/10', text: 'text-rose-500' },
    { id: '02', title: 'COMPLETE TASKS', desc: 'Perform institutional actions to optimize global liquidity nodes and verify secure transactions.', icon: Zap, bg: 'bg-amber-500/10', text: 'text-amber-500' },
    { id: '03', title: 'EARN DAILY YIELD', desc: 'Harvest your institutional gains and withdraw instantly to your secure encrypted vault.', icon: TrendingUp, bg: 'bg-emerald-500/10', text: 'text-emerald-500' }
  ];

  const earningWays = [
    { title: 'Task Completion', desc: 'Browse a live feed of available tasks and complete them in minutes. Each finished task credits your account immediately — no waiting periods.', icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { title: 'VIP Progression', desc: 'Six VIP tiers unlock higher commission rates — up to 1.50% per task. Advance by hitting volume milestones and raising your earning ceiling.', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { title: 'Daily Salary Bonus', desc: 'Active members receive a daily salary on top of task earnings. At the highest VIP tier, bonuses can reach $32,800/month, credited automatically.', icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'Referral Commissions', desc: "Share your unique invite link and earn a percentage of every task your referrals complete — permanently. Your passive income grows with your network.", icon: Users, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
  ];

  const testimonials = [
    { name: 'Aleksey Volkov', role: 'Elite Agent Hub 4', text: 'The protocol stability in V2.4 is unmatched. My daily earnings doubled in a week.', avatar: '/avatar-1.png' },
    { name: 'Sarah Chen', role: 'Liquidity Auditor', text: 'Absolute high-fidelity terminal aesthetics coupled with professional settlement logic.', avatar: '/avatar-2.png' },
    { name: 'Marcus Thorne', role: 'Strategic Node Lead', text: 'Optimizing $50k+ daily via the Institutional Hub. Captiv8 is the definitive matrix.', avatar: '/avatar-3.png' }
  ];

  const faqs = [
    { q: 'How fast are payouts settled?', a: 'Instant. Our institutional node protocol clears all task yields within 60 seconds of verification. No waiting periods, no manual reviews.' },
    { q: 'Is my account encrypted?', a: 'Every agent terminal is protected with AES-256 bank-grade encryption and individual proxy IDs to ensure total institutional anonymity.' },
    { q: 'Can I upgrade my tier anytime?', a: "Yes. Simply increase your node volume to trigger a real-time security clearance upgrade and immediately unlock higher commission rates." },
    { q: 'How do I invite new agents?', a: "Access your unique Invite Matrix in the dashboard to generate permanent referral links. Your commission yields grow as your network expands." }
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500 selection:text-white overflow-x-hidden" ref={containerRef}>
      {/* Background Matrix: Restored Classic Look */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:50px_50px]" />
      </div>

      <div className="relative z-10">
        {/* Institutional Status Bar */}
        <div className="bg-slate-950 border-b border-white/5 py-2 px-8 flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-6 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-emerald-500">Protocol: Operational</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-cyan-500">Enc: AES-256 Active</span>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[7px] font-black uppercase tracking-[0.2em] text-slate-600">
                <span>Node: US-EAST-SYS724</span>
                <span>Latency: 12ms</span>
            </div>
        </div>

        {/* Navigation Port */}
        <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto backdrop-blur-xl sticky top-0 bg-slate-950/60 border-b border-white/5 z-[100]">
          <Link href="/" className="flex items-center gap-3 group transition-transform active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.3)] overflow-hidden">
                <div className="w-full h-full rounded-[9px] bg-slate-950 flex items-center justify-center p-2 relative">
                    <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-lg object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-cyan-400">C8</div>
                </div>
            </div>
            <span className="text-2xl font-black italic tracking-tighter uppercase text-white group-hover:text-cyan-400 transition-colors">CAPTIV8</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            <Link href="#ways-to-earn" className="hover:text-cyan-400 transition-colors">Ways to Earn</Link>
            <Link href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it works</Link>
            <Link href="#tiers" className="hover:text-cyan-400 transition-colors">Tiers</Link>
            <Link href="#testimonials" className="hover:text-cyan-400 transition-colors">Members</Link>
            <Link href="#security" className="hover:text-cyan-400 transition-colors">Security</Link>
            <Link href="#contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <button className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/20">
                START EARNING
              </button>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Nav Overlay: Institutional Hub Style */}
        <div className={`fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-3xl lg:hidden transition-all duration-500 flex flex-col justify-center items-center text-center ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none translate-x-full"}`}>
          <div className="space-y-16 w-full max-w-sm px-10">
             <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 p-6 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <X size={32} className="text-cyan-400" />
             </button>
             
             <div className="space-y-4">
                <h2 className="text-6xl font-black italic tracking-tighter uppercase text-white leading-none">CAPTIV8</h2>
                <div className="h-1 w-20 bg-cyan-500 mx-auto rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 mt-4 italic">INSTITUTIONAL HUB</p>
             </div>
             
             <div className="flex flex-col gap-10">
                {["WAYS TO EARN", "HOW IT WORKS", "TIERS", "MEMBERS", "SECURITY", "CONTACT"].map((item, i) => (
                  <Link 
                    key={i} 
                    href={`#${item.toLowerCase().replace(/ /g, "-")}`} 
                    className="text-4xl font-black italic uppercase tracking-tighter hover:text-cyan-400 transition-colors hover:scale-105 active:scale-95 text-white/40"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
             </div>

             <div className="pt-16 border-t border-white/5 w-full">
                <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full py-7 bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-[0.3em] rounded-[40px] shadow-2xl shadow-cyan-500/20 active:scale-95 transition-all">
                        INITIALIZE DASHBOARD
                    </button>
                </Link>
             </div>
          </div>
        </div>
        {/* HERO SECTION */}
        <section className="relative px-8 pt-16 lg:pt-32 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live: 1,248 Agents Active Today
              </motion.div>

              <h1 className="hero-content text-5xl md:text-7xl lg:text-[88px] font-black italic tracking-tighter uppercase leading-[0.9] text-white">
                Earn Passive <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">Income Daily</span> <br />
                With Simple Tasks
              </h1>

              <p className="hero-content max-w-xl mx-auto lg:mx-0 text-slate-400 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-cyan-500/30 pl-6">
                No experience required. Complete institutional digital actions and withdraw your profits instantly. Join the world's most elite earning node.
              </p>

              <div className="hero-content pt-4 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link href="/auth/login">
                  <button className="group relative w-full sm:w-auto px-12 py-6 bg-cyan-500 text-slate-950 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-3">START EARNING NOW <ArrowUpRight size={18} /></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
                <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/5 rounded-3xl">
                   <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800" />)}
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">+14K OTHERS JOINED</p>
                </div>
              </div>
            </div>

            {/* Right UI Preview */}
            <div className="flex-1 w-full relative">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 transition={{ duration: 1, delay: 0.5 }}
                 className="relative z-10 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[56px] p-8 md:p-12 shadow-3xl overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
                  
                  {/* Dashboard Mockup */}
                  <div className="relative space-y-10">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AVAILABLE BALANCE</p>
                           <h4 className="text-4xl font-black italic tracking-tighter">$12,480.50</h4>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                           <Wallet size={28} />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">TODAY'S PROFIT</p>
                           <p className="text-2xl font-black italic tracking-tighter text-emerald-400">+$245.20</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">NODES ACTIVE</p>
                           <p className="text-2xl font-black italic tracking-tighter text-cyan-400">08 ACTIVE</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LIVE EARNINGS STREAM</p>
                        <div className="space-y-3">
                           {recentEarnings.slice(0, 3).map((e, i) => (
                             <motion.div 
                               key={e.user + i}
                               layout
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
                             >
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                      <Activity size={14} />
                                   </div>
                                   <p className="text-[10px] font-black italic opacity-60">@{e.user}</p>
                                </div>
                                <p className="text-[11px] font-black text-emerald-400 tracking-tight">+ ${e.amount}</p>
                             </motion.div>
                           ))}
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Background Decorative */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]" />
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-[80px]" />
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="px-8 py-12 bg-slate-950/40 border-y border-white/5">
           <div className="max-w-7xl mx-auto flex flex-wrap justify-center sm:justify-between gap-12">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-6">
                   <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center", s.color)}>
                      <s.icon size={24} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                      <h4 className="text-3xl font-black italic tracking-tighter">{s.value}</h4>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* 3-STEP FLOW: SPLIT MATRIX REVEAL */}
        <section id="how-it-works" className="px-8 py-32 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left side: High-Fidelity Visual */}
            <div className="lg:col-span-7 relative group order-2 lg:order-1">
               <div className="absolute -inset-4 bg-cyan-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="relative rounded-[60px] overflow-hidden border border-white/5 shadow-2xl backdrop-blur-3xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent z-10 pointer-events-none" />
                  <Image 
                    src="/terminal.png" 
                    alt="Institutional Terminal" 
                    width={800} 
                    height={800} 
                    className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 hover:scale-105"
                  />
                  {/* Holographic Status Overlay */}
                  <div className="absolute bottom-10 left-10 z-20 flex gap-4">
                     <div className="px-5 py-2 bg-slate-950/80 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                        <Activity size={12} className="animate-pulse" /> LIVE_SYNC: ACTIVE
                     </div>
                     <div className="px-5 py-2 bg-slate-950/80 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        PROXY_SECURE: PASS
                     </div>
                  </div>
               </div>
            </div>

            {/* Right side: Vertical Activation Steps */}
            <div className="lg:col-span-5 space-y-12 order-1 lg:order-2">
               <div className="space-y-4 mb-8">
                  <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">Easy As <br /><span className="text-cyan-500">1, 2, 3</span></h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] italic">INSTANT SETTLEMENT PIPELINE</p>
               </div>

               <div className="space-y-12 relative">
                  {/* Progress Line */}
                  <div className="absolute left-10 top-10 bottom-10 w-[2px] bg-white/5 z-0" />
                  <div className="absolute left-10 top-10 h-1/2 w-[2px] bg-gradient-to-b from-cyan-500 to-transparent z-0 animate-pulse" />

                  {simplifiedSteps.map((step, i) => (
                    <div key={i} className="step-card group relative flex items-start gap-10 z-10 transition-all duration-700">
                       <div className={cn("w-20 h-20 shrink-0 rounded-[24px] flex items-center justify-center shadow-xl transition-all group-hover:scale-110", step.bg, step.text, "backdrop-blur-xl border border-white/5")}>
                          <step.icon size={32} />
                       </div>
                       <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-3">
                             <span className={cn("text-[9px] font-black uppercase tracking-[0.3em]", step.text)}>STEP {step.id}</span>
                             <div className="h-[1px] w-8 bg-white/10" />
                          </div>
                          <h4 className="text-2xl font-black italic tracking-tighter uppercase">{step.title}</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed italic max-w-sm">{step.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </section>

        {/* MULTIPLE WAYS TO EARN */}
        <section id="ways-to-earn" className="px-8 py-32 max-w-7xl mx-auto relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-24">
            <div className="text-center lg:text-left flex flex-col lg:flex-row items-end justify-between gap-8">
               <div className="space-y-4 max-w-2xl">
                  <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.85]">Multiple Ways <br /> <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-500">To Earn</span></h2>
                  <p className="text-slate-400 text-lg md:text-xl font-medium italic border-l-4 border-cyan-500/30 pl-6">
                    Maximize your yield through our diversified institutional earning matrix. Every action drives instant profit to your secure terminal.
                  </p>
               </div>
               <div className="hidden lg:block px-8 py-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
                    <Activity size={16} className="text-cyan-500 animate-pulse" /> 16.48% AVG. PORTFOLIO GROWTH
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {earningWays.map((way, i) => (
                <div key={i} className="way-card group relative p-10 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[48px] overflow-hidden hover:border-white/10 transition-all duration-500 opacity-0 translate-x-10">
                  <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity", way.bg)} />
                  <div className="relative z-10 flex flex-col md:flex-row gap-10">
                    <div className={cn("w-20 h-20 shrink-0 rounded-3xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-3", way.bg, way.color)}>
                      <way.icon size={36} />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-2xl font-black italic tracking-tighter uppercase text-white group-hover:text-cyan-400 transition-colors">{way.title}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed italic">{way.desc}</p>
                      <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                         <span className={cn("text-[9px] font-black uppercase tracking-widest", way.color)}>Instant Settlement Active</span>
                         <ArrowUpRight size={14} className={way.color} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EARNING TIERS */}
        <section id="tiers" className="px-8 py-32 bg-slate-950/60 border-y border-white/5 relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="flex flex-col lg:flex-row items-end justify-between gap-8 text-center lg:text-left">
               <div className="space-y-4">
                  <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">Verified Nodes</h2>
                  <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em] italic hover:animate-pulse cursor-default">INSTITUTIONAL GRADE YIELD TIERS</p>
                  {!isEliteRevealed && (
                    <div className="pt-4">
                        <button 
                            onClick={() => setIsEliteRevealed(true)}
                            className="px-8 py-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_20px_rgba(244,63,94,0.15)] flex items-center gap-3 animate-pulse"
                        >
                            <Lock size={14} /> UNLOCK CLASSIFIED ULTIMATE HUB
                        </button>
                    </div>
                  )}
               </div>
               <div className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl hidden sm:block">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                     <Activity size={14} /> ALL NODES SYNCHRONIZED
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {levels.length > 0 ? levels.slice(0, levels.length - 1).map((tier, i) => (
                    <div key={i} className="tier-card bg-slate-900 p-10 rounded-[48px] border border-white/5 flex flex-col group hover:border-cyan-500/30 transition-all shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                           <Zap size={24} className="text-cyan-400" />
                        </div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{tier.name}</h5>
                        <h3 className="text-5xl font-black italic tracking-tighter mb-10 text-white">${Number(tier.price).toLocaleString()}</h3>
                        
                        <div className="space-y-4 mb-12">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Yield Rate</span>
                                <span className="text-lg font-black italic text-cyan-400">{(Number(tier.commission_rate) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Daily Units</span>
                                <span className="text-lg font-black italic text-white">{tier.tasks_per_set}</span>
                            </div>
                        </div>

                        <Link href="/auth/login" className="mt-auto">
                            <button className="w-full py-5 rounded-[24px] bg-white/5 border border-white/10 font-black text-[10px] tracking-[0.2em] uppercase hover:bg-white hover:text-slate-950 transition-all active:scale-95 shadow-lg">
                                INVOKE TIER
                            </button>
                        </Link>
                    </div>
                )) : (
                  [1,2,3].map(i => <div key={i} className="bg-slate-900/40 animate-pulse h-[400px] rounded-[48px]" />)
                )}

                {isEliteRevealed && levels.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        className="tier-card bg-slate-900 p-10 rounded-[48px] border-2 border-rose-500/30 flex flex-col group hover:border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-40">
                            <ShieldCheck size={28} className="text-rose-500" />
                        </div>
                        <div className="absolute top-0 left-0 px-6 py-2 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded-br-2xl shadow-lg">CLASSIFIED</div>
                        
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-4 mb-2">{levels[levels.length - 1].name}</h5>
                        <h3 className="text-5xl font-black italic tracking-tighter mb-10 text-white group-hover:text-rose-400 transition-colors">${Number(levels[levels.length - 1].price).toLocaleString()}</h3>
                        
                        <div className="space-y-4 mb-12">
                            <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Yield Rate</span>
                                <span className="text-lg font-black italic text-rose-500">{(Number(levels[levels.length - 1].commission_rate) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Daily Units</span>
                                <span className="text-lg font-black italic text-white">{levels[levels.length - 1].tasks_per_set}</span>
                            </div>
                        </div>

                        <Link href="/auth/login" className="mt-auto">
                            <button className="w-full py-5 rounded-[24px] bg-rose-500 text-slate-950 font-black text-[10px] tracking-[0.2em] uppercase hover:bg-rose-400 transition-all active:scale-95 shadow-xl shadow-rose-500/20">
                                INVOKE TIER
                            </button>
                        </Link>
                    </motion.div>
                )}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="px-8 py-32 max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
              <div className="lg:col-span-1 space-y-8 text-center lg:text-left">
                 <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">Why Agents <br /> <span className="text-cyan-500">Love Us</span></h2>
                 <p className="text-slate-500 text-lg italic leading-relaxed">
                    Don't just take our word for it. Hear from our elite nodes earning daily profit across the global matrix.
                 </p>
                 <div className="flex items-center justify-center lg:justify-start gap-4">
                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white italic">4.9/5 RATING</div>
                    <div className="flex -space-x-3">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800" />)}
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {testimonials.map((t, i) => (
                    <div key={i} className="bg-slate-900/40 border border-white/5 p-10 rounded-[48px] space-y-6 group hover:border-cyan-500/20 transition-all">
                       <Quote className="text-cyan-500/10" size={40} />
                       <p className="text-slate-400 italic text-lg leading-relaxed">"{t.text}"</p>
                       <div className="flex items-center gap-4 pt-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 overflow-hidden">
                             <img src={t.avatar} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                          </div>
                          <div>
                             <h5 className="font-black italic uppercase tracking-tighter text-white">{t.name}</h5>
                             <p className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60">{t.role}</p>
                          </div>
                       </div>
                    </div>
                 ))}
                 <div className="p-10 rounded-[48px] bg-gradient-to-br from-cyan-600 to-indigo-700 flex flex-col justify-center items-center text-center space-y-6 shadow-2xl">
                    <h4 className="text-3xl font-black italic tracking-tighter uppercase">Your Name <br /> Here?</h4>
                    <Link href="/auth/login" className="w-full">
                       <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">JOIN THE ELITE</button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* SYSTEM SUPPORT MATRIX: FAQ */}
        <section id="security" className="px-8 py-32 max-w-5xl mx-auto relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
           <div className="space-y-16">
              <div className="text-center space-y-6">
                 <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">System <br /> <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-500">Support Matrix</span></h2>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] italic">GLOBAL AGENT CLEARANCE PROTOCOL</p>
              </div>

              <div className="space-y-4">
                 {faqs.map((faq, i) => (
                   <div key={i} className="border border-white/5 bg-slate-900/40 rounded-3xl overflow-hidden backdrop-blur-xl group transition-all hover:border-white/10">
                      <button 
                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                        className="w-full p-8 flex items-center justify-between text-left group-hover:bg-white/[0.02] transition-colors"
                      >
                         <h4 className="text-xl font-black italic tracking-tighter uppercase text-white group-hover:text-cyan-400 transition-colors uppercase">{faq.q}</h4>
                         <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform", activeFaq === i ? "rotate-180 bg-cyan-500/20 text-cyan-400" : "text-slate-500")}>
                            <ChevronDown size={20} />
                         </div>
                      </button>
                      <motion.div 
                        initial={false}
                        animate={{ height: activeFaq === i ? 'auto' : 0, opacity: activeFaq === i ? 1 : 0 }}
                        className="overflow-hidden"
                      >
                         <div className="px-8 pb-8 text-slate-400 font-medium italic leading-relaxed border-t border-white/5 pt-6 text-sm">
                            {faq.a}
                         </div>
                      </motion.div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CONTACT US FORM SECTION */}
        <section id="contact" className="px-8 py-32 max-w-7xl mx-auto relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
           
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-center lg:text-left">
                 <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    SUPPORT DESK ACTIVE
                 </div>
                 
                 <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                    SECURE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-500">COMMS LINK</span>
                 </h2>
                 
                 <p className="text-slate-400 text-lg md:text-xl font-medium italic border-l-4 border-cyan-500/30 pl-6 max-w-lg mx-auto lg:mx-0">
                    Require protocol assistance or want to inquire about custom node allocation? Send an encrypted dispatch to our core team.
                 </p>

                 <div className="flex flex-col sm:flex-row gap-6 pt-4 justify-center lg:justify-start">
                    <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/5 rounded-3xl">
                       <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                          <Clock size={20} />
                       </div>
                       <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">AVERAGE RESPONSE</p>
                          <p className="font-black italic tracking-tight text-white">&lt; 15 MINUTES</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700" />
                 
                 <form className="relative z-10 space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Transmission Sent Securely'); }}>
                    <div className="space-y-4">
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-4">AGENT IDENTIFIER (NAME)</label>
                          <input type="text" placeholder="Enter your alias..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-medium" required />
                       </div>
                       
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-4">ENCRYPTED RETURN ADDRESS (EMAIL)</label>
                          <input type="email" placeholder="node@protocol.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-medium" required />
                       </div>

                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-4">TRANSMISSION DATA (MESSAGE)</label>
                          <textarea placeholder="Specify your clearance request..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-medium resize-none" required></textarea>
                       </div>
                    </div>

                    <button type="submit" className="w-full py-5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                       TRANSMIT DISPATCH <Zap size={16} />
                    </button>
                 </form>
              </div>
           </div>
        </section>

        {/* FINAL CONVERSION SECTION */}
        <section className="px-8 pb-32 max-w-7xl mx-auto">
          <div className="relative rounded-[80px] bg-slate-900 border border-white/5 py-32 px-10 text-center overflow-hidden group">
             <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
             </div>

             <div className="relative z-10 space-y-12">
               <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  SLOTS AVAILABLE FOR TODAY
               </div>

               <h2 className="text-5xl md:text-[88px] font-black italic tracking-tighter uppercase leading-[0.85] text-white">
                  STOP WATCHING <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-emerald-400">START EARNING</span>
               </h2>

               <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic">
                  It takes less than 2 minutes to set up your account and start your first task. Don't let another day go by without passive yield.
               </p>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                  <Link href="/auth/login" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-16 py-8 bg-white text-slate-950 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                       GO TO DASHBOARD <ChevronRight size={24} />
                    </button>
                  </Link>
                  <div className="flex flex-col items-center sm:items-start">
                     <div className="flex gap-1 mb-2 text-cyan-400">
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">TRUSTED BY 142,000+ USERS</p>
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* Professional Footer */}
        <footer className="px-8 py-24 border-t border-white/5 bg-slate-950/20">
          <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
            <div className="flex items-center gap-4 opacity-80">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center p-2 border border-white/10">
                    <Image src="/logo.png" alt="Logo" width={24} height={24} />
                </div>
                <span className="text-2xl font-black italic tracking-tighter uppercase">CAPTIV8 PROTOCOL</span>
            </div>
            
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
               <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
               <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
               <Link href="/support" className="hover:text-white transition-colors">SUPPORT</Link>
            </div>

            <p className="text-slate-700 text-[9px] font-black uppercase tracking-[0.4em] italic text-center">
               © 2021 GLOBAL INSTITUTIONAL DISTRIBUTION MATRIX. PROTECTED BY AES-256 ENCRYPTION.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
