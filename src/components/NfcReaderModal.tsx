'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scan, Loader2, Save } from 'lucide-react';
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
      setReadData('La Web NFC API no està suportada en aquest navegador.');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md p-6 overflow-hidden bg-card border shadow-2xl border-border rounded-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="p-4 mb-4 rounded-full bg-primary/10 text-primary">
                <Scan className="w-8 h-8" />
              </div>

              <h2 className="mb-2 text-xl font-semibold">Llegir Etiqueta NFC</h2>
              
              {status === 'idle' && (
                <>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Prem el botó i apropa el teu dispositiu a qualsevol etiqueta NFC per veure què conté.
                  </p>
                  <button onClick={handleRead} className="w-full py-3 font-medium text-primary-foreground bg-primary rounded-xl">
                    Començar a Llegir
                  </button>
                </>
              )}

              {status === 'reading' && (
                <div className="flex flex-col items-center text-primary animate-pulse">
                  <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                  <p className="font-medium">Apropa l'etiqueta NFC al telèfon...</p>
                </div>
              )}

              {status === 'success' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full text-left">
                  <p className="mb-2 text-sm font-medium text-green-600">Lectura completada:</p>
                  <div className="p-4 mb-4 font-mono text-sm break-all rounded-xl bg-secondary/50 max-h-40 overflow-y-auto">
                    {readData}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 font-medium bg-background border rounded-xl hover:bg-secondary">
                      Tancar
                    </button>
                    <button 
                      onClick={() => {
                        onSaveRead(readData, readType);
                        onClose();
                      }} 
                      className="flex-1 flex items-center justify-center gap-2 py-2 font-medium text-primary-foreground bg-primary rounded-xl"
                    >
                      <Save className="w-4 h-4" /> Guardar
                    </button>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  <p className="p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-xl">{readData}</p>
                  <button onClick={() => setStatus('idle')} className="w-full py-2 font-medium text-destructive-foreground bg-destructive rounded-xl">
                    Tornar a intentar
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
