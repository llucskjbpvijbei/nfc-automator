'use client';

import { useState, useEffect } from 'react';
import { Automation, ActionLog } from '@/types';

export function useAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedAuto = localStorage.getItem('nfc_automations');
    const savedLogs = localStorage.getItem('nfc_logs');
    
    if (savedAuto) {
      try { setAutomations(JSON.parse(savedAuto)); } catch (e) {}
    }
    if (savedLogs) {
      try { setLogs(JSON.parse(savedLogs)); } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  const saveAutomations = (newAutomations: Automation[]) => {
    setAutomations(newAutomations);
    localStorage.setItem('nfc_automations', JSON.stringify(newAutomations));
  };

  const saveLogs = (newLogs: ActionLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('nfc_logs', JSON.stringify(newLogs));
  };

  const addAutomation = (automation: Omit<Automation, 'id' | 'createdAt'>) => {
    const newAuto: Automation = {
      ...automation,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    saveAutomations([newAuto, ...automations]);
    return newAuto;
  };

  const deleteAutomation = (id: string) => {
    saveAutomations(automations.filter((a) => a.id !== id));
  };

  const addLog = (action: 'escrit' | 'llegit', automationName: string) => {
    const newLog: ActionLog = {
      id: crypto.randomUUID(),
      action,
      automationName,
      timestamp: Date.now(),
    };
    // Keep only last 50 logs
    const updatedLogs = [newLog, ...logs].slice(0, 50);
    saveLogs(updatedLogs);
  };

  return { automations, logs, addAutomation, deleteAutomation, addLog, isLoaded };
}
