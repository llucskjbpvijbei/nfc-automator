'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Wifi, Globe, Type, Trash2, SmartphoneNfc, Scan, Contact, Navigation } from 'lucide-react';
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

  // Specific form states for complex types
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
      case 'url': return <Globe className="w-5 h-5 text-primary-foreground" />;
      case 'text': return <Type className="w-5 h-5 text-accent-foreground" />;
      case 'wifi': return <Wifi className="w-5 h-5 text-blue-500" />;
      case 'vcard': return <Contact className="w-5 h-5 text-orange-500" />;
      case 'app_intent': return <Navigation className="w-5 h-5 text-green-500" />;
      default: return <Zap className="w-5 h-5 text-secondary-foreground" />;
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="max-w-3xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-foreground to-accent-foreground">
            NFC Automator
          </h1>
          <p className="mt-2 text-muted-foreground">Gestiona les teves etiquetes intel·ligents</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsReading(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-xl bg-card text-foreground hover:bg-secondary"
          >
            <Scan className="w-4 h-4" />
            Llegir
          </button>
          <button
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            Nova Etiqueta
          </button>
        </div>
      </header>

      {!isCreating && <TemplatesGallery onSelectTemplate={loadTemplate} />}

      <AnimatePresence mode="popLayout">
        {isCreating && (
          <motion.form
            initial={{ opacity: 0, height: 0, mb: 0 }}
            animate={{ opacity: 1, height: 'auto', mb: 32 }}
            exit={{ opacity: 0, height: 0, mb: 0 }}
            className="overflow-hidden"
            onSubmit={handleCreate}
          >
            <div className="p-6 border bg-card/50 backdrop-blur-xl border-border/50 rounded-2xl shadow-xl">
              <h2 className="mb-4 text-lg font-semibold">Crear Automatització</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-muted-foreground">Nom descriptiu</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Encendre llums menjador"
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-muted-foreground">Tipus d'acció</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as Automation['type'])}
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="url">Web / Webhook (URL)</option>
                    <option value="text">Text simple</option>
                    <option value="wifi">Xarxa Wi-Fi</option>
                    <option value="vcard">Targeta de Contacte (vCard)</option>
                    <option value="app_intent">Obrir App (Intent/URI)</option>
                  </select>
                </div>

                {type === 'wifi' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-muted-foreground">Nom xarxa (SSID)</label>
                      <input type="text" required value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-xl" />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-muted-foreground">Contrasenya</label>
                      <input type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-xl" />
                    </div>
                  </div>
                ) : type === 'vcard' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1.5 text-sm font-medium text-muted-foreground">Nom complet</label>
                      <input type="text" required value={vcardName} onChange={(e) => setVcardName(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-muted-foreground">Telèfon</label>
                        <input type="tel" value={vcardTel} onChange={(e) => setVcardTel(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-xl" />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-muted-foreground">Correu electrònic</label>
                        <input type="email" value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-xl" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-muted-foreground">
                      {type === 'url' ? 'URL' : type === 'app_intent' ? 'URI de l\'App (ex: spotify://)' : 'Text'}
                    </label>
                    <input
                      type={type === 'url' ? 'url' : 'text'}
                      required
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      placeholder={type === 'url' ? 'https://...' : '...'}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium transition-colors rounded-xl text-muted-foreground hover:bg-secondary"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium transition-colors rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Guardar
                </button>
              </div>
            </div>
          </motion.form>
        )}

        <div className="space-y-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Les teves Etiquetes</h3>
          {automations.length === 0 && !isCreating ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-3xl border-border/60 bg-card/30"
            >
              <div className="p-4 mb-4 rounded-full bg-secondary">
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-foreground">Cap automatització</h3>
              <p className="text-muted-foreground">Crea la teva primera etiqueta per començar.</p>
            </motion.div>
          ) : (
            automations.map((auto) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={auto.id}
                className="flex flex-col gap-4 p-4 transition-colors border sm:items-center sm:flex-row sm:justify-between group bg-card hover:bg-secondary/50 border-border/50 rounded-2xl"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3 bg-background rounded-xl border border-border/50 shadow-inner flex-shrink-0">
                    {getIcon(auto.type)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-medium truncate">{auto.name}</h3>
                    <p className="text-sm truncate text-muted-foreground">
                      {auto.type === 'wifi' ? 'Dades Wi-Fi' : auto.type === 'vcard' ? 'Contacte' : auto.payload}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedAuto(auto)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-primary/20 text-primary-foreground hover:bg-primary/30 rounded-xl"
                  >
                    <SmartphoneNfc className="w-4 h-4" />
                    <span className="hidden sm:inline">Gravar a NFC</span>
                  </button>
                  <button
                    onClick={() => deleteAutomation(auto.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>

      <ActivityLog logs={logs} />

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
    </main>
  );
}
