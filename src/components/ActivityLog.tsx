'use client';

import { ActionLog } from '@/types';
import { motion } from 'framer-motion';

export function ActivityLog({ logs }: { logs: ActionLog[] }) {
  if (logs.length === 0) {
    return (
      <section className="space-y-4 pb-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 px-1">Activitat recent</h3>
        <div className="glass-card p-6 rounded-xl text-center">
          <span className="material-symbols-outlined text-on-surface-variant/50 text-4xl mb-2">history</span>
          <p className="text-sm text-on-surface-variant">Encara no hi ha activitat registrada.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 pb-8 mt-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 px-1">Activitat recent</h3>
      <div className="glass-card rounded-xl divide-y divide-white/5 overflow-hidden">
        {logs.map((log, index) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={log.id}
            className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${log.action === 'escrit' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'}`}>
              <span className="material-symbols-outlined text-xl">
                {log.action === 'escrit' ? 'edit' : 'contactless'}
              </span>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-on-surface text-sm">
                {log.action === 'escrit' ? 'Etiqueta Gravada' : 'Etiqueta Llegida'}
              </p>
              <p className="text-xs text-on-surface-variant truncate">{log.automationName}</p>
            </div>
            <div className="text-xs text-on-surface-variant/60 font-medium shrink-0">
              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
