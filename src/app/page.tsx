'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutomations } from '@/hooks/useAutomations';
import { Automation } from '@/types';
import { NfcWriterModal } from '@/components/NfcWriterModal';
import { NfcReaderModal } from '@/components/NfcReaderModal';
import { TemplatesGallery } from '@/components/TemplatesGallery';
import { ActivityLog } from '@/components/ActivityLog';

export default function Home() {
  const { automations, logs, addAutomation, deleteAutomation, addLog, isLoaded } = useAutomations();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState<Automation | null>(null);
  const [isReading, setIsReading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Automation['type']>('url');
  const [payload, setPayload] = useState('');

  // Specific form states
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [vcardName, setVcardName] = useState('');
  const [vcardTel, setVcardTel] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    let finalPayload = payload;

    if (type === 'wifi') {
      finalPayload = JSON.stringify({ ssid: wifiSsid, password: wifiPass, encryption: wifiPass ? 'WPA' : 'nopass' });
    } else if (type === 'vcard') {
      finalPayload = `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nTEL:${vcardTel}\nEMAIL:${vcardEmail}\nEND:VCARD`;
    }

    if (!finalPayload) return;
    
    addAutomation({ name, type, payload: finalPayload });
    resetForm();
  };

  const resetForm = () => {
    setIsCreating(false);
    setName('');
    setPayload('');
    setWifiSsid('');
    setWifiPass('');
    setVcardName('');
    setVcardTel('');
    setVcardEmail('');
    setType('url');
  };

  const loadTemplate = (template: Partial<Automation>) => {
    setName(template.name || '');
    setType(template.type || 'url');
    setPayload(template.payload || '');
    
    if (template.type === 'wifi' && template.payload) {
      try {
        const parsed = JSON.parse(template.payload);
        setWifiSsid(parsed.ssid || '');
        setWifiPass(parsed.password || '');
      } catch (e) {}
    }
    setIsCreating(true);
  };

  const getIcon = (t: string) => {
    switch (t) {
      case 'url': return { icon: 'language', color: 'text-primary' };
      case 'text': return { icon: 'short_text', color: 'text-on-surface-variant' };
      case 'wifi': return { icon: 'wifi', color: 'text-primary' };
      case 'vcard': return { icon: 'person', color: 'text-secondary' };
      case 'app_intent': return { icon: 'app_shortcut', color: 'text-tertiary' };
      default: return { icon: 'bolt', color: 'text-on-surface' };
    }
  };

  if (!isLoaded) return null;

  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-surface/60 backdrop-blur-xl border-b border-primary/10 shadow-[0_0_30px_rgba(125,211,252,0.05)] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">nfc</span>
          <h1 className="text-lg font-headline font-bold tracking-wider text-on-surface">NFC Automator</h1>
        </div>
        <div className="w-10 h-10 rounded-full border border-primary/20 overflow-hidden bg-surface-container-high flex items-center justify-center text-primary font-bold">
          <span className="material-symbols-outlined">person</span>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-4xl mx-auto space-y-8 pb-32">
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Benvingut</h2>
            <p className="text-on-surface-variant font-medium">Gestiona les teves etiquetes intel·ligents</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setIsReading(true)}
              className="glass-card-elevated hover:bg-surface-container-high transition-all active:scale-95 flex flex-col items-center justify-center p-6 rounded-xl group"
            >
              <span className="material-symbols-outlined text-tertiary text-4xl mb-2 group-hover:scale-110 transition-transform">contactless</span>
              <span className="font-bold text-on-surface">Llegir</span>
            </button>
            <button 
              onClick={() => { resetForm(); setIsCreating(true); }}
              className="bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all active:scale-95 flex flex-col items-center justify-center p-6 rounded-xl group ice-glow"
            >
              <span className="material-symbols-outlined text-primary text-4xl mb-2 group-hover:scale-110 transition-transform">add_circle</span>
              <span className="font-bold text-primary">Nova Etiqueta</span>
            </button>
          </div>
        </section>

        <TemplatesGallery onSelectTemplate={loadTemplate} />

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70">Les meves etiquetes</h3>
          </div>
          
          <div className="space-y-3">
            {automations.length === 0 ? (
              <div className="glass-card p-8 rounded-xl text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">label_off</span>
                <p className="text-sm text-on-surface-variant">Cap etiqueta creada. Clica a Nova Etiqueta per començar.</p>
              </div>
            ) : (
              automations.map((auto) => {
                const { icon, color } = getIcon(auto.type);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={auto.id}
                    className="glass-card p-4 rounded-xl flex items-center gap-4 group hover:border-primary/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 border border-white/5">
                      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <h4 className="font-bold text-on-surface truncate">{auto.name}</h4>
                      <p className="text-xs text-on-surface-variant truncate">
                        {auto.type === 'wifi' ? 'Dades Wi-Fi' : auto.type === 'vcard' ? 'Contacte' : auto.payload}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedAuto(auto)}
                        className="bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                      >
                        Gravar NFC
                      </button>
                      <button
                        onClick={() => deleteAutomation(auto.id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        <ActivityLog logs={logs} />
      </main>

      {/* Creation Drawer */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={resetForm}
            />
            
            <motion.form 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onSubmit={handleCreate}
              className="glass-panel w-full max-w-2xl rounded-t-[2.5rem] p-8 md:p-12 space-y-8 relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full"></div>
              
              <header className="space-y-1">
                <h2 className="text-2xl font-headline font-semibold text-on-surface tracking-tight">Nova Etiqueta NFC</h2>
                <p className="text-on-surface-variant text-sm">Configura la teva etiqueta física amb una acció digital automatitzada.</p>
              </header>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-label font-semibold text-primary uppercase tracking-widest ml-1">Nom de l'etiqueta</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Wi-Fi Convidats"
                    className="glass-input w-full px-5 py-4 rounded-xl text-on-surface placeholder:text-on-surface-variant/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-label font-semibold text-primary uppercase tracking-widest ml-1">Tipus d'Acció</label>
                  <div className="relative group">
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as Automation['type'])}
                      className="glass-input w-full px-5 py-4 rounded-xl text-on-surface appearance-none cursor-pointer"
                    >
                      <option value="url">Web / URL</option>
                      <option value="text">Text</option>
                      <option value="wifi">Wi-Fi</option>
                      <option value="vcard">vCard (Contacte)</option>
                      <option value="app_intent">App Intent</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                </div>

                {type === 'wifi' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest ml-1">SSID / Xarxa</label>
                      <input required value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} type="text" className="glass-input w-full px-5 py-4 rounded-xl text-on-surface" placeholder="Nom de la xarxa"/>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest ml-1">Contrasenya</label>
                      <input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} type="text" className="glass-input w-full px-5 py-4 rounded-xl text-on-surface" placeholder="••••••••"/>
                    </div>
                  </div>
                ) : type === 'vcard' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest ml-1">Nom complet</label>
                      <input required value={vcardName} onChange={(e) => setVcardName(e.target.value)} type="text" className="glass-input w-full px-5 py-4 rounded-xl text-on-surface"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest ml-1">Telèfon</label>
                        <input value={vcardTel} onChange={(e) => setVcardTel(e.target.value)} type="tel" className="glass-input w-full px-5 py-4 rounded-xl text-on-surface"/>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest ml-1">Correu</label>
                        <input value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} type="email" className="glass-input w-full px-5 py-4 rounded-xl text-on-surface"/>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest ml-1">Contingut</label>
                    <input
                      required
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      type={type === 'url' ? 'url' : 'text'}
                      className="glass-input w-full px-5 py-4 rounded-xl text-on-surface"
                      placeholder={type === 'url' ? 'https://...' : '...'}
                    />
                  </div>
                )}
              </div>

              <footer className="flex flex-col-reverse md:flex-row gap-4 pt-4 pb-4">
                <button 
                  onClick={resetForm}
                  type="button" 
                  className="flex-1 px-8 py-4 rounded-xl font-semibold text-on-surface hover:bg-white/5 active:scale-95 transition-all duration-200"
                >
                  Cancel·lar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-8 py-4 rounded-xl font-semibold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 active:scale-95 transition-all duration-200 ice-glow"
                >
                  Guardar Etiqueta
                </button>
              </footer>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 w-full z-40 bg-surface-container/60 backdrop-blur-2xl border-t border-primary/15 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] rounded-t-xl flex justify-around items-center h-20 px-4 pb-safe">
        <button className="flex flex-col items-center justify-center text-primary/80 transition-transform">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-xs font-medium mt-1">Home</span>
        </button>
        <button onClick={() => { resetForm(); setIsCreating(true); }} className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-4 py-2 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">bolt</span>
          <span className="font-label text-xs font-medium">Automate</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary/80 transition-transform">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label text-xs font-medium mt-1">Config</span>
        </button>
      </nav>

      <NfcWriterModal
        isOpen={!!selectedAuto}
        onClose={() => setSelectedAuto(null)}
        automation={selectedAuto}
        onSuccessLog={() => {
          if (selectedAuto) addLog('escrit', selectedAuto.name);
        }}
      />

      <NfcReaderModal
        isOpen={isReading}
        onClose={() => setIsReading(false)}
        onSaveRead={(payload, type) => {
          addAutomation({ name: 'Lectura ' + new Date().toLocaleTimeString(), type, payload });
          addLog('llegit', 'Etiqueta escanejada');
        }}
      />
    </>
  );
}
