'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShieldCheck, Zap, Globe, TrendingUp, ChevronRight, Cpu, Lock, Activity, Loader2, Volume2, Fingerprint, Database, Radio, Smartphone, Users, CheckCircle, BarChart3, Network } from 'lucide-react';

// MASTER CAPTIV8 SCRIPT & SCENE MAPPING
// Total Duration: ~75.0s
const slides = [
    {
        bg: '/ready_to_start_bg_1774267671240.png',
        text: 'INTRODUCING CAPTIV8',
        subtext: 'THE INSTITUTIONAL HUB FOR HIGH-FIDELITY LIQUIDITY NODES',
        color: 'white',
        icon: Fingerprint,
        duration: 5.0
    },
    {
        bg: '/promo_3d_core.png',
        text: 'GLOBAL MESH NETWORK',
        subtext: 'JOIN OVER 20,000 ACTIVE OPERATORS MINING ASSETS IN REAL-TIME',
        color: 'cyan',
        icon: Network,
        duration: 6.0
    },
    {
        bg: '/promo_wealth_elite.png',
        text: 'MAXIMIZE YOUR YIELD',
        subtext: 'ELITE ALGORITHMS OPTIMIZED FOR THE MODERN SMARTPHONE USER',
        color: 'yellow',
        icon: BarChart3,
        duration: 6.0
    },
    {
        bg: '/promo_bg_us_protocol.png',
        text: 'ZERO-BARRIER ENTRY',
        subtext: 'NO UPFRONT INVESTMENT REQUIRED. START EARNING INSTANTLY.',
        color: 'white',
        icon: Zap,
        duration: 6.0
    },
    {
        bg: '/promo_bg_vault.png',
        text: 'USDC SETTLEMENTS',
        subtext: 'ENJOY GUARANTEED STABILITY. EARN IN 1:1 PEGGED ASSETS.',
        color: 'emerald',
        icon: Lock,
        duration: 6.0
    },
    {
        bg: '/promo_bg_network.png',
        text: 'AUTONOMOUS NODES',
        subtext: 'POWERED BY THE NEURAL ENGINE v4.2 FOR CONTINUOUS SETTLEMENT.',
        color: 'cyan',
        icon: Zap,
        duration: 7.0
    },
    {
        bg: '/ready_to_start_bg_1774267671240.png',
        text: 'INSTITUTIONAL TRUST',
        subtext: 'VERIFIED SECURITY PROTOCOLS AND ON-CHAIN TRANSPARENCY.',
        color: 'white',
        icon: ShieldCheck,
        duration: 7.0
    },
    {
        bg: '/promo_bg_global_mesh.png',
        text: 'WITHDRAW ANYTIME',
        subtext: 'SEAMLESS LIQUIDITY TRANSFERS WITH ZERO-WAIT SETTLEMENT.',
        color: 'cyan',
        icon: Activity,
        duration: 8.0
    },
    {
        bg: '/promo_bg_conclusion.png',
        text: 'SHAPE YOUR FUTURE',
        subtext: 'ACTIVATE YOUR CAPTIV8 NODE TODAY. START YOUR WEALTH HARVEST.',
        color: 'yellow',
        icon: CheckCircle,
        duration: 12.0
    }
];

