'use client';

import { Automation } from '@/types';

interface TemplatesGalleryProps {
  onSelectTemplate: (template: Partial<Automation>) => void;
}

export function TemplatesGallery({ onSelectTemplate }: TemplatesGalleryProps) {
  const templates = [
    {
      name: 'Compartir Wi-Fi',
      icon: 'wifi',
      iconClass: 'text-primary bg-primary/10',
      template: {
        name: 'Wi-Fi Convidats',
        type: 'wifi' as const,
        payload: JSON.stringify({ ssid: 'LaMevaXarxa', password: '', encryption: 'WPA' })
      }
    },
    {
      name: 'Obrir Spotify',
      icon: 'music_note',
      iconClass: 'text-tertiary bg-tertiary/10',
      template: {
        name: 'Obrir Playlist',
        type: 'app_intent' as const,
        payload: 'spotify://playlist/37i9dQZF1DXcBWIGoYBM5M'
      }
    },
    {
      name: 'Targeta Contacte',
      icon: 'contact_page',
      iconClass: 'text-secondary bg-secondary/10',
      template: {
        name: 'Targeta Visita',
        type: 'vcard' as const,
        payload: 'BEGIN:VCARD\nVERSION:3.0\nN:Nom\nTEL:123456\nEMAIL:a@a.com\nEND:VCARD'
      }
    },
    {
      name: 'Mode Cotxe',
      icon: 'directions_car',
      iconClass: 'text-primary bg-primary/10',
      template: {
        name: 'Mode Cotxe',
        type: 'url' as const,
        payload: 'https://maps.google.com'
      }
    }
  ];

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70 px-1">Plantilles ràpides</h3>
      <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x">
        {templates.map((t, i) => (
          <div
            key={i}
            onClick={() => onSelectTemplate(t.template)}
            className="snap-start min-w-[160px] glass-card p-4 rounded-xl space-y-3 hover:border-primary/40 transition-colors cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${t.iconClass}`}>
              <span className="material-symbols-outlined">{t.icon}</span>
            </div>
            <p className="font-semibold text-sm leading-tight text-on-surface">{t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
