'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SmartphoneNfc, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
      setErrorMessage('La Web NFC API no està suportada en aquest navegador. Utilitza Chrome per Android.');
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
          // Standard WIFI format for NDEF
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md p-6 overflow-hidden bg-card border shadow-2xl border-border rounded-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="p-4 mb-4 rounded-full bg-primary/10 text-primary">
                <SmartphoneNfc className="w-8 h-8" />
              </div>

              <h2 className="mb-2 text-xl font-semibold">Escriure a NFC</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Apropa el teu dispositiu a l'etiqueta NFC per a gravar l'automatització: 
                <br />
                <span className="font-medium text-foreground">{automation?.name}</span>
              </p>

              {status === 'idle' && (
                <button
                  onClick={handleWrite}
                  className="w-full py-3 font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                >
                  Començar a Gravar
                </button>
              )}

              {status === 'writing' && (
                <div className="flex flex-col items-center text-primary animate-pulse">
                  <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                  <p className="font-medium">Esperant etiqueta NFC...</p>
                </div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-green-500"
                >
                  <CheckCircle2 className="w-12 h-12 mb-3" />
                  <p className="font-medium text-lg">Gravat amb èxit!</p>
                  <button
                    onClick={onClose}
                    className="mt-6 w-full py-2 px-4 font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Tancar
                  </button>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center w-full"
                >
                  <AlertCircle className="w-12 h-12 mb-3 text-destructive" />
                  <p className="font-medium text-destructive mb-2">S'ha produït un error</p>
                  <p className="text-sm text-muted-foreground mb-6 bg-destructive/10 p-3 rounded-lg w-full">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="w-full py-2 px-4 font-medium text-destructive-foreground bg-destructive rounded-xl hover:bg-destructive/90 transition-colors"
                  >
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
