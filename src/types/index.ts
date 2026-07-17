export type AutomationType = 'url' | 'text' | 'wifi' | 'vcard' | 'app_intent';

export interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  payload: string; // Will store JSON stringified data for complex types (wifi, vcard)
  createdAt: number;
}

export interface ActionLog {
  id: string;
  action: 'escrit' | 'llegit';
  automationName: string;
  timestamp: number;
}
