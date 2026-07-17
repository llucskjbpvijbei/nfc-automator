'use client';

import { Zap, Wifi, Music, MessageCircle } from 'lucide-react';
import { Automation } from '@/types';

interface TemplatesGalleryProps {
  onSelectTemplate: (template: Partial<Automation>) => void;
}

export function TemplatesGallery({ onSelectTemplate }: TemplatesGalleryProps) {
  const templates = [
    {
      name: 'Compartir Wi-Fi',
      icon: <Wifi className="w-5 h-5 text-blue-500" />,
      template: {
        name: 'Wi-Fi Convidats',
        type: 'wifi' as const,
        payload: JSON.stringify({ ssid: 'LaMevaXarxa', password: '', encryption: 'WPA' })
      }
    },
    {
      name: 'Música (Spotify)',
      icon: <Music className="w-5 h-5 text-green-500" />,
      template: {
        name: 'Obrir Playlist',
        type: 'app_intent' as const,
        payload: 'spotify://playlist/37i9dQZF1DXcBWIGoYBM5M'
      }
    },
    {
      name: 'Enviar WhatsApp',
      icon: <MessageCircle className="w-5 h-5 text-teal-500" />,
      template: {
        name: 'Avisar que he arribat',
        type: 'url' as const,
        payload: 'whatsapp://send?text=Ja he arribat!'
      }
    },
    {
      name: 'Encendre Llums (IFTTT)',
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      template: {
        name: 'Llums Menjador',
        type: 'url' as const,
        payload: 'https://maker.ifttt.com/trigger/llums_on/with/key/TEVA_CLAU'
      }
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">Plantilles ràpides</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {templates.map((t, i) => (
          <button
            key={i}
            onClick={() => onSelectTemplate(t.template)}
            className="flex flex-col items-center p-4 transition-colors border bg-card border-border/50 rounded-2xl hover:bg-secondary/50 hover:border-primary/30 group"
          >
            <div className="p-3 mb-2 bg-background rounded-xl shadow-sm group-hover:scale-110 transition-transform">
              {t.icon}
            </div>
            <span className="text-xs font-medium text-center">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
