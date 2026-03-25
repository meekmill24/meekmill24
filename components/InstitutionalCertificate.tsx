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
        <div className="w-full max-w-4xl mx-auto">
            <div className="relative bg-white text-slate-900 shadow-2xl p-6 md:p-16 font-serif border-t-[12px] border-slate-900 print:shadow-none print:border-t-0 overflow-hidden min-h-[900px] flex flex-col">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900 pb-8 mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase mb-4">Ontario {platformName || 'SIMPLE OPERATIONS'}</h1>
                        <p className="text-sm font-bold text-slate-500 mb-1">Date Issued: {date}</p>
                        <p className="text-[10px] text-slate-400 font-medium">(yyyy-mm-dd)</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="bg-slate-200 px-6 py-3 mb-4 inline-block font-sans font-black uppercase tracking-[0.2em] text-sm border-2 border-slate-300">
                            Master Business License
                        </div>
                        <p className="text-base font-black text-slate-900">Business Number: 753318302</p>
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
                                <p className="text-slate-600 font-bold leading-relaxed pr-10">{platformAddress || "250 Schoolhouse Street, Coquitlam, British Columbia, Canada"}</p>
                            </div>

                            <div>
                                <h3 className="font-bold underline uppercase mb-3 text-[11px] tracking-widest text-slate-950">Business Address:</h3>
                                <p className="text-slate-600 font-bold leading-relaxed pr-10">{platformAddress || "250 Schoolhouse Street, Coquitlam, British Columbia, Canada"}</p>
                            </div>

                            <div className="bg-slate-50/50 p-6 border-l-4 border-slate-200">
                                <h3 className="font-bold underline uppercase mb-3 text-[11px] tracking-widest text-slate-950">Legal Name(s):</h3>
                                <p className="font-black uppercase tracking-wide text-slate-950 text-xl underline decoration-slate-300 underline-offset-4">AGENT @{username.toUpperCase()}</p>
                                <p className="text-slate-400 font-mono text-[10px] mt-2 tracking-widest font-bold">NODE PROTOCOL-ID: {nodeId}</p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between items-end">
                            {/* Blue Stamp Mimic */}
                            <div className="w-48 h-48 rounded-full border-[6px] border-blue-900/10 flex flex-col items-center justify-center p-4 rotate-[15deg] relative bg-blue-50/30 backdrop-blur-sm shadow-inner group">
                                <div className="absolute inset-2 border-2 border-dashed border-blue-900/10 rounded-full animate-spin-slow" />
                                <span className="text-[8px] font-black text-blue-900/40 uppercase tracking-tighter text-center px-4 leading-tight mb-1">{(platformName || 'SIMPLE OPERATIONS INC.').toUpperCase()}<br/>GOVERNMENT REGISTERED</span>
                                <div className="w-20 h-20 bg-blue-900/5 rounded-full flex items-center justify-center border border-blue-900/10 my-2 shadow-sm">
                                    <ShieldCheck className="text-blue-900/30" size={40} />
                                </div>
                                <span className="text-[10px] font-black text-blue-900/40 tracking-[0.5em] mt-1 italic">CANADA</span>
                            </div>

                            <div className="text-right w-full mt-16">
                                <h3 className="font-bold underline uppercase mb-3 text-[11px] tracking-widest text-slate-950">Type of Legal Entity:</h3>
                                <p className="font-black text-slate-950 uppercase text-lg tracking-tight underline decoration-slate-200">{level.toUpperCase()} PARTNERSHIP</p>
                                <p className="text-[10px] text-slate-500 mt-2 italic font-bold tracking-tight">(This business has registered partner(s) on this license)</p>
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
                                        <th className="px-6 py-4">Effective Date</th>
                                        <th className="px-4 py-4">Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic">
                                    <tr className="bg-white">
                                        <td className="px-6 py-6 font-black uppercase text-slate-950 text-basic">BUSINESS NAME REGISTRATION</td>
                                        <td className="px-6 py-6 font-mono font-black text-slate-800 text-lg">9451838</td>
                                        <td className="px-6 py-6 font-bold text-slate-700">{date}</td>
                                        <td className="px-4 py-6 font-bold text-slate-900">2027-01-21</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pt-24 text-[11px] text-slate-500 leading-relaxed font-sans mb-0">
                        <p className="border-t-2 border-slate-900 pt-8 mb-4 text-slate-600 font-medium">
                           <strong className="text-slate-950 uppercase tracking-widest mr-2 text-[10px]">To the Client:</strong> When the Master Business License is presented to any Ontario business program, you are not required to repeat information contained on this license. 
                           Each Ontario business program is required to accept this license when presented as part of its registration process.
                           If you have any questions about this Master Business License call the Service Ontario Contact Centre at 1-800-565-1921 or 1-416-314-9151 or TTY 1-416-326-8566.
                        </p>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-10">
                            <div className="flex gap-10">
                                <span>REG-ID: {nodeId}</span>
                                <span>SEC-ID: S-99221-X</span>
                            </div>
                            <span className="text-slate-950 font-black">Page 1 of 1</span>
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
