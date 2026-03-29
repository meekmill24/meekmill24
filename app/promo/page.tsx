'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Globe, TrendingUp, ChevronRight } from 'lucide-react';

const slides = [
    {
        bg: '/ready_to_start_bg_1774267671240.png',
        text: 'WELCOME TO CAPTIV8',
        subtext: 'YOUR INSTITUTIONAL NODE FOR STRATEGIC YIELD OPTIMIZATION',
        color: 'white'
    },
    {
        bg: '/promo_bg_wealth.png',
        text: 'NO UPFRONT INVESTMENT REQUIRED',
        subtext: 'ACTIVATE YOUR GLOBAL NODE AND START HARVESTING WEALTH TODAY',
        color: 'yellow'
    },
    {
        bg: '/promo_bg_us_protocol.png',
        text: 'STRATEGIC LIQUIDITY SYNCHRONIZATION',
        subtext: 'VERIFIED BY THE UNITED STATES INSTITUTIONAL PROTOCOL',
        color: 'cyan'
    },
    {
        bg: '/promo_bg_influencer.png',
        text: 'THE ELITE HUB FOR THE CREATOR ECONOMY',
        subtext: 'INFLUENCER MARKETING AND HIGH-FIDELITY TECHNOLOGY',
        color: 'white'
    },
    {
        bg: '/promo_bg_vault.png',
        text: 'SECURE, TRANSPARENT, AND GLOBAL-SCALE',
        subtext: 'WITHDRAW YOUR PROFITS ANYTIME WITH ABSOLUTE CONFIDENCE',
        color: 'emerald'
    }
];

export default function PromoPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;
        
        // Match the audio duration and pauses (approx 35s total for 5 slides = 7s per slide)
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 7000); 
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

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center font-sans">
            <audio id="promo-audio" src="/promo_audio_brand.m4a" />
            
            {!isPlaying && (
                <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center gap-10 px-8">
                    <div className="relative">
                        <div className="w-32 h-32 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                            <ShieldCheck className="text-cyan-400" size={56} />
                        </div>
                        <div className="absolute -inset-4 border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div className="text-center max-w-lg">
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4 leading-none">Institutional <br/><span className="text-cyan-400">Branded Presentation</span></h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] leading-relaxed">Synchronized Audio Node // High-Fidelity Neural Transitions</p>
                    </div>
                    <button 
                        onClick={startPresentation}
                        className="group flex items-center gap-4 px-16 py-7 bg-white text-slate-950 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-[0_25px_80px_rgba(255,255,255,0.15)] hover:bg-cyan-400 hover:text-slate-950 transition-all active:scale-95"
                    >
                        Initiate Playback <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-700 mt-10">
                        Protocol Version 2.4.0-STABLE
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.15, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <img 
                        src={slide.bg} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                </motion.div>
            </AnimatePresence>

            {/* Cinematic Frame */}
            <div className="absolute inset-8 border border-white/5 pointer-events-none z-20" />
            <div className="absolute inset-12 border-2 border-dashed border-white/5 rounded-[48px] pointer-events-none z-20" />

            {/* Overlays */}
            <div className="relative z-30 text-center px-10 max-w-6xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`text-${currentSlide}`}
                        initial={{ y: 80, opacity: 0, letterSpacing: "1em" }}
                        animate={{ y: 0, opacity: 1, letterSpacing: "0em" }}
                        exit={{ y: -80, opacity: 0, letterSpacing: "-0.5em" }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className={`text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-none ${
                            slide.color === 'yellow' ? 'text-yellow-400' : 
                            slide.color === 'cyan' ? 'text-cyan-400' : 
                            slide.color === 'emerald' ? 'text-emerald-400' : 'text-white'
                        }`}>
                            {slide.text.split(' ').map((word, i) => (
                                <span key={i} className="inline-block mr-4 last:mr-0">{word}</span>
                            ))}
                        </h1>
                        <div className="flex flex-col items-center gap-6">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: 100 }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className={`h-1 rounded-full ${
                                    slide.color === 'yellow' ? 'bg-yellow-400/50' : 
                                    slide.color === 'cyan' ? 'bg-cyan-400/50' : 
                                    slide.color === 'emerald' ? 'bg-emerald-400/50' : 'bg-white/30'
                                }`}
                            />
                            <p className="text-xs md:text-2xl font-black uppercase tracking-[0.6em] text-white/90 italic drop-shadow-lg max-w-3xl">
                                {slide.subtext}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Institutional Logo/Badge - Top Left */}
            <div className="absolute top-16 left-16 flex items-center gap-6 z-40">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-3xl rounded-[20px] border border-white/10 flex items-center justify-center shadow-2xl">
                    <ShieldCheck className="text-white" size={32} />
                </div>
                <div className="text-left">
                    <span className="text-3xl font-black italic tracking-tighter uppercase text-white block leading-none mb-1">CAPTIV8</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.6em] text-cyan-400">INSTITUTIONAL HUB</span>
                </div>
            </div>

            {/* Status Metrics - Top Right */}
            <div className="absolute top-16 right-16 hidden lg:flex items-center gap-12 z-40 opacity-40">
                <div className="text-right">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">LATENCY</span>
                    <span className="text-xs font-mono font-bold text-white">12ms</span>
                </div>
                <div className="text-right border-l border-white/10 pl-12">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">NODE STATUS</span>
                    <span className="text-xs font-mono font-bold text-emerald-500 italic">VALIDATED</span>
                </div>
            </div>

            {/* Neural Progress Bar */}
            <div className="absolute bottom-16 left-16 right-16 h-[2px] bg-white/5 overflow-hidden rounded-full z-40">
                <motion.div 
                    key={`progress-${currentSlide}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 7, ease: "linear" }}
                    className={`h-full opacity-60 ${
                        slide.color === 'yellow' ? 'bg-yellow-400' : 
                        slide.color === 'cyan' ? 'bg-cyan-400' : 
                        slide.color === 'emerald' ? 'bg-emerald-400' : 'bg-white'
                    }`}
                 />
            </div>
            
            {/* Visual Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_4px,3px_100%] transition-opacity" />
        </div>
    );
}
