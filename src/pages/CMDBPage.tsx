import { useState } from 'react';
import { Monitor, Search, Server, Database, Globe, Shield, HardDrive } from 'lucide-react';
import { Change } from '@/data/changeData';

interface CMDBPageProps {
  changes: Change[];
  onOpenDetail: (id: string) => void;
}

interface CIItem {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  status: 'Attivo' | 'Manutenzione' | 'Dismesso';
  owner: string;
  env: string;
  relatedChanges: string[];
}

const ciItems: CIItem[] = [
  { id: 'CI-001', name: 'Switch Core DC01', type: 'Network', icon: <Globe size={14} />, status: 'Attivo', owner: 'A. Russo', env: 'PROD', relatedChanges: ['CHG-2025-001'] },
  { id: 'CI-002', name: 'CRM Application Server', type: 'Applicazioni', icon: <Server size={14} />, status: 'Attivo', owner: 'A. Russo', env: 'PROD', relatedChanges: ['CHG-2025-002'] },
  { id: 'CI-003', name: 'Oracle DB Primary', type: 'Database', icon: <Database size={14} />, status: 'Manutenzione', owner: 'L. Ferri', env: 'PROD', relatedChanges: ['CHG-2025-003'] },
  { id: 'CI-004', name: 'Web Server Farm', type: 'Server', icon: <Server size={14} />, status: 'Attivo', owner: 'A. Russo', env: 'PROD', relatedChanges: ['CHG-2025-005', 'CHG-2025-010'] },
  { id: 'CI-005', name: 'Firewall Perimetrale', type: 'Security', icon: <Shield size={14} />, status: 'Attivo', owner: 'S. Conte', env: 'PROD', relatedChanges: ['CHG-2025-007'] },
  { id: 'CI-006', name: 'SAN Cluster PROD', type: 'Storage', icon: <HardDrive size={14} />, status: 'Attivo', owner: 'M. Albini', env: 'PROD', relatedChanges: ['CHG-2025-006'] },
  { id: 'CI-007', name: 'ESB Middleware', type: 'Applicazioni', icon: <Server size={14} />, status: 'Attivo', owner: 'L. Ferri', env: 'INTEG', relatedChanges: ['CHG-2025-008'] },
  { id: 'CI-008', name: 'VPN Gateway Milano', type: 'Network', icon: <Globe size={14} />, status: 'Attivo', owner: 'A. Russo', env: 'PROD', relatedChanges: ['CHG-2025-009'] },
  { id: 'CI-009', name: 'SSL Certificate Store', type: 'Security', icon: <Shield size={14} />, status: 'Attivo', owner: 'S. Conte', env: 'PROD', relatedChanges: ['CHG-2025-004'] },
];

const statusStyle: Record<string, string> = {
  'Attivo': 'text-accent',
  'Manutenzione': 'text-warning',
  'Dismesso': 'text-text-3',
};

export function CMDBPage({ changes, onOpenDetail }: CMDBPageProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const types = [...new Set(ciItems.map(c => c.type))];

  const filtered = ciItems.filter(ci => {
    const matchSearch = !search || ci.name.toLowerCase().includes(search.toLowerCase()) || ci.id.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || ci.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid grid-cols-4 gap-3.5">
        {[
          { label: 'CI Totali', value: ciItems.length, color: 'hsl(var(--primary))' },
          { label: 'Attivi', value: ciItems.filter(c => c.status === 'Attivo').length, color: 'hsl(var(--accent))' },
          { label: 'In Manutenzione', value: ciItems.filter(c => c.status === 'Manutenzione').length, color: 'hsl(var(--warning))' },
          { label: 'Con Change Attivi', value: ciItems.filter(c => c.relatedChanges.some(rc => changes.find(ch => ch.id === rc && ch.status !== 'Chiuso'))).length, color: 'hsl(var(--purple))' },
        ].map((k, i) => (
          <div key={i} className="bg-surface border border-border rounded-[10px] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: k.color }} />
            <div className="font-mono text-[28px] font-semibold leading-none mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-text-2">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
          <Monitor size={14} />
          <span className="text-sm font-semibold">Configuration Items</span>
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-1.5 ml-4">
            <Search size={13} className="text-text-3" />
            <input className="bg-transparent border-none outline-none text-[13px] text-foreground w-[180px] placeholder:text-text-3" placeholder="Cerca CI..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-2" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tutti i tipi</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['ID', 'Nome', 'Tipo', 'Stato', 'Owner', 'Ambiente', 'Change Correlati'].map(h => (
                <th key={h} className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(ci => (
              <tr key={ci.id} className="hover:bg-surface-2 transition-colors">
                <td className="px-3.5 py-2.5 text-[11px] font-mono text-primary border-b border-border/50">{ci.id}</td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  <div className="flex items-center gap-2 text-[13px] font-medium">
                    <span className="text-text-3">{ci.icon}</span> {ci.name}
                  </div>
                </td>
                <td className="px-3.5 py-2.5 border-b border-border/50"><span className="bg-surface-3 text-text-2 px-2 py-0.5 rounded text-[10px] font-mono">{ci.type}</span></td>
                <td className="px-3.5 py-2.5 border-b border-border/50"><span className={`text-[12px] font-medium ${statusStyle[ci.status]}`}>● {ci.status}</span></td>
                <td className="px-3.5 py-2.5 text-[13px] text-text-2 border-b border-border/50">{ci.owner}</td>
                <td className="px-3.5 py-2.5 border-b border-border/50"><span className="bg-surface-3 text-text-2 px-2 py-0.5 rounded text-[10px] font-mono">{ci.env}</span></td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  <div className="flex gap-1 flex-wrap">
                    {ci.relatedChanges.map(rc => (
                      <button key={rc} onClick={() => onOpenDetail(rc)} className="text-[10px] font-mono text-primary hover:underline bg-primary/10 px-1.5 py-0.5 rounded">{rc}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
