import { useState } from 'react';
import { Search } from 'lucide-react';
import { Change } from '@/data/changeData';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { PipelineInline } from '@/components/PipelineInline';

interface ChangesPageProps {
  changes: Change[];
  onOpenDetail: (id: string) => void;
  onNewChange: () => void;
}

export function ChangesPage({ changes, onOpenDetail, onNewChange }: ChangesPageProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterEnv, setFilterEnv] = useState('');

  const filtered = changes.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || c.status === filterStatus;
    const matchType = !filterType || c.type === filterType;
    const matchEnv = !filterEnv || (
      (filterEnv === 'PROD' && ['done', 'active', 'failed'].includes(c.pipeline[3])) ||
      (filterEnv === 'CERT' && ['done', 'active'].includes(c.pipeline[2])) ||
      (filterEnv === 'INTEG' && ['done', 'active'].includes(c.pipeline[1])) ||
      (filterEnv === 'DEV' && c.pipeline[0] === 'active')
    );
    return matchSearch && matchStatus && matchType && matchEnv;
  });

  return (
    <div className="animate-fade-in">
      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-border flex-wrap">
          <div className="text-sm font-semibold">Tutti i Change</div>
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-1.5">
            <Search size={13} className="text-text-3" />
            <input className="bg-transparent border-none outline-none text-[13px] text-foreground w-[200px] placeholder:text-text-3" placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tutti gli stati</option>
            {['Aperto', 'In Review', 'Approvato', 'Schedulato', 'Implementazione', 'Chiuso', 'Rifiutato'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-2" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tutti i tipi</option>
            {['Standard', 'Normale', 'Emergenza'].map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-2" value={filterEnv} onChange={e => setFilterEnv(e.target.value)}>
            <option value="">Tutti gli ambienti</option>
            {['DEV', 'INTEG', 'CERT', 'PROD'].map(e => <option key={e}>{e}</option>)}
          </select>
          <button className="ml-auto bg-primary text-primary-foreground text-[13px] font-medium px-4 py-1.5 rounded-lg hover:brightness-110 transition-all" onClick={onNewChange}>+ Nuovo</button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['ID', 'Titolo', 'Tipo', 'Priorità', 'Stato', 'Pipeline', 'Richiedente', 'Apertura', ''].map(h => (
                <th key={h} className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="cursor-pointer hover:bg-white/[.015]" onClick={() => onOpenDetail(c.id)}>
                <td className="px-3.5 py-2.5 text-[11px] font-mono text-primary border-b border-border/50">{c.id}</td>
                <td className="px-3.5 py-2.5 text-[13px] font-medium border-b border-border/50 max-w-[220px] truncate">
                  {c.type === 'Emergenza' && '🚨 '}{c.title}
                </td>
                <td className="px-3.5 py-2.5 border-b border-border/50"><span className="bg-surface-3 text-text-2 px-2 py-0.5 rounded text-[10px] font-mono">{c.type}</span></td>
                <td className="px-3.5 py-2.5 border-b border-border/50"><PriorityBadge priority={c.priority} /></td>
                <td className="px-3.5 py-2.5 border-b border-border/50"><StatusBadge status={c.status} /></td>
                <td className="px-3.5 py-2.5 border-b border-border/50 min-w-[260px]"><PipelineInline change={c} /></td>
                <td className="px-3.5 py-2.5 border-b border-border/50 text-text-2 text-[13px]">{c.requester}</td>
                <td className="px-3.5 py-2.5 border-b border-border/50 text-text-3 font-mono text-[11px]">{c.opened}</td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  <button className="text-xs text-text-2 border border-border rounded-lg px-2.5 py-1 hover:bg-surface-2" onClick={e => { e.stopPropagation(); onOpenDetail(c.id); }}>
                    Apri →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
