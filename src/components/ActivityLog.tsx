'use client';

import { ActionLog } from '@/types';
import { History, Pencil, Scan } from 'lucide-react';
import { motion } from 'framer-motion';

export function ActivityLog({ logs }: { logs: ActionLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="p-6 mt-8 border bg-card/30 border-border/50 rounded-2xl text-center">
        <History className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Encara no hi ha activitat registrada.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        Historial d'Activitat
      </h3>
      <div className="space-y-3">
        {logs.map((log, index) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={log.id}
            className="flex items-center justify-between p-3 text-sm bg-card border border-border/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${log.action === 'escrit' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                {log.action === 'escrit' ? <Pencil className="w-4 h-4" /> : <Scan className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium">
                  {log.action === 'escrit' ? 'Etiqueta Gravada' : 'Etiqueta Llegida'}
                </p>
                <p className="text-muted-foreground">{log.automationName}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' - '}
              {new Date(log.timestamp).toLocaleDateString()}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
