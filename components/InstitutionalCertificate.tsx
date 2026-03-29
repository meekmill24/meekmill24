'use client';

import React from 'react';
import { ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateProps {
    username: string;
    level: string;
    date: string;
    nodeId: string;
    platformName?: string;
    platformAddress?: string;
}

export default function InstitutionalCertificate({ username, level, date, nodeId, platformName, platformAddress }: CertificateProps) {
    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <div className="relative bg-[#fcfaf7] text-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.1)] p-8 md:p-20 font-serif border-[1px] border-slate-200 print:shadow-none print:border-0 overflow-hidden min-h-[1050px] flex flex-col rounded-sm">
                {/* Decorative Frame */}
                <div className="absolute inset-4 border border-slate-300 pointer-events-none" />
                <div className="absolute inset-6 border-4 border-double border-slate-200 pointer-events-none" />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900 pb-10 mb-12 gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white">
                                <ShieldCheck size={28} />
                            </div>
                            <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">Official Certification</h2>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-slate-950 uppercase mb-4 leading-none">UNITED STATES<br/>{platformName || 'OPERATIONS'}</h1>
                        <div className="flex gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            <div>
                                <p className="mb-1 text-slate-400">Date Issued</p>
                                <p className="text-slate-900">JANUARY 15, 2021</p>
                            </div>
                            <div>
                                <p className="mb-1 text-slate-400">Status</p>
                                <p className="text-emerald-600">Active / Valid</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="bg-slate-950 text-white px-8 py-4 mb-6 inline-block font-sans font-black uppercase tracking-[0.25em] text-xs shadow-lg">
                            Master Business License
                        </div>
                        <p className="text-lg font-black text-slate-950">BN: 753-318-302-US</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Verification Code: LVL-882-X9</p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="space-y-10 text-[14px] font-sans leading-relaxed relative flex-1 text-slate-700">
                    {/* Authentic Watermark Overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.04] mix-blend-multiply flex flex-col justify-center items-center select-none">
                        <div className="rotate-[-35deg] scale-[1.5] w-[200%] h-[200%] flex flex-col gap-12 whitespace-nowrap items-center justify-center">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className={`flex gap-12 text-5xl font-black uppercase tracking-[0.8em] ${i % 2 === 0 ? '-ml-24' : 'ml-24'}`}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <span key={j} className="flex items-center gap-4">
                                            <ShieldCheck size={40} />
                                            OFFICIAL CERTIFIED
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-bold underline uppercase mb-3 text-[11px] tracking-widest text-slate-950">Business Name and Mailing Address:</h3>
                                <p className="font-black text-slate-900 text-xl uppercase leading-tight mb-1">{platformName || "Simple Operations Inc."}</p>
                                <p className="text-slate-600 font-bold leading-relaxed pr-10">{platformAddress || "United States of America"}</p>
                            </div>

                            <div>
                                <h3 className="font-bold underline uppercase mb-3 text-[11px] tracking-widest text-slate-950">Business Address:</h3>
                                <p className="text-slate-600 font-bold leading-relaxed pr-10">{platformAddress || "United States of America"}</p>
                            </div>

                            <div className="bg-slate-50/50 p-6 border-l-4 border-slate-200">
                                <h3 className="font-bold underline uppercase mb-3 text-[11px] tracking-widest text-slate-950">Legal Name(s):</h3>
                                <p className="font-black uppercase tracking-wide text-slate-950 text-xl underline decoration-slate-300 underline-offset-4">KRISHNA SUBRAMANIAN</p>
                                <p className="text-slate-400 font-mono text-[10px] mt-2 tracking-widest font-bold">NODE PROTOCOL-ID: {nodeId}</p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between items-end">
                            {/* Blue Stamp Mimic */}
                            <div className="w-56 h-56 rounded-full border-[8px] border-blue-900/10 flex flex-col items-center justify-center p-4 rotate-[-12deg] relative bg-blue-50/20 backdrop-blur-[2px] shadow-inner">
                                <div className="absolute inset-2 border-2 border-dashed border-blue-900/20 rounded-full animate-[spin_20s_linear_infinite]" />
                                <div className="absolute inset-4 border border-blue-900/10 rounded-full" />
                                <span className="text-[9px] font-black text-blue-900/50 uppercase tracking-tighter text-center px-4 leading-tight mb-2 relative z-10">OFFICIAL SEAL OF THE<br/>{(platformName || 'UNITED STATES').toUpperCase()}</span>
                                <div className="w-24 h-24 bg-blue-900/5 rounded-full flex items-center justify-center border border-blue-900/10 my-1 shadow-sm relative z-10 transition-transform hover:scale-110">
                                    <ShieldCheck className="text-blue-900/30" size={50} />
                                </div>
                                <span className="text-[11px] font-black text-blue-800/40 tracking-[0.6em] mt-2 italic relative z-10">US AUTHENTIC</span>
                            </div>

                            <div className="text-right w-full mt-24">
                                <h3 className="font-bold underline uppercase mb-3 text-[11px] tracking-widest text-slate-950">Type of Legal Entity:</h3>
                                <p className="font-black text-slate-950 uppercase text-2xl tracking-tighter underline decoration-slate-300 underline-offset-4">GENERAL PARTNERSHIP</p>
                                <p className="text-[10px] text-slate-500 mt-3 italic font-bold tracking-tight max-w-[200px] ml-auto">(Authorized federal partnership registered under US commerce guidelines)</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t-2 border-slate-100">
                        <h3 className="font-bold underline uppercase mb-6 text-[11px] tracking-widest text-slate-950">Business Information:</h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr className="text-[10px] items-center font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                                        <th className="px-6 py-4">Classification</th>
                                        <th className="px-6 py-4">Registry Number</th>
                                        <th className="px-6 py-4">Business Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic">
                                    <tr className="bg-white">
                                        <td className="px-6 py-6 font-black uppercase text-slate-950 text-basic">BUSINESS NAME REGISTRATION</td>
                                        <td className="px-6 py-6 font-mono font-black text-slate-800 text-lg">9451838</td>
                                        <td className="px-6 py-6 font-bold text-slate-700 w-1/3">Influencer marketing, branded content, and creator economy technology.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mt-16 items-end pt-12 border-t-2 border-slate-100">
                        <div>
                            <h3 className="font-bold underline uppercase mb-8 text-[11px] tracking-widest text-slate-950">Authorized Signature:</h3>
                            <div className="relative group">
                                <div className="absolute -top-14 left-0 font-signature text-5xl text-slate-800/80 select-none pointer-events-none transform -rotate-2 italic drop-shadow-sm">
                                    {platformName || 'Operations Manager'}
                                </div>
                                <div className="border-b-2 border-slate-900 pb-2 w-72" />
                                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">Institutional Registrar</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                             <div className="w-24 h-24 border-2 border-slate-200 p-2 bg-white flex items-center justify-center opacity-80 mb-4 shadow-sm">
                                <div className="grid grid-cols-4 gap-1 w-full h-full opacity-20">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div key={i} className={`bg-black ${i % 3 === 0 ? 'opacity-100' : 'opacity-40'}`} />
                                    ))}
                                </div>
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Auth QR</p>
                        </div>
                    </div>

                    <div className="pt-12 text-[11px] text-slate-500 leading-relaxed font-sans mb-0">
                        <p className="mb-4 text-slate-600 font-medium">
                           <strong className="text-slate-950 uppercase tracking-widest mr-2 text-[10px]">NOTICE:</strong> This document serves as legal proof of business registration within the United States. 
                           Any unauthorized duplication or alteration of this certificate is strictly prohibited under federal guidelines.
                           The holder of this license is authorized to perform activities described under the registered classification.
                        </p>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-8">
                            <div className="flex gap-10">
                                <span>REG-ID: {nodeId}</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={12} /> SECURED DOCUMENT</span>
                            </div>
                            <span className="text-slate-950 font-black">Page 1 OF 1 // {new Date().getFullYear()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terminal Controls */}
            <div className="mt-12 flex justify-center print:hidden">
                <Button 
                    onClick={handleDownload}
                    variant="outline"
                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-[24px] px-12 py-8 flex items-center gap-4 border border-white/10 transition-all font-black uppercase tracking-[0.3em] text-[11px] hover:scale-105 active:scale-95 shadow-2xl"
                >
                    <Download size={20} /> Save High-Fidelity Proof
                </Button>
            </div>
        </div>
    );
}
