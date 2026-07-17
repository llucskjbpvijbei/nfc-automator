'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Automation } from '@/types';

interface NfcReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRead: (payload: string, type: Automation['type']) => void;
}

export function NfcReaderModal({ isOpen, onClose, onSaveRead }: NfcReaderModalProps) {
  const [status, setStatus] = useState<'idle' | 'reading' | 'success' | 'error'>('idle');
  const [readData, setReadData] = useState<string>('');
  const [readType, setReadType] = useState<Automation['type']>('text');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setReadData('');
    }
  }, [isOpen]);

  const handleRead = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('error');
      setReadData('NFC no suportat en aquest navegador (Utilitza Android).');
      return;
    }

    try {
      setStatus('reading');
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      
      // @ts-ignore
      ndef.onreading = (event) => {
        const message = event.message;
        let dataStr = '';
        let typeStr: Automation['type'] = 'text';

        for (const record of message.records) {
          if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding);
            dataStr += textDecoder.decode(record.data);
          } else if (record.recordType === 'url') {
            const textDecoder = new TextDecoder();
            dataStr += textDecoder.decode(record.data);
            typeStr = dataStr.includes('://') && !dataStr.startsWith('http') ? 'app_intent' : 'url';
          }
        }
        
        if (dataStr.startsWith('WIFI:')) {
          typeStr = 'wifi';
        } else if (dataStr.startsWith('BEGIN:VCARD')) {
          typeStr = 'vcard';
        }

        setReadData(dataStr || 'Etiqueta buida o format no reconegut');
        setReadType(typeStr);
        setStatus('success');
      };

      // @ts-ignore
      ndef.onreadingerror = () => {
        setStatus('error');
        setReadData("No s'ha pogut llegir l'etiqueta. Apropa-la de nou.");
      };

    } catch (error: any) {
      setStatus('error');
      setReadData(error.message || "Error a l'iniciar el lector NFC");
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
            
            <div className="text-center space-y-2 z-10 w-full">
              <h3 className="text-2xl font-extrabold tracking-tight font-headline text-on-surface">
                {status === 'success' ? 'Lectura Completada' : status === 'error' ? 'Error' : 'Llegir Etiqueta'}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {status === 'success' ? 'S\'han extret les següents dades:' : 
                 status === 'error' ? readData :
                 'Apropa el teu telèfon a l\'etiqueta NFC per escanejar-la.'}
              </p>
            </div>
            
            {status === 'success' ? (
              <div className="w-full my-6 z-10">
                <div className="p-4 rounded-xl bg-surface-container-highest border border-white/5 font-mono text-sm break-all max-h-40 overflow-y-auto custom-scrollbar">
                  {readData}
                </div>
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-64 h-64 z-10 my-4">
                {status === 'reading' && (
                  <>
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full nfc-ring"></div>
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full nfc-ring nfc-ring-delay-1"></div>
                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full nfc-ring nfc-ring-delay-2"></div>
                  </>
                )}
                
                <div className={`relative p-8 rounded-full border shadow-[0_0_50px_rgba(125,211,252,0.15)] flex flex-col items-center gap-2 transition-transform duration-500 hover:scale-105 ${status === 'error' ? 'bg-error-container border-error/30' : 'bg-surface-container-highest/80 border-primary/30'}`}>
                  <span className={`material-symbols-outlined text-7xl ${status === 'error' ? 'text-error' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {status === 'error' ? 'error' : 'nfc'}
                  </span>
                  {status === 'reading' && (
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-primary/60 rounded-full animate-pulse [animation-delay:200ms]"></div>
                      <div className="w-1 h-1 bg-primary/30 rounded-full animate-pulse [animation-delay:400ms]"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="w-full space-y-4 z-10">
              {status === 'idle' ? (
                <button
                  onClick={handleRead}
                  className="w-full py-4 px-6 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold tracking-wide active:scale-95 transition-all hover:bg-primary/20 ice-glow"
                >
                  Començar a Llegir
                </button>
              ) : status === 'success' ? (
                <div className="flex gap-2">
                  <button onClick={onClose} className="flex-1 py-4 px-6 bg-surface-container border border-white/5 rounded-xl text-on-surface font-bold tracking-wide active:scale-95 transition-all hover:bg-surface-container-highest">
                    Tancar
                  </button>
                  <button 
                    onClick={() => {
                      onSaveRead(readData, readType);
                      onClose();
                    }} 
                    className="flex-1 py-4 px-6 bg-primary/20 border border-primary/30 rounded-xl text-primary font-bold tracking-wide active:scale-95 transition-all hover:bg-primary/30 ice-glow"
                  >
                    Guardar
                  </button>
                </div>
              ) : status === 'error' ? (
                <button
                  onClick={() => setStatus('idle')}
                  className="w-full py-4 px-6 bg-error/10 border border-error/20 rounded-xl text-error font-bold tracking-wide active:scale-95 transition-all hover:bg-error/20"
                >
                  Tornar a intentar
                </button>
              ) : null}
              
              {(status === 'idle' || status === 'error') && (
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
