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
            const html2canvas = (await import('html2canvas')).default;
            const jsPDFModule = await import('jspdf');
            const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

            const canvas = await html2canvas(certificateRef.current, {
                scale: 2.5, // Increased resolution
                useCORS: true,
                backgroundColor: '#fcfaf7',
                logging: false,
                width: 1000,
                onclone: (clonedDoc) => {
                    const clonedEl = clonedDoc.querySelector('[data-cert-container]');
                    if (clonedEl) {
                        const style = (clonedEl as HTMLElement).style;
                        style.width = '1000px';
                        style.minHeight = '1300px';
                        style.padding = '80px';
                        style.display = 'flex';
                        style.flexDirection = 'column';
                        style.boxShadow = 'none';
                    }
                }
            });
            
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdfWidth = canvas.width / 2.5;
            const pdfHeight = canvas.height / 2.5;

            // Updated constructor for universal compatibility
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [pdfWidth, pdfHeight]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate_${(platformName || 'CAPTIV8').replace(/[^a-z0-9]/gi, '_')}_Business_License.pdf`);
            toast.success('Certificate synchronization complete - Document downloaded.', { id: internalToastId });
        } catch (error: any) {
            console.error('PDF export failed:', error);
            console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                name: error?.name
            });
            toast.error(`PDF generation failed: ${error?.message || 'Unknown error'}`, { id: internalToastId });
        }
    };

    const handlePrint = async () => {
        if (!certificateRef.current) return;
        const internalToastId = toast.loading('Preparing document for institutional printing...');
        
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2.5,
                useCORS: true,
                backgroundColor: '#fcfaf7',
                logging: false,
                width: 1000,
                onclone: (clonedDoc) => {
                    const clonedEl = clonedDoc.querySelector('[data-cert-container]');
                    if (clonedEl) {
                        const style = (clonedEl as HTMLElement).style;
                        style.width = '1000px';
                        style.minHeight = '1300px';
                        style.padding = '80px';
                        style.display = 'flex';
                        style.flexDirection = 'column';
                        style.boxShadow = 'none';
                    }
                }
            });
            const imgData = canvas.toDataURL('image/png', 1.0);
            const printWindow = window.open('', '_blank');
            
            if (!printWindow) {
                toast.error('Print protocol blocked by browser. Please allow popups for this site.', { id: internalToastId });
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html><html><head>
                <title>Registry Certificate - ${platformName || 'CAPTIV8'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { background: white; display: flex; justify-content: center; }
                    img { width: 100%; height: auto; max-width: 800px; }
                    @media print {
                        @page { size: letter portrait; margin: 0; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
                </head><body>
                <img src="${imgData}" />
                <script>
                    window.onload = () => {
                        window.focus();
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
                </body></html>
            `);
            printWindow.document.close();
            toast.success('Print sequence initiated.', { id: internalToastId });
        } catch (error) {
            console.error('Print failed:', error);
            toast.error('Print sequence failed. Please retry.', { id: internalToastId });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-2 md:p-8">
            <div 
                ref={certificateRef}
                data-cert-container="true"
                className="relative bg-[#fcfaf7] text-slate-900 shadow-[20px_20px_60px_rgba(0,0,0,0.05)] p-8 md:p-20 font-serif border-[1px] border-slate-200 print:border-0 print:shadow-none overflow-hidden min-h-[900px] md:min-h-[1050px] print:min-h-0 print:h-[10in] print:w-[8in] flex flex-col rounded-sm transition-all"
            >
                {/* Decorative Frame */}
                <div className="absolute inset-2 md:inset-4 border border-slate-300 pointer-events-none" />
                <div className="absolute inset-4 md:inset-6 border-4 border-double border-slate-200 pointer-events-none" />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900 pb-8 md:pb-10 mb-8 md:mb-12 gap-8 relative z-10">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-full flex items-center justify-center text-white">
                                <ShieldCheck size={24} className="md:w-[28px] md:h-[28px]" />
                            </div>
                            <h2 className="text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">Official Certification</h2>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-950 uppercase mb-4 leading-tight md:leading-none text-balance">{platformName || 'CAPTIV8 OPERATIONS INC'}</h1>
                        <div className="flex gap-6 md:gap-8 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            <div>
                                <p className="mb-1 text-slate-400">Date Issued</p>
                                <p className="text-slate-900">{date}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-slate-400">Status</p>
                                <p className="text-emerald-600">Active / Valid</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-left md:text-right flex flex-col items-start md:items-end w-full md:w-auto">
                        <div className="bg-slate-950 text-white px-6 md:px-8 py-3 md:py-4 mb-4 md:mb-6 inline-block font-sans font-black uppercase tracking-[0.25em] text-[10px] md:text-xs">
                            Master Business License
                        </div>
                        <p className="text-base md:text-lg font-black text-slate-950 tracking-tighter">BN: 753-318-302-US</p>
                        <p className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-widest mt-1">Verification Code: LVL-882-X9</p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="space-y-8 md:space-y-10 text-[13px] md:text-[14px] font-sans leading-relaxed relative flex-1 text-slate-700">
                    {/* Authentic Watermark Overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.04] mix-blend-multiply flex flex-col justify-center items-center select-none">
                        <div className="rotate-[-35deg] scale-[1.5] w-[200%] h-[200%] flex flex-col gap-10 md:gap-12 whitespace-nowrap items-center justify-center">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className={`flex gap-10 md:gap-12 text-3xl md:text-5xl font-black uppercase tracking-[0.8em] ${i % 2 === 0 ? '-ml-24' : 'ml-24'}`}>
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
                                <h3 className="font-bold underline uppercase mb-3 text-[10px] md:text-[11px] tracking-widest text-slate-950">Business Name and Mailing Address:</h3>
                                <p className="font-black text-slate-900 text-lg md:text-xl uppercase leading-tight mb-1">{platformName || 'CAPTIV8 OPERATIONS INC'}</p>
                                <p className="text-slate-600 font-bold leading-relaxed pr-6 md:pr-10 text-[11px] md:text-sm">{platformAddress || '250 Schoolhouse Street, Coquitlam, BC, Canada'}</p>
                            </div>

                            <div className="bg-slate-50/80 p-5 md:p-6 border-l-4 border-slate-900">
                                <h3 className="font-bold underline uppercase mb-3 text-[10px] md:text-[11px] tracking-widest text-slate-950">Incorporation Status:</h3>
                                <p className="font-black uppercase tracking-wide text-slate-950 text-lg md:text-xl underline decoration-slate-300 underline-offset-4">ACTIVE IN GOOD STANDING</p>
                                <p className="text-slate-400 font-mono text-[9px] md:text-[10px] mt-2 tracking-widest font-bold">REGISTRY PROTOCOL-ID: {nodeId}</p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between items-start md:items-end gap-10">
                            {/* Blue Stamp Mimic */}
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-[6px] md:border-[8px] border-blue-900/10 flex flex-col items-center justify-center p-3 md:p-4 rotate-[-12deg] relative bg-blue-50/20 backdrop-blur-[2px] shadow-inner self-center md:self-auto transition-transform hover:rotate-0 duration-700">
                                <div className="absolute inset-1 md:inset-2 border-2 border-dashed border-blue-900/20 rounded-full animate-[spin_30s_linear_infinite]" />
                                <div className="absolute inset-3 md:inset-4 border border-blue-900/10 rounded-full" />
                                <span className="text-[7px] md:text-[9px] font-black text-blue-900/50 uppercase tracking-tighter text-center px-4 leading-tight mb-2 relative z-10">OFFICIAL SEAL OF<br/>{platformName || 'CAPTIV8'}</span>
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-900/5 rounded-full flex items-center justify-center border border-blue-900/10 my-1 shadow-sm relative z-10">
                                    <ShieldCheck className="text-blue-900/30 w-10 h-10 md:w-[50px] md:h-[50px]" />
                                </div>
                                <span className="text-[9px] md:text-[11px] font-black text-blue-800/40 tracking-[0.4em] md:tracking-[0.6em] mt-2 italic relative z-10">US AUTHENTIC</span>
                            </div>

                            <div className="text-left md:text-right w-full mt-4 md:mt-24">
                                <h3 className="font-bold underline uppercase mb-3 text-[10px] md:text-[11px] tracking-widest text-slate-950">Type of Legal Entity:</h3>
                                <p className="font-black text-slate-900 uppercase text-xl md:text-2xl tracking-tighter underline decoration-slate-300 underline-offset-4">GENERAL PARTNERSHIP</p>
                                <p className="text-[9px] md:text-[10px] text-slate-500 mt-3 italic font-bold tracking-tight max-w-[200px] md:ml-auto">(Authorized federal partnership registered under US commerce guidelines)</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 md:pt-10 border-t-2 border-slate-100">
                        <h3 className="font-bold underline uppercase mb-4 md:mb-6 text-[10px] md:text-[11px] tracking-widest text-slate-950">Business Information:</h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr className="text-[8px] md:text-[10px] items-center font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                                        <th className="px-4 md:px-6 py-4">Classification</th>
                                        <th className="px-4 md:px-6 py-4">Registry</th>
                                        <th className="px-4 md:px-6 py-4">Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic">
                                    <tr className="bg-white">
                                        <td className="px-4 md:px-6 py-4 md:py-6 font-black uppercase text-slate-950 text-[10px] md:text-xs">BUSINESS NAME REGISTRATION</td>
                                        <td className="px-4 md:px-6 py-4 md:py-6 font-mono font-black text-slate-800 text-sm md:text-lg">9451838</td>
                                        <td className="px-4 md:px-6 py-4 md:py-6 font-bold text-slate-700 text-[10px] md:text-sm">Influencer marketing technology.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-12 mt-10 md:mt-16 items-start md:items-end pt-8 md:pt-12 border-t-2 border-slate-100">
                        <div className="w-full">
                            <h3 className="font-bold underline uppercase mb-12 md:mb-8 text-[11px] tracking-widest text-slate-950">Authorized Signature:</h3>
                            <div className="relative group">
                                <div className="absolute -top-12 md:-top-14 left-0 font-signature text-3xl md:text-5xl text-slate-800/80 select-none pointer-events-none transform -rotate-2 italic drop-shadow-sm">
                                    {platformName || 'Captiv8 Operations'}
                                </div>
                                <div className="border-b-2 border-slate-900 pb-2 w-full md:w-72" />
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">Institutional Registrar</p>
                            </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end w-full">
                             <div className="w-16 h-16 md:w-24 md:h-24 border-2 border-slate-200 p-1 md:p-2 bg-white flex items-center justify-center opacity-80 shadow-sm">
                                <div className="grid grid-cols-4 gap-0.5 md:gap-1 w-full h-full opacity-20">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div key={i} className={`bg-black ${i % 3 === 0 ? 'opacity-100' : 'opacity-40'}`} />
                                    ))}
                                </div>
                             </div>
                             <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0 md:mt-4">Digital Auth QR</p>
                        </div>
                    </div>

                    <div className="pt-10 md:pt-12 text-[10px] md:text-[11px] text-slate-500 leading-relaxed font-sans mb-0">
                        <p className="mb-4 text-slate-600 font-medium">
                           <strong className="text-slate-950 uppercase tracking-widest mr-2 text-[10px]">NOTICE:</strong> This document serves as legal proof of business registration. 
                           Any unauthorized duplication or alteration is strictly prohibited.
                        </p>
                        <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6 md:mt-8">
                            <div className="flex flex-col md:flex-row gap-4 md:gap-10">
                                <span>REG-ID: {nodeId}</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={10} /> SECURED DOCUMENT</span>
                            </div>
                            <span className="text-slate-950 font-black">Page 1 OF 1 // {new Date().getFullYear()}</span>
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
