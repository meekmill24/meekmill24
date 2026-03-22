'use client';

import { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    Upload, 
    Camera, 
    ChevronLeft, 
    CheckCircle2, 
    Clock, 
    AlertTriangle,
    FileText,
    Smartphone,
    CreditCard,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VerifyPage() {
    const router = useRouter();
    const { profile, refreshProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [docType, setDocType] = useState<'id' | 'passport' | 'license' | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [frontImg, setFrontImg] = useState<string | null>(null);
    const [backImg, setBackImg] = useState<string | null>(null);

    const verificationStatus = profile?.verification_status || 'unverified'; // unverified, pending, verified, rejected

    const handleUpload = async (side: 'front' | 'back') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            setIsUploading(true);
            const toastId = toast.loading(`Uploading ${side} of document...`);

            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${profile?.id}/${side}_${Date.now()}.${fileExt}`;
                const { data, error } = await supabase.storage
                    .from('verification-docs')
                    .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('verification-docs')
                    .getPublicUrl(fileName);

                if (side === 'front') setFrontImg(publicUrl);
                else setBackImg(publicUrl);

                toast.success(`${side.toUpperCase()} UPLOADED`, { id: toastId });
            } catch (err: any) {
                toast.error("Upload failed: " + err.message, { id: toastId });
            } finally {
                setIsUploading(false);
            }
        };
        input.click();
    };

    const handleSubmit = async () => {
        if (!frontImg) return toast.error("Front of ID required");
        if (docType !== 'passport' && !backImg) return toast.error("Back of ID required");

        setIsUploading(true);
        const toastId = toast.loading("Submitting for compliance review...");

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    verification_status: 'pending',
                    verification_doc_type: docType,
                    verification_front_url: frontImg,
                    verification_back_url: backImg,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile?.id);

            if (error) throw error;

            await refreshProfile();
            setStep(3);
            toast.success("APPLICATION SUBMITTED", { id: toastId });
        } catch (err: any) {
            toast.error("Submission failed: " + err.message, { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    if (verificationStatus === 'pending' || step === 3) {
        return (
            <div className="max-w-4xl mx-auto px-6 pt-20 pb-40 space-y-12 animate-in fade-in duration-1000">
                <div className="flex flex-col items-center text-center space-y-8">
                    <div className="w-32 h-32 rounded-full bg-indigo-500/10 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30 animate-[spin_10s_linear_infinite]" />
                        <Clock className="text-indigo-400 w-16 h-16 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tight">Compliance Review</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-md italic opacity-60">
                            Your identity node is currently being verified by our compliance team. Advanced security nodes will unlock automatically upon verification.
                        </p>
                    </div>
                    <button onClick={() => router.push('/app/profile')} className="px-10 py-4 bg-white text-black font-black uppercase text-xs rounded-2xl tracking-widest shadow-xl shadow-white/10 active:scale-95 transition-all">
                        Return to Hub
                    </button>
                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl max-w-xs">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Expected time: 2-4 Hours</p>
                    </div>
                </div>
            </div>
        );
    }

    if (verificationStatus === 'verified') {
        return (
            <div className="max-w-4xl mx-auto px-6 pt-20 pb-40 space-y-12 animate-in fade-in duration-700">
                <div className="flex flex-col items-center text-center space-y-8">
                    <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center relative">
                        <CheckCircle2 className="text-green-500 w-16 h-16" />
                        <div className="absolute -inset-4 bg-green-500/20 blur-[40px] rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tight">Protocol Verified</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed italic opacity-60">
                            Your corporate identity is officially confirmed. You now have full access to high-sequence security and capital settlement nodes.
                        </p>
                    </div>
                    <button onClick={() => router.push('/app/profile')} className="px-10 py-4 bg-green-500 text-black font-black uppercase text-xs rounded-2xl tracking-widest shadow-[0_10px_30px_rgba(34,197,94,0.3)] active:scale-95 transition-all">
                        HUB ACTIVE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 pb-40 space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <ChevronLeft size={20} className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight italic text-indigo-500">Identity Hub</h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-60">Compliance Verification</p>
                    </div>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between px-10 relative">
                <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-white/5 -translate-y-1/2" />
                {[1, 2].map((s) => (
                    <div key={s} className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step >= s ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-110' : 'bg-zinc-900 border border-white/5 text-zinc-700'}`}>
                        {step > s ? <CheckCircle2 size={20} /> : s}
                    </div>
                ))}
            </div>

            {step === 1 ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight italic">Select Document Protocol</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] italic opacity-60 italic">Please provide institutional-grade identification.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { id: 'id', label: 'Identity Card', icon: CreditCard, desc: 'National ID or Residence Card' },
                            { id: 'passport', label: 'Passport Node', icon: FileText, desc: 'International Travel Protocol' },
                            { id: 'license', label: 'Driver License', icon: Smartphone, desc: 'Regional Driver Authorization' }
                        ].map((doc) => (
                            <button 
                                key={doc.id}
                                onClick={() => { setDocType(doc.id as any); setStep(2); }}
                                className="group p-8 rounded-[40px] bg-zinc-900/40 border border-white/5 flex items-center justify-between hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all shadow-xl text-left"
                            >
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                                        <doc.icon size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white italic uppercase tracking-tight">{doc.label}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic opacity-50">{doc.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Node Digitization</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] italic opacity-60">Upload ultra-clear captures of your {docType?.toUpperCase()}.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Front Side */}
                        <div 
                            onClick={() => !isUploading && handleUpload('front')}
                            className={`group relative aspect-[3/2] rounded-[48px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${frontImg ? 'border-indigo-500/40' : 'border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5'}`}
                        >
                            {frontImg ? (
                                <img src={frontImg} className="w-full h-full object-cover animate-in zoom-in duration-500" alt="Front" />
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-700 group-hover:text-indigo-400 transition-all mb-4">
                                        <Camera size={32} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Front Capture</p>
                                </>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[10px] font-black uppercase text-white tracking-widest">{frontImg ? 'Change' : 'Tap to Upload'}</span>
                            </div>
                        </div>

                        {/* Back Side (Only if not passport) */}
                        {docType !== 'passport' && (
                            <div 
                                onClick={() => !isUploading && handleUpload('back')}
                                className={`group relative aspect-[3/2] rounded-[48px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${backImg ? 'border-indigo-500/40' : 'border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5'}`}
                            >
                                {backImg ? (
                                    <img src={backImg} className="w-full h-full object-cover animate-in zoom-in duration-500" alt="Back" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-700 group-hover:text-indigo-400 transition-all mb-4">
                                            <Camera size={32} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Back Capture</p>
                                    </>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">{backImg ? 'Change' : 'Tap to Upload'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 pt-10">
                        <button 
                            onClick={handleSubmit}
                            disabled={isUploading || !frontImg || (docType !== 'passport' && !backImg)}
                            className="w-full h-16 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-[32px] shadow-2xl hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                        >
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    <ShieldCheck size={18} /> INITIALIZE VERIFICATION
                                </>
                            )}
                        </button>
                        <button onClick={() => setStep(1)} className="w-full h-16 bg-white/5 text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] rounded-[32px] border border-white/5 hover:bg-white/10 transition-all">
                            Change Protocol
                        </button>
                    </div>

                    <div className="p-8 bg-indigo-500/5 rounded-[40px] border border-indigo-500/10 flex items-center gap-6">
                        <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.1em] leading-relaxed italic">
                            Verification is performed by our neural compliance engine. Ensure images are high-resolution with no glare. 100% data remains encrypted.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
