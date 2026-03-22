import { useState } from 'react';
import { Settings, Bell, Shield, Users, Clock, Palette } from 'lucide-react';

export function SettingsPage() {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [autoApproveStandard, setAutoApproveStandard] = useState(false);
  const [requireCAB, setRequireCAB] = useState(true);
  const [freezeEnforce, setFreezeEnforce] = useState(true);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-3'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-5.5 translate-x-0' : 'left-0.5'}`}
        style={{ left: checked ? '22px' : '2px' }}
      />
    </button>
  );

  const sections = [
    {
      title: 'Notifiche', icon: <Bell size={14} />, items: [
        { label: 'Notifiche email', desc: 'Ricevi email per nuovi change e approvazioni', checked: notifEmail, onChange: setNotifEmail },
        { label: 'Notifiche browser', desc: 'Mostra notifiche push nel browser', checked: notifBrowser, onChange: setNotifBrowser },
      ],
    },
    {
      title: 'Workflow', icon: <Clock size={14} />, items: [
        { label: 'Auto-approvazione Standard', desc: 'I change Standard vengono approvati automaticamente', checked: autoApproveStandard, onChange: setAutoApproveStandard },
        { label: 'CAB obbligatorio', desc: 'Tutti i change Normali richiedono approvazione CAB', checked: requireCAB, onChange: setRequireCAB },
      ],
    },
    {
      title: 'Freeze & Sicurezza', icon: <Shield size={14} />, items: [
        { label: 'Enforce freeze period', desc: 'Blocca deploy durante i periodi di freeze', checked: freezeEnforce, onChange: setFreezeEnforce },
      ],
    },
  ];

  return (
    <div className="animate-fade-in space-y-4 max-w-[700px]">
      {sections.map(section => (
        <div key={section.title} className="bg-surface border border-border rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-sm font-semibold flex items-center gap-2">
            {section.icon} {section.title}
          </div>
          <div className="divide-y divide-border">
            {section.items.map(item => (
              <div key={item.label} className="px-4 py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium">{item.label}</div>
                  <div className="text-[11px] text-text-3 mt-0.5">{item.desc}</div>
                </div>
                <Toggle checked={item.checked} onChange={item.onChange} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-semibold flex items-center gap-2">
          <Users size={14} /> Team
        </div>
        <div className="divide-y divide-border">
          {[
            { name: 'Marco Albini', role: 'Change Manager', email: 'marco.albini@company.it' },
            { name: 'Anna Russo', role: 'DevOps Lead', email: 'anna.russo@company.it' },
            { name: 'Luca Ferri', role: 'DBA Lead', email: 'luca.ferri@company.it' },
            { name: 'Stefano Conte', role: 'Security Lead', email: 'stefano.conte@company.it' },
            { name: 'Giulia Bianchi', role: 'IT Director', email: 'giulia.bianchi@company.it' },
          ].map(u => (
            <div key={u.name} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-semibold text-primary-foreground flex-shrink-0">
                {u.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium">{u.name}</div>
                <div className="text-[11px] text-text-3">{u.role}</div>
              </div>
              <div className="text-[11px] text-text-3 font-mono">{u.email}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[10px] p-4">
        <div className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Palette size={14} /> Informazioni Sistema
        </div>
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between"><span className="text-text-3">Versione</span><span className="font-mono text-text-2">v2.0 — Enterprise</span></div>
          <div className="flex justify-between"><span className="text-text-3">Ambiente</span><span className="font-mono text-text-2">Production</span></div>
          <div className="flex justify-between"><span className="text-text-3">Ultimo aggiornamento</span><span className="font-mono text-text-2">25 Feb 2026</span></div>
          <div className="flex justify-between"><span className="text-text-3">Licenza</span><span className="font-mono text-primary">Enterprise — Attiva</span></div>
        </div>
      </div>
    </div>
  );
}
