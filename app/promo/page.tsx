'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Globe, TrendingUp } from 'lucide-react';

const slides = [
    {
        bg: '/promo_bg_wealth.png',
        text: 'NO UPFRONT INVESTMENT REQUIRED',
        subtext: 'ACTIVATE YOUR GLOBAL NODE AND START HARVESTING',
        color: 'yellow'
    },
    {
        bg: '/promo_bg_network.png',
        text: 'STRATEGIC LIQUIDITY SYNCHRONIZATION',
        subtext: 'VERIFIED BY THE UNITED STATES INSTITUTIONAL PROTOCOL',
        color: 'cyan'
    },
    {
        bg: '/ready_to_start_bg_1774267671240.png',
        text: 'INFLUENCER MARKETING & CREATOR TECHNOLOGY',
        subtext: 'THE ELITE HUB FOR THE NEW ECONOMY',
        color: 'white'
    },
    {
        bg: '/promo_bg_wealth.png',
        text: 'WITHDRAW YOUR PROFITS ANYTIME',
        subtext: 'SECURE, TRANSPARENT, AND GLOBAL-SCALE',
        color: 'emerald'
    }
];

export default function PromoPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // 5 seconds per slide
        return () => clearInterval(timer);
    }, [isPlaying]);

    const startPresentation = () => {
        setIsPlaying(true);
        const audio = document.getElementById('promo-audio') as HTMLAudioElement;
        if (audio) audio.play();
    };

    const slide = slides[currentSlide];

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
            <audio id="promo-audio" src="/promo_audio.m4a" loop />
            
            {!isPlaying && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center gap-10">
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center animate-pulse">
                        <Zap className="text-cyan-400" size={40} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">Institutional Presentation Ready</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Synchronized Audio & High-Fidelity Visuals</p>
                    </div>
                    <button 
                        onClick={startPresentation}
                        className="px-16 py-6 bg-white text-slate-950 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all"
                    >
                        Initiate Presentation
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <img 
                        src={slide.bg} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                </motion.div>
            </AnimatePresence>

            {/* Overlays */}
            <div className="relative z-10 text-center px-10 max-w-5xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`text-${currentSlide}`}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <h1 className={`text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] ${
                            slide.color === 'yellow' ? 'text-yellow-400' : 
                            slide.color === 'cyan' ? 'text-cyan-400' : 
                            slide.color === 'emerald' ? 'text-emerald-400' : 'text-white'
                        }`}>
                            {slide.text}
                        </h1>
                        <p className="text-sm md:text-xl font-black uppercase tracking-[0.5em] text-white/80 italic border-t-2 border-white/10 pt-6 inline-block">
                            {slide.subtext}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Institutional Logo/Badge */}
            <div className="absolute top-12 left-12 flex items-center gap-4 z-20">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center">
                    <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                    <span className="text-xl font-black italic tracking-tighter uppercase text-white block">CAPTIV8</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/40">US REGISTRY NODE</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-12 left-12 right-12 h-1 bg-white/5 overflow-hidden rounded-full z-20">
                <motion.div 
                    key={`progress-${currentSlide}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-white/40"
                 />
            </div>
        </div>
    );
}
