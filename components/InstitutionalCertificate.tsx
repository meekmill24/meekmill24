'use client';

import React from 'react';
import { ShieldCheck, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CertificateProps {
    date: string;
    nodeId: string;
    platformName?: string;
    platformAddress?: string;
}

export default function InstitutionalCertificate({ date, nodeId, platformName, platformAddress }: CertificateProps) {
    const certificateRef = React.useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        const internalToastId = toast.loading('Synchronizing registry data and generating high-fidelity PDF...');
        
        try {
            if (!(window as any).htmlToImage) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
                document.head.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }

            const htmlToImage = (window as any).htmlToImage;
            const imgData = await htmlToImage.toPng(certificateRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                skipFonts: true, 
                style: {
                    transform: 'scale(1)',
                }
            });

            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'letter'
            });
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
            pdf.save(`Certificate_\${(platformName || 'CAPTIV8').replace(/[^a-z0-9]/gi, '_')}_Business_License.pdf`);
            toast.success('Certificate synchronization complete.', { id: internalToastId });
        } catch (error) {
            console.error('PDF export failed:', error);
            toast.error('Registry link interrupted. Please retry.', { id: internalToastId });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-2 md:p-8">
            {/* Native Print Styles - Single Page Hard Lock */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: letter portrait;
                        margin: 0;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100% !important;
                        width: 100% !important;
                        overflow: hidden !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Global hide ALL site elements by default */
                    body * { visibility: hidden !important; }
                    /* Local reveal of certificate and ITS entire parent branch */
                    [data-cert-container="true"], 
                    [data-cert-container="true"] *,
                    main,
                    main *,
                    #__next,
                    #__next * { 
                        visibility: visible !important; 
                    }
                    /* Re-hide ANY other siblings of main/next that were revealed */
                    header, nav, footer, aside, .print\\:hidden {
                        display: none !important;
                        visibility: hidden !important;
                    }
                    [data-cert-container="true"] {
                        visibility: visible !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-height: 100vh !important;
                        margin: 0 !important;
                        padding: 30px !important;
                        border: 0 !important;
                        box-shadow: none !important;
                        background: #fcfaf7 !important;
                        overflow: hidden !important;
                        display: flex !important;
                        flex-direction: column !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                        page-break-inside: avoid !important;
                        z-index: 999999 !important;
                    }
                }
            `}</style>

            <div 
                ref={certificateRef}
                data-cert-container="true"
                className="relative bg-[#fcfaf7] text-slate-900 shadow-[0_30px_70px_rgba(0,0,0,0.1)] p-6 md:p-10 font-serif border border-slate-200 overflow-hidden min-h-[850px] flex flex-col rounded-sm transition-all scale-[0.98] origin-top"
            >
                {/* Decorative Frame */}
                <div className="absolute inset-4 border border-slate-300 pointer-events-none" />
                <div className="absolute inset-6 border-4 border-double border-slate-100 pointer-events-none" />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-[#0f172a] pb-4 md:pb-6 mb-6 md:mb-8 gap-4 relative z-10">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#020617] rounded-full flex items-center justify-center text-white">
                                <ShieldCheck size={24} className="md:w-[28px] md:h-[28px]" />
                            </div>
                            <h2 className="text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase text-[#64748b]">Official Certification</h2>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#020617] uppercase mb-4 leading-none">{platformName || 'CAPTIV8.'}</h1>
                        <div className="flex gap-6 md:gap-8 text-[10px] md:text-[11px] font-bold text-[#64748b] uppercase tracking-widest">
                            <div>
                                <p className="mb-1 text-[#94a3b8]">Date Issued</p>
                                <p className="text-[#020617]">{date}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-[#94a3b8]">Status</p>
                                <p className="text-[#059669]">Active / Valid</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-left md:text-right flex flex-col items-start md:items-end w-full md:w-auto">
                        <div className="bg-[#020617] text-white px-6 md:px-8 py-3 mb-4 inline-block font-black uppercase tracking-[0.25em] text-[10px] md:text-xs">
                            MASTER BUSINESS LICENSE
                        </div>
                        <p className="text-base md:text-lg font-black text-[#020617] tracking-tighter">BN: 753-318-302-US</p>
                        <p className="text-[8px] md:text-[9px] text-[#94a3b8] uppercase tracking-widest mt-1">Verification Code: LVL-882-X9</p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="space-y-6 md:space-y-8 text-[13px] md:text-[14px] font-sans leading-relaxed relative flex-1 text-[#334155]">
                    {/* Authentic Watermark Overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.04] mix-blend-multiply flex flex-col justify-center items-center select-none">
                        <div className="rotate-[-35deg] scale-[1.5] w-[200%] h-[200%] flex flex-col gap-10 md:gap-12 whitespace-nowrap items-center justify-center">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className={`flex gap-10 md:gap-12 text-3xl md:text-5xl font-black uppercase tracking-[0.8em] \${i % 2 === 0 ? '-ml-24' : 'ml-24'}`}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <span key={j} className="flex items-center gap-4">
                                            <ShieldCheck size={30} className="md:w-[40px] md:h-[40px]" />
                                            OFFICIAL CERTIFIED
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 relative z-10">
                        <div className="space-y-8 md:space-y-8">
                             <div>
                                <h3 className="font-bold underline uppercase mb-3 text-[10px] md:text-[11px] tracking-widest text-[#020617]">Business Name and Mailing Address:</h3>
                                <p className="font-black text-[#020617] text-xl md:text-2xl uppercase leading-none mb-1">{platformName || 'CAPTIV8.'}</p>
                                <p className="text-[#334155] font-bold leading-relaxed pr-6 md:pr-10 text-[11px] md:text-sm">{platformAddress || '250 S B St #1, San Mateo, CA 94401, United States'}</p>
                            </div>

                            <div className="bg-[#f8fafc]/80 p-5 md:p-6 border-l-4 border-[#020617]">
                                <h3 className="font-bold underline uppercase mb-3 text-[10px] md:text-[11px] tracking-widest text-[#020617]">Incorporation Status:</h3>
                                <p className="font-black uppercase tracking-wide text-[#020617] text-lg md:text-xl underline decoration-[#e2e8f0] underline-offset-4">ACTIVE IN GOOD STANDING</p>
                                <p className="text-[#94a3b8] font-mono text-[9px] md:text-[10px] mt-2 tracking-widest font-bold">REGISTRY PROTOCOL-ID: {nodeId}</p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between items-start md:items-end gap-10">
                            {/* Blue Stamp Mimic */}
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-[6px] md:border-[8px] border-[#1e3a8a]/10 flex flex-col items-center justify-center p-3 md:p-4 rotate-[-12deg] relative bg-[#eff6ff]/20 backdrop-blur-[2px] shadow-inner self-center md:self-auto transition-transform hover:rotate-0 duration-700">
                                <div className="absolute inset-1 md:inset-2 border-2 border-dashed border-[#1e3a8a]/20 rounded-full animate-[spin_30s_linear_infinite]" />
                                <div className="absolute inset-3 md:inset-4 border border-[#1e3a8a]/10 rounded-full" />
                                <span className="text-[7px] md:text-[9px] font-black text-[#1e3a8a]/50 uppercase tracking-tighter text-center px-4 leading-tight mb-2 relative z-10">OFFICIAL SEAL OF<br/>{platformName || 'CAPTIV8'}</span>
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-[#1e3a8a]/5 rounded-full flex items-center justify-center border border-[#1e3a8a]/10 my-1 shadow-sm relative z-10">
                                    <ShieldCheck className="text-[#1e3a8a]/30 w-10 h-10 md:w-[50px] md:h-[50px]" />
                                </div>
                                <span className="text-[9px] md:text-[11px] font-black text-[#1e40af]/40 tracking-[0.4em] md:tracking-[0.6em] mt-2 italic relative z-10">US AUTHENTIC</span>
                            </div>

                            <div className="text-left md:text-right w-full mt-4 md:mt-24">
                                <h3 className="font-bold underline uppercase mb-3 text-[10px] md:text-[11px] tracking-widest text-[#020617]">Type of Legal Entity:</h3>
                                <p className="font-black text-[#020617] uppercase text-xl md:text-2xl tracking-tighter underline decoration-[#e2e8f0] underline-offset-4">GENERAL PARTNERSHIP</p>
                                <p className="text-[9px] md:text-[10px] text-[#64748b] mt-3 italic font-bold tracking-tight max-w-[200px] md:ml-auto">(Authorized federal partnership registered under US commerce guidelines)</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 md:pt-8 border-t-2 border-[#f1f5f9]">
                        <h3 className="font-bold underline uppercase mb-4 md:mb-6 text-[10px] md:text-[11px] tracking-widest text-[#020617]">Business Information:</h3>
                        <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc]">
                                    <tr className="text-[8px] md:text-[10px] items-center font-black uppercase tracking-widest text-[#64748b] border-b border-[#e2e8f0]">
                                        <th className="px-4 md:px-6 py-4">Classification</th>
                                        <th className="px-4 md:px-6 py-4">Registry</th>
                                        <th className="px-4 md:px-6 py-4">Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1f5f9] italic">
                                    <tr className="bg-white">
                                        <td className="px-4 md:px-6 py-4 md:py-6 font-black uppercase text-[#020617] text-[10px] md:text-xs">BUSINESS NAME REGISTRATION</td>
                                        <td className="px-4 md:px-6 py-4 md:py-6 font-mono font-black text-[#1e293b] text-sm md:text-lg">{platformName?.toUpperCase().split(' ')[0] || 'CAPTIV8'}</td>
                                        <td className="px-4 md:px-6 py-4 md:py-6 font-bold text-[#334155] text-[10px] md:text-sm">Influencer marketing technology.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-10 mt-8 md:mt-12 items-start md:items-end pt-6 md:pt-10 border-t-2 border-[#f1f5f9]">
                        <div className="w-full">
                            <h3 className="font-bold underline uppercase mb-12 md:mb-8 text-[11px] tracking-widest text-[#020617]">Authorized Signature:</h3>
                            <div className="relative group">
                                <div className="absolute -top-12 md:-top-14 left-0 font-signature text-3xl md:text-5xl text-[#1e293b]/80 select-none pointer-events-none transform -rotate-2 italic drop-shadow-sm">
                                    Krishna Subramanian
                                </div>
                                <div className="border-b-2 border-[#020617] pb-2 w-full md:w-72" />
                                <p className="text-[9px] md:text-[10px] font-black text-[#94a3b8] mt-2 uppercase tracking-[0.3em]">Authorized Registrar // K. Subramanian</p>
                            </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end w-full">
                             <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-[#e2e8f0] p-1 md:p-2 bg-white flex items-center justify-center opacity-80 shadow-sm">
                                <div className="grid grid-cols-4 gap-0.5 md:gap-1 w-full h-full opacity-20">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div key={i} className={`bg-black \${i % 3 === 0 ? 'opacity-100' : 'opacity-40'}`} />
                                    ))}
                                </div>
                             </div>
                             <p className="text-[7px] md:text-[8px] font-black text-[#64748b] uppercase tracking-widest mt-0 md:mt-2">Digital Auth QR</p>
                        </div>
                    </div>

                    <div className="pt-6 md:pt-8 text-[10px] md:text-[11px] text-[#64748b] leading-relaxed font-sans mb-0">
                        <p className="mb-4 text-[#475569] font-medium text-[10px]">
                           <strong className="text-[#020617] uppercase tracking-widest mr-2 text-[10px]">NOTICE:</strong> This document serves as legal proof of business registration. 
                           Any unauthorized duplication or alteration is strictly prohibited.
                        </p>
                        <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mt-6 md:mt-8">
                            <div className="flex flex-col md:flex-row gap-4 md:gap-10">
                                <span>REG-ID: {nodeId}</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={10} /> SECURED DOCUMENT</span>
                            </div>
                            <span className="text-[#020617] font-black">Page 1 OF 1 // 2021</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Terminal Controls */}
            <div className="mt-10 md:mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                    onClick={handleDownload}
                    variant="outline"
                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-[24px] px-8 md:px-12 py-7 md:py-8 flex items-center gap-4 border border-white/10 transition-all font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[11px] hover:scale-105 active:scale-95 shadow-2xl w-full sm:w-auto"
                >
                    <Download size={20} /> Save as PDF
                </Button>
                <Button 
                    onClick={handlePrint}
                    variant="outline"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-[24px] px-8 md:px-12 py-7 md:py-8 flex items-center gap-4 border border-white/10 transition-all font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[11px] hover:scale-105 active:scale-95 shadow-2xl w-full sm:w-auto"
                >
                    <Printer size={20} /> Print Certificate
                </Button>
            </div>
        </div>
    );
}
