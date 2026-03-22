import { Change } from '@/data/changeData';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { PipelineInline } from '@/components/PipelineInline';

interface DashboardPageProps {
  changes: Change[];
  onNavigate: (page: string) => void;
  onOpenDetail: (id: string) => void;
}

export function DashboardPage({ changes, onNavigate, onOpenDetail }: DashboardPageProps) {
  const open = changes.filter(c => c.status === 'Aperto').length;
  const review = changes.filter(c => c.status === 'In Review').length;
  const impl = changes.filter(c => c.status === 'Implementazione').length;
  const closed = changes.filter(c => c.status === 'Chiuso').length;
  const freezeActive = 2;

  const stats = [
    { label: 'Aperti', value: open, color: 'hsl(var(--destructive))', trend: '↑ +2 questa settimana' },
    { label: 'In Approvazione', value: review, color: 'hsl(var(--primary))', trend: '⏳ CAB mercoledì' },
    { label: 'In Implementazione', value: impl, color: 'hsl(var(--warning))', trend: '→ Live ora' },
    { label: 'Chiusi YTD', value: closed, color: 'hsl(var(--accent))', trend: '↑ 94% success rate' },
    { label: 'Freeze Attivi', value: freezeActive, color: 'hsl(var(--purple))', trend: 'Fine Anno + Pasqua' },
  ];

  const recent = changes.filter(c => c.status !== 'Chiuso').slice(0, 6);
  const pending = changes.filter(c => c.status === 'In Review');
  const sched = changes.filter(c => ['Schedulato', 'Approvato'].includes(c.status));

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-5 gap-3.5 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-[10px] p-4 relative overflow-hidden cursor-pointer transition-all hover:border-primary hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: s.color }} />
            <div className="font-mono text-[32px] font-semibold leading-none mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-text-2">{s.label}</div>
            <div className="text-[10px] text-text-3 mt-1.5 font-mono">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 flex items-center border-b border-border">
            <div className="text-sm font-semibold">Change Recenti</div>
            <button className="ml-auto text-xs text-text-2 hover:text-foreground border border-border rounded-lg px-2.5 py-1" onClick={() => onNavigate('changes')}>
              Vedi tutti →
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">ID</th>
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">Titolo</th>
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">Tipo</th>
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">Stato</th>
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">Pipeline</th>
                <th className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">Priorità</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(c => (
                <tr key={c.id} className="cursor-pointer hover:bg-white/[.015]" onClick={() => onOpenDetail(c.id)}>
                  <td className="px-3.5 py-2.5 text-[11px] font-mono text-primary border-b border-border/50">{c.id}</td>
                  <td className="px-3.5 py-2.5 text-[13px] font-medium border-b border-border/50 max-w-[220px] truncate">{c.title}</td>
                  <td className="px-3.5 py-2.5 border-b border-border/50"><span className="bg-surface-3 text-text-2 px-2 py-0.5 rounded text-[10px] font-mono">{c.type}</span></td>
                  <td className="px-3.5 py-2.5 border-b border-border/50"><StatusBadge status={c.status} /></td>
                  <td className="px-3.5 py-2.5 border-b border-border/50"><PipelineInline change={c} /></td>
                  <td className="px-3.5 py-2.5 border-b border-border/50"><PriorityBadge priority={c.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3.5">
          <div className="bg-surface border border-border rounded-[10px] p-4">
            <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3">Approvazioni Pendenti</div>
            {pending.length > 0 ? pending.map(c => (
              <div key={c.id} className="py-2 border-b border-border cursor-pointer hover:bg-surface-2 px-1 rounded" onClick={() => onOpenDetail(c.id)}>
                <div className="text-[13px] font-medium mb-1">{c.title}</div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono text-primary">{c.id}</span>
                  <PriorityBadge priority={c.priority} />
                </div>
              </div>
            )) : (
              <div className="text-text-3 text-[13px]">Nessuna approvazione pendente ✓</div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-[10px] p-4">
            <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3">Prossime Implementazioni</div>
            {sched.length > 0 ? sched.map(c => (
              <div key={c.id} className="py-2 border-b border-border cursor-pointer" onClick={() => onOpenDetail(c.id)}>
                <div className="text-[13px] font-medium mb-0.5">{c.title}</div>
                <div className="text-[11px] text-primary font-mono">{c.window !== 'TBD' ? c.window : '⏳ Da pianificare'}</div>
              </div>
            )) : (
              <div className="text-text-3 text-[13px]">Nessuna implementazione pianificata</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
