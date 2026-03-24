'use client'; 
import { useState, useEffect } from 'react'; 
import { supabase } from '@/lib/supabase'; 
import { Settings, Globe, DollarSign, Palette, Save, Loader2, CheckCircle2, X, Plus, ShieldCheck, CreditCard, Layout, UserPlus, Wallet } from 'lucide-react'; 
import { toast } from 'sonner';

export default function AdminSettingsPage() { 
  const [settings, setSettings] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false); 
  const [success, setSuccess] = useState(false); 
  const [provisioningKeys, setProvisioningKeys] = useState<Record<string, boolean>>({});

  useEffect(() => { 
    fetchSettings(); 
  }, []); 

  const fetchSettings = async () => { 
    setLoading(true); 
    const { data } = await supabase.from('site_settings').select('*').order('key'); 
    if (data) setSettings(data); 
    setLoading(false); 
  }; 

  const handleUpdate = (key: string, value: any) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async () => { 
    setSaving(true); 
    try { 
      // Call the API endpoint which uses service role
      await Promise.all(settings.map(s => 
        fetch('/api/admin/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: s.key, value: s.value })
        }).then(res => res.json().then(data => { if (!res.ok) throw new Error(data.error); }))
      ));
      setSuccess(true); 
      setTimeout(() => setSuccess(false), 3000); 
    } catch (err: any) { 
      console.error(err);
      toast.error(err.message || 'Failed to recalibrate core preferences'); 
    } finally { 
      setSaving(false); 
    } 
  }; 

  if (loading && settings.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-bold tracking-widest uppercase text-xs">Loading core preferences...</p>
    </div>
  );

  return ( 
    <div className="space-y-8 animate-in fade-in duration-500 pb-10"> 
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"> 
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Configuration</h1> 
          <p className="text-slate-400 mt-1">Global site controls and financial parameters.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className={`
            flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all
            ${success ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-900/30'}
            ${saving ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
          `}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {success ? 'Configuration Saved' : 'Commit Changes'}
        </button> 
      </div> 

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> 
        <div className="space-y-8">
          {/* Site Status */}
          <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-bold text-white italic uppercase tracking-tight">Site Status</h3>
            </div>
            <div className="space-y-6">
              {[
                { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Lock the site for all users except admins', icon: ShieldCheck },
                { key: 'new_registrations_enabled', label: 'New Registrations', desc: 'Allow new user accounts to be created', icon: UserPlus },
                { key: 'deposits_enabled', label: 'System Deposits', desc: 'Enable top-up functionality for all users', icon: CreditCard },
                { key: 'withdrawals_enabled', label: 'System Withdrawals', desc: 'Enable payout requests for all users', icon: DollarSign },
              ].map((cfg) => {
                const item = settings.find(s => s.key === cfg.key);
                if (!item) return null;
                const isActive = item.value === 'true' || item.value === true;
                return (
                  <div key={cfg.key} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                    <div className="flex gap-4">
                      <div className={`p-2 rounded-xl h-fit ${isActive ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-600'}`}>
                        <cfg.icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{cfg.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{cfg.desc}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleUpdate(cfg.key, !isActive)}
                      className={`
                        w-12 h-6 rounded-full relative transition-all duration-300
                        ${isActive ? 'bg-purple-600 shadow-lg shadow-purple-900/20' : 'bg-slate-800'}
                      `}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isActive ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Localization & Finance */}
          <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-bold text-white italic uppercase tracking-tight">Localization & Finance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Default Platform Language</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium appearance-none"
                  value={settings.find(s => s.key === 'default_language')?.value || 'en'}
                  onChange={(e) => handleUpdate('default_language', e.target.value)}
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                  <option value="ru">Русский</option>
                  <option value="zh">中文 (Chinese)</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="ko">한국어 (Korean)</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="tr">Türkçe</option>
                  <option value="gh">Ghanaian (Ewe/Twi/Ga)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">Base Currency Package</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium appearance-none"
                  value={settings.find(s => s.key === 'default_currency')?.value || 'USD'}
                  onChange={(e) => handleUpdate('default_currency', e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="GHC">GHC (GH₵)</option>
                  <option value="AED">AED (Dh)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Branding */}
          <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                <Palette size={20} />
              </div>
              <h3 className="text-lg font-bold text-white italic uppercase tracking-tight">Visual Identity</h3>
            </div>
            <div className="space-y-6">
              {[
                { key: 'site_name', label: 'Platform Headline', placeholder: 'Captiv8' },
                { key: 'primary_color', label: 'Primary Brand Color', type: 'color' },
                { key: 'support_link', label: 'Support Telegram/URL', placeholder: 'https://t.me/...' },
              ].map((cfg) => {
                const item = settings.find(s => s.key === cfg.key);
                if (!item) return null;
                return (
                  <div key={cfg.key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">{cfg.label}</label>
                    {cfg.type === 'color' ? (
                      <div className="flex gap-3">
                        <input 
                          type="color" 
                          value={item.value} 
                          onChange={(e) => handleUpdate(cfg.key, e.target.value)}
                          className="w-16 h-12 bg-slate-950 border border-slate-800 rounded-2xl p-1 cursor-pointer"
                        />
                        <input 
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                          value={item.value}
                          onChange={(e) => handleUpdate(cfg.key, e.target.value)}
                        />
                      </div>
                    ) : (
                      <input 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                        value={item.value}
                        onChange={(e) => handleUpdate(cfg.key, e.target.value)}
                        placeholder={cfg.placeholder}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Financials */}
          <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <DollarSign size={20} />
              </div>
              <h3 className="text-lg font-bold text-white italic uppercase tracking-tight">Financial Parameters</h3>
            </div>
            <div className="space-y-6">
              {[
                { key: 'min_withdrawal', label: 'Minimum Withdrawal Amount ($)', type: 'number' },
                { key: 'min_deposit', label: 'Minimum Deposit Amount ($)', type: 'number' },
                { key: 'referral_commission_l1', label: 'L1 Referral Commission (%)', type: 'number' },
                { key: 'referral_commission_l2', label: 'L2 Referral Commission (%)', type: 'number' },
                { key: 'referral_commission_l3', label: 'L3 Referral Commission (%)', type: 'number' },
                { key: 'wallet_trc20', label: 'TRC20 Wallet Address', placeholder: 'T...' },
                { key: 'wallet_erc20', label: 'ERC20 Wallet Address', placeholder: '0x...' },
                { key: 'wallet_bep20', label: 'BEP20 Wallet Address', placeholder: '0x...' },
                { key: 'wallet_btc', label: 'BTC Wallet Address', placeholder: '1...' },
                { key: 'currency_symbol', label: 'Display Currency', placeholder: '$' },
              ].map((cfg) => {
                const item = settings.find(s => s.key === cfg.key);
                if (!item) return null;
                return (
                  <div key={cfg.key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">{cfg.label}</label>
                    <input 
                      type={cfg.type || 'text'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-bold text-lg"
                      value={item.value}
                      onChange={(e) => handleUpdate(cfg.key, e.target.value)}
                      placeholder={cfg.placeholder}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Operational Hub & Support */}
          <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-white italic uppercase tracking-tight">Operational Hub</h3>
            </div>
            <div className="space-y-6">
              {[
                { key: 'whatsapp_link', label: 'Priority WhatsApp Link', placeholder: 'https://wa.me/...' },
                { key: 'support_email', label: 'Support Email Address', placeholder: 'support@...' },
                { key: 'referral_commission_l1', label: 'Team Commission L1', placeholder: '16' },
                { key: 'referral_commission_l2', label: 'Team Commission L2', placeholder: '8' },
                { key: 'referral_commission_l3', label: 'Team Commission L3', placeholder: '4' },
                { key: 'platform_name', label: 'Company Name (Certificate)', placeholder: 'Captiv8 Operations Inc.' },
                { key: 'platform_address', label: 'Company Address (Certificate)', placeholder: '250 Schoolhouse Street, Coquitlam, BC, Canada' },
              ].map((cfg) => {
                const item = settings.find(s => s.key === cfg.key);
                if (!item) {
                    return (
                        <div key={cfg.key} className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{cfg.label} MISSING</span>
                                <span className="text-[9px] text-rose-500/60 font-medium italic mt-0.5">Deployment node disconnected</span>
                            </div>
                            <button 
                                onClick={async () => {
                                    setProvisioningKeys(prev => ({ ...prev, [cfg.key]: true }));
                                    try {
                                        const res = await fetch('/api/admin/site-settings', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ key: cfg.key, value: cfg.placeholder })
                                        });

                                        const data = await res.json();
                                        if (!res.ok) throw new Error(data.error || 'Identity Rejected');

                                        await fetchSettings();
                                        toast.success(`${cfg.label} synchronization established!`);
                                    } catch (err: any) {
                                        console.error(err);
                                        toast.error(`Provision failed: ${err.message}`);
                                    } finally {
                                        setProvisioningKeys(prev => ({ ...prev, [cfg.key]: false }));
                                    }
                                }}
                                disabled={provisioningKeys[cfg.key]}
                                className="px-6 py-2 bg-rose-600 text-white text-[10px] font-black rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/40 active:scale-95 uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                            >
                                {provisioningKeys[cfg.key] ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    'PROVISION'
                                )}
                            </button>
                        </div>
                    );
                }
                return (
                  <div key={cfg.key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1">{cfg.label}</label>
                    <input 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                      value={item.value}
                      onChange={(e) => handleUpdate(cfg.key, e.target.value)}
                      placeholder={cfg.placeholder}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div> 
    </div> 
  ); 
}