export default function PromoPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [assetLoading, setAssetLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [audioTime, setAudioTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const TOTAL_DURATION = slides.reduce((acc, s) => acc + s.duration, 0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // HYPER-SYNC ENGINE: 50Hz refresh
    useEffect(() => {
        if (!isPlaying || !audioRef.current) return;

        const syncInterval = setInterval(() => {
            if (audioRef.current) {
                const currentTime = audioRef.current.currentTime;
                setAudioTime(currentTime);
                
                let cumulative = 0;
                for (let i = 0; i < slides.length; i++) {
                    cumulative += slides[i].duration;
                    if (currentTime < cumulative) {
                        if (currentSlide !== i) setCurrentSlide(i);
                        break;
                    }
                }
            }
        }, 20); 
        
        return () => clearInterval(syncInterval);
    }, [isPlaying, currentSlide]);

    // PRE-LOADER PRO MAX
    useEffect(() => {
        let loadedCount = 0;
        const totalItems = slides.length + 2; 

        const updateProgress = () => {
            loadedCount++;
            setLoadProgress(Math.floor((loadedCount / totalItems) * 100));
            if (loadedCount >= totalItems) {
                setTimeout(() => setAssetLoading(false), 2000); 
            }
        };

        const emergencyUnlock = setTimeout(() => {
            if (assetLoading) {
                setLoadProgress(100);
                setTimeout(() => setAssetLoading(false), 800);
            }
        }, 5000); // Super fast 5s emergency unlock

        slides.forEach(s => {
            const img = new Image();
            img.src = s.bg;
            img.onload = updateProgress;
            img.onerror = updateProgress;
        });

        if (audioRef.current) {
            audioRef.current.addEventListener('canplaythrough', updateProgress, { once: true });
        } else {
            updateProgress();
        }

        return () => clearTimeout(emergencyUnlock);
    }, []);

    const startPresentation = () => {
        setIsPlaying(true);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    };

    const slide = slides[currentSlide];

    if (assetLoading) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[1000] overflow-hidden text-center">
                <img src="/promo_3d_loading.png" alt="Loading" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[5px]" />
                <div className="relative z-10 w-full max-w-md px-10">
                    <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-8" strokeWidth={1} />
                    <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase mb-2">Initiating Captiv8 Node</h3>
                    <div className="h-1 w-full bg-white/5 rounded-full">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${loadProgress}%` }} className="h-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#020617] overflow-hidden flex items-center justify-center font-sans select-none">
            {/* NEW AUTHENTIC AUDIO SOURCE (Deep Bass + Professional Human Narration) */}
            <audio ref={audioRef} id="promo-audio" preload="auto">
                <source src="/promo_audio_brand.m4a" type="audio/mp4" />
            </audio>
            
            {!isPlaying && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-12 text-center px-10 relative z-10">
                        <img src="/logo.png" className="w-40 h-40 object-contain rounded-3xl" alt="Logo" />
                        <div className="space-y-4">
                            <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase text-white leading-none">THE <span className="text-cyan-400">FUTURE</span></h2>
                            <p className="text-white/20 text-[11px] font-black uppercase tracking-[1.5em] leading-none">CAPTIV8 // HIGH-FIDELITY YIELD</p>
                        </div>
                        <button onClick={startPresentation} className="group overflow-hidden flex items-center gap-8 px-28 py-10 bg-white text-black rounded-full font-black text-xl uppercase tracking-[0.5em] hover:bg-cyan-400 transition-all active:scale-95">
                            ACTIVATE <ChevronRight />
                        </button>
                    </motion.div>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} 
                    className="absolute inset-0"
                >
                    <motion.img 
                        src={slide.bg} 
                        animate={{ scale: [1, 1.15], x: [-10, 10] }}
                        transition={{ duration: slide.duration, ease: "linear" }}
                        className="w-full h-full object-cover opacity-40 contrast-150 saturate-0 brightness-75" // High Contrast B&W Aesthetic for text pop
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50" />
                </motion.div>
            </AnimatePresence>

            {/* MASTER CAPTIV8 HUD */}
            <div className="absolute inset-x-20 top-20 flex justify-between z-50">
                <div className="text-left space-y-1">
                    <h4 className="text-5xl font-black italic tracking-tighter uppercase text-cyan-400 leading-none">CAPTIV8 // CORE</h4>
                    <span className="text-[14px] font-black text-white font-mono tracking-widest">{audioTime.toFixed(2)}s / 75.00s</span>
                </div>
                {React.createElement(slide.icon, { className: "text-white w-20 h-20 opacity-20", strokeWidth: 0.5 })}
            </div>

            <div className="relative z-30 text-center px-10 w-full max-w-[1400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`content-${currentSlide}`}
                        initial={{ y: 100, opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                        animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ y: -100, opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center"
                    >
                        <h1 className={cn(
                            "text-7xl md:text-[14rem] font-black italic tracking-tighter uppercase mb-2 md:mb-4 leading-[0.75] drop-shadow-3xl",
                            slide.color === 'yellow' ? 'text-yellow-400' : 
                            slide.color === 'cyan' ? 'text-cyan-400' : 
                            slide.color === 'emerald' ? 'text-emerald-400' : 'text-white'
                        )}>
                            {slide.text}
                        </h1>
                        <p className="text-xl md:text-5xl font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/90 italic max-w-5xl leading-[1.1] font-mono shadow-black drop-shadow-[0_10px_20px_rgba(0,0,0,1)]">
                            {slide.subtext}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute bottom-20 left-20 right-20 z-50">
                 <div className="h-[2px] w-full bg-white/5 rounded-full relative overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isPlaying ? "100%" : 0 }}
                        transition={{ duration: TOTAL_DURATION, ease: "linear" }}
                        className="absolute inset-0 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,1)] z-10"
                    />
                </div>
            </div>

            {/* OVERLAY EFFECTS PRO MAX */}
            <div className="absolute inset-0 z-10 pointer-events-none border-[40px] border-black/20" />
            <div className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.95)_100%)]" />
        </div>
    );
}
