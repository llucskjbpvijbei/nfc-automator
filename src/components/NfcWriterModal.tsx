'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Automation } from '@/types';

interface NfcWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation: Automation | null;
  onSuccessLog?: () => void;
}

export function NfcWriterModal({ isOpen, onClose, automation, onSuccessLog }: NfcWriterModalProps) {
  const [status, setStatus] = useState<'idle' | 'writing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleWrite = async () => {
    if (!automation) return;

    if (!('NDEFReader' in window)) {
      setStatus('error');
      setErrorMessage('NFC no suportat en aquest navegador (Utilitza Android).');
      return;
    }

    try {
      setStatus('writing');
      // @ts-ignore
      const ndef = new window.NDEFReader();
      
      let records: any[] = [];
      
      if (automation.type === 'wifi') {
        try {
          const wifi = JSON.parse(automation.payload);
          const wifiString = `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`;
          records = [{ recordType: 'text', data: wifiString }];
        } catch (e) {
          throw new Error("Dades Wi-Fi mal formades.");
        }
      } else if (automation.type === 'vcard') {
        records = [{ recordType: 'mime', mediaType: 'text/vcard', data: new TextEncoder().encode(automation.payload) }];
      } else if (automation.type === 'url' || automation.type === 'app_intent') {
        records = [{ recordType: 'url', data: automation.payload }];
      } else {
        records = [{ recordType: 'text', data: automation.payload }];
      }

      await ndef.write({ records });
      
      if (onSuccessLog) onSuccessLog();
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || "Error a l'escriure a l'etiqueta NFC");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md h-[80vh] md:h-auto glass-panel rounded-t-3xl md:rounded-3xl p-8 flex flex-col items-center justify-between shadow-2xl overflow-hidden"
          >
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-tertiary/5 rounded-full blur-[80px]"></div>
            
            <div className="w-12 h-1 bg-on-surface-variant/20 rounded-full mb-8 md:hidden"></div>
            
            <div className="text-center space-y-2 z-10">
              <h3 className="text-2xl font-extrabold tracking-tight font-headline text-on-surface">
                {status === 'success' ? 'Èxit!' : status === 'error' ? 'Error' : 'Gravar Etiqueta'}
              </h3>
              <p className="text-on-surface-variant max-w-[280px] mx-auto text-sm leading-relaxed">
                {status === 'success' ? 'L\'etiqueta s\'ha gravat correctament.' : 
                 status === 'error' ? errorMessage :
                 `Apropa el telèfon per gravar: ${automation?.name}`}
              </p>
            </div>
            
            <div className="relative flex items-center justify-center w-64 h-64 z-10 my-4">
              {status === 'writing' && (
                <>
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full nfc-ring"></div>
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full nfc-ring nfc-ring-delay-1"></div>
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full nfc-ring nfc-ring-delay-2"></div>
                </>
              )}
              
              <div className={`relative p-8 rounded-full border shadow-[0_0_50px_rgba(125,211,252,0.15)] flex flex-col items-center gap-2 transition-transform duration-500 hover:scale-105 ${status === 'error' ? 'bg-error-container border-error/30' : status === 'success' ? 'bg-primary/20 border-primary/50' : 'bg-surface-container-highest/80 border-primary/30'}`}>
                <span className={`material-symbols-outlined text-7xl ${status === 'error' ? 'text-error' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {status === 'success' ? 'check_circle' : status === 'error' ? 'error' : 'nfc'}
                </span>
                {status === 'writing' && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-primary/60 rounded-full animate-pulse [animation-delay:200ms]"></div>
                    <div className="w-1 h-1 bg-primary/30 rounded-full animate-pulse [animation-delay:400ms]"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full space-y-4 z-10">
              {status === 'idle' ? (
                <button
                  onClick={handleWrite}
                  className="w-full py-4 px-6 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold tracking-wide active:scale-95 transition-all hover:bg-primary/20 ice-glow"
                >
                  Començar a Gravar
                </button>
              ) : status === 'error' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (!automation) return;
                      let copyText = automation.payload;
                      if (automation.type === 'wifi') {
                        try {
                          const wifi = JSON.parse(automation.payload);
                          copyText = `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`;
                        } catch (e) {}
                      }
                      navigator.clipboard.writeText(copyText);
                      alert('Dades copiades al porta-retalls! Ara enganxa-les a NFC Tools.');
                    }}
                    className="w-full py-4 px-6 bg-surface-container border border-white/5 rounded-xl text-on-surface font-bold tracking-wide active:scale-95 transition-all hover:bg-surface-container-highest flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                    Copiar Dades (Per a iOS)
                  </button>
                  <button
                    onClick={() => setStatus('idle')}
                    className="w-full py-4 px-6 bg-error/10 border border-error/20 rounded-xl text-error font-bold tracking-wide active:scale-95 transition-all hover:bg-error/20"
                  >
                    Tornar a intentar
                  </button>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-4 px-6 bg-primary/20 border border-primary/30 rounded-xl text-on-surface font-bold tracking-wide active:scale-95 transition-all hover:bg-primary/30"
                >
                  Tancar
                </button>
              )}
              {status === 'idle' && (
                <button onClick={onClose} className="w-full text-on-surface-variant text-sm font-medium hover:text-on-surface transition-colors flex items-center justify-center gap-2">
                  Cancel·lar
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
