'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Globe, TrendingUp, ChevronRight, Cpu, Layout, Lock } from 'lucide-react';

const slides = [
    {
        bg: '/ready_to_start_bg_1774267671240.png',
        text: 'WELCOME TO CAPTIV8',
        subtext: 'YOUR INSTITUTIONAL NODE FOR STRATEGIC YIELD OPTIMIZATION',
        color: 'white',
        icon: ShieldCheck
    },
    {
        bg: '/promo_bg_wealth.png',
        text: 'NO UPFRONT INVESTMENT REQUIRED',
        subtext: 'ACTIVATE YOUR GLOBAL NODE AND START HARVESTING WEALTH TODAY',
        color: 'yellow',
        icon: TrendingUp
    },
    {
        bg: '/promo_bg_us_protocol.png',
        text: 'STRATEGIC LIQUIDITY SYNCHRONIZATION',
        subtext: 'VERIFIED BY THE UNITED STATES INSTITUTIONAL PROTOCOL',
        color: 'cyan',
        icon: Cpu
    },
    {
        bg: '/promo_bg_influencer.png',
        text: 'THE ELITE HUB FOR THE CREATOR ECONOMY',
        subtext: 'INFLUENCER MARKETING AND HIGH-FIDELITY TECHNOLOGY',
        color: 'white',
        icon: Globe
    },
    {
        bg: '/promo_bg_vault.png',
        text: 'SECURE AND TRANSPARENT PROTOCOLS',
        subtext: 'PROTECTED BY MULTI-SIGNATURE QUANTUM ENCRYPTION',
        color: 'emerald',
        icon: Lock
    },
    {
        bg: '/promo_bg_global_mesh.png',
        text: 'GLOBAL NODE NETWORK 24/7',
        subtext: 'REAL-TIME SYNCHRONIZATION ACROSS EVERY CONTINENT',
        color: 'cyan',
        icon: Globe
    },
    {
        bg: '/promo_bg_mobile_terminal.png',
        text: 'ACCESSIBLE FROM ANY TERMINAL',
        subtext: 'MANAGE YOUR INSTITUTIONAL PORTFOLIO FROM YOUR HAND',
        color: 'white',
        icon: Layout
    },
    {
        bg: '/promo_bg_conclusion.png',
        text: 'SECURE YOUR JOURNEY TODAY',
        subtext: 'CAPTIV8. SHAPING THE FUTURE OF THE NEW ECONOMY',
        color: 'cyan',
        icon: ShieldCheck
    }
];

export default function PromoPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;
        
        // 60 seconds / 8 slides = 7.5 seconds per slide
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 7500); 
        return () => clearInterval(timer);
    }, [isPlaying]);

    const startPresentation = () => {
        setIsPlaying(true);
        const audio = document.getElementById('promo-audio') as HTMLAudioElement;
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    };

    const slide = slides[currentSlide];
    const Icon = slide.icon;

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center font-sans select-none">
            <audio id="promo-audio" src="/promo_audio_1min.m4a" />
            
            {!isPlaying && (
                <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center gap-10 px-8">
                    <div className="relative">
                        <div className="w-32 h-32 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                            <ShieldCheck className="text-cyan-400" size={56} />
                        </div>
                        <div className="absolute -inset-4 border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div className="text-center max-w-lg">
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4 leading-none">Full Production <br/><span className="text-cyan-400">Institutional Promo</span></h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] leading-relaxed">60 SECONDS // SYNCHRONIZED AUDIO NODE // 8 CINEMATIC SCENES</p>
                    </div>
                    <button 
                        onClick={startPresentation}
                        className="group flex items-center gap-4 px-16 py-7 bg-white text-slate-950 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-[0_25px_80px_rgba(255,255,255,0.15)] hover:bg-cyan-400 hover:text-slate-950 transition-all active:scale-95"
                    >
                        Initiate Full Experience <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-700 mt-10">
                        Protocol Version 3.1.0-CINEMATIC
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(40px)" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <img 
                        src={slide.bg} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />
                </motion.div>
            </AnimatePresence>

            {/* Cinematic Frame */}
            <div className="absolute inset-8 border border-white/5 pointer-events-none z-20" />
            
            {/* HUD Elements */}
            <div className="absolute top-16 left-16 flex items-center gap-8 z-40">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentSlide}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        className="w-20 h-20 bg-white/5 backdrop-blur-3xl rounded-[24px] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden"
                    >
                         <Icon className="text-white" size={40} />
                         <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                            <motion.div 
                                key={`icon-progress-${currentSlide}`}
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 7.5, ease: "linear" }}
                                className={`h-full ${
                                    slide.color === 'yellow' ? 'bg-yellow-400' : 
                                    slide.color === 'cyan' ? 'bg-cyan-400' : 
                                    slide.color === 'emerald' ? 'bg-emerald-400' : 'bg-white'
                                }`}
                            />
                         </div>
                    </motion.div>
                </AnimatePresence>
                <div className="text-left">
                    <span className="text-4xl font-black italic tracking-tighter uppercase text-white block leading-none mb-1">CAPTIV8</span>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-cyan-400">INSTITUTIONAL NODE</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">SCENE 0{currentSlide + 1} // 08</span>
                    </div>
                </div>
            </div>

            {/* Overlays */}
            <div className="relative z-30 text-center px-10 max-w-6xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`text-${currentSlide}`}
                        initial={{ y: 100, opacity: 0, letterSpacing: "1.5em" }}
                        animate={{ y: 0, opacity: 1, letterSpacing: "0em" }}
                        exit={{ y: -100, opacity: 0, letterSpacing: "-1em" }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className={`text-6xl md:text-9xl font-black italic tracking-tighter uppercase mb-10 drop-shadow-[0_40px_100px_rgba(0,0,0,1)] leading-[0.85] ${
                            slide.color === 'yellow' ? 'text-yellow-400' : 
                            slide.color === 'cyan' ? 'text-cyan-400' : 
                            slide.color === 'emerald' ? 'text-emerald-400' : 'text-white'
                        }`}>
                            {slide.text}
                        </h1>
                        <div className="flex flex-col items-center gap-10">
                            <p className="text-xs md:text-3xl font-black uppercase tracking-[0.8em] text-white/90 italic drop-shadow-2xl max-w-5xl leading-relaxed whitespace-pre-wrap">
                                {slide.subtext}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Full Width Progress Bar */}
            <div className="absolute bottom-16 left-16 right-16 h-[3px] bg-white/5 overflow-hidden rounded-full z-40">
                <motion.div 
                    key={`progress-full`}
                    initial={{ width: 0 }}
                    animate={{ width: isPlaying ? "100%" : 0 }}
                    transition={{ duration: 60, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-yellow-500"
                 />
            </div>
            
            {/* Visual Scanline & Vignette */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_4px,3px_100%] transition-opacity" />
            <div className="absolute inset-0 pointer-events-none z-[45] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
        </div>
    );
}
