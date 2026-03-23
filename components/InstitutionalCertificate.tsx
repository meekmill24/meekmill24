'use client';

import React from 'react';
import { Award, ShieldCheck, CheckCircle2, Zap, Globe, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface CertificateProps {
    username: string;
    level: string;
    date: string;
    nodeId: string;
}

export default function InstitutionalCertificate({ username, level, date, nodeId }: CertificateProps) {
    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="certificate-container relative bg-white overflow-hidden rounded-lg shadow-2xl p-1 md:p-2 bg-gradient-to-br from-slate-200 via-white to-slate-200 border-8 border-slate-900/5 print:shadow-none print:border-0">
                {/* Security Borders */}
                <div className="absolute inset-0 border-[20px] border-slate-100 opacity-50 pointer-events-none" />
                <div className="absolute inset-0 border-[1px] border-slate-900/10 pointer-events-none" />
                
                {/* Inner Content Hub */}
                <div className="relative bg-white border-2 border-slate-200 p-8 md:p-12 text-slate-950 flex flex-col items-center text-center">
                    {/* Header Nodes */}
                    <div className="flex justify-between w-full mb-10 items-start">
                        <div className="flex items-center gap-2">
                             <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded">
                                <span className="text-white font-black italic text-lg tracking-tighter">C8</span>
                             </div>
                             <div className="text-left">
                                <p className="text-[8px] font-black tracking-widest text-slate-500 uppercase">PROTOCOL</p>
                                <p className="text-xs font-black tracking-tighter uppercase leading-none">CAPTIV8 GLOBAL</p>
                             </div>
                        </div>
                        <div className="px-4 py-1 bg-slate-900/5 rounded border border-slate-900/10">
                            <p className="text-[8px] font-black tracking-widest text-slate-500 uppercase">NODE ID</p>
                            <p className="text-[10px] font-mono font-bold tracking-tight">{nodeId}</p>
                        </div>
                    </div>

                    <Award className="text-slate-900 mb-6" size={64} strokeWidth={1} />
                    
                    <h1 className="text-4xl font-serif italic text-slate-900 mb-2">Institutional Agent</h1>
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500 mb-10">Professional Verification Certificate</p>
                    
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-10" />
                    
                    <p className="text-sm font-medium text-slate-600 mb-2 italic">This document officially certifies that</p>
                    <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-950 mb-4 underline decoration-slate-200 underline-offset-8 decoration-4">@{username}</h2>
                    
                    <p className="max-w-md text-sm text-slate-600 leading-relaxed mb-10">
                        Has successfully satisfied all institutional verification protocols and is hereby recognized as an active participant in the <span className="font-bold text-slate-950">{level} Protocol Hub</span>.
                    </p>

                    <div className="grid grid-cols-2 gap-12 w-full mb-12">
                        <div className="text-center">
                            <div className="h-px bg-slate-400 w-full mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authorized Date</p>
                            <p className="text-xs font-bold text-slate-900">{date}</p>
                        </div>
                        <div className="text-center">
                            <div className="h-px bg-slate-400 w-full mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Signature</p>
                            <p className="text-[10px] font-serif italic font-bold">Protocol Validation AI</p>
                        </div>
                    </div>

                    {/* Seal Node */}
                    <div className="absolute bottom-8 right-8 flex flex-col items-center opacity-20">
                         <div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center p-2">
                             <ShieldCheck size={32} />
                         </div>
                         <p className="text-[6px] font-black uppercase mt-1">VERIFIED NODE</p>
                    </div>
                </div>
            </div>

            {/* Terminal Controls */}
            <div className="mt-8 flex justify-center print:hidden">
                <Button 
                    onClick={handleDownload}
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-6 flex items-center gap-3 border border-white/10 transition-all font-black uppercase tracking-widest text-[10px]"
                >
                    <Download size={16} /> Save Institutional Proof
                </Button>
            </div>
        </div>
    );
}
