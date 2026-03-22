import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Change, Incident, initialIncidents } from '@/data/changeData';

interface IncidentsPageProps {
  changes: Change[];
  onOpenDetail: (id: string) => void;
}

const sevColors: Record<string, string> = {
  P1: 'bg-destructive text-destructive-foreground',
  P2: 'bg-warning text-warning-foreground',
  P3: 'bg-primary text-primary-foreground',
  P4: 'bg-muted text-muted-foreground',
};

const statusColors: Record<string, string> = {
  'Risolto': 'text-accent',
  'Chiuso': 'text-text-3',
  'Aperto': 'text-destructive',
};

export function IncidentsPage({ changes, onOpenDetail }: IncidentsPageProps) {
  const allIncidents = initialIncidents;

  // Also collect inline incidents from changes
  const changeIncidents = changes.flatMap(c =>
    c.incidents.map(inc => ({ ...inc, changeId: c.id, status: inc.status || 'Aperto', date: inc.date || c.opened }))
  );

  // Merge unique
  const incidentMap = new Map<string, Incident & { changeId?: string }>();
  allIncidents.forEach(i => incidentMap.set(i.id, i));
  changeIncidents.forEach(i => {
    if (!incidentMap.has(i.id)) incidentMap.set(i.id, i);
    else {
      const existing = incidentMap.get(i.id)!;
      incidentMap.set(i.id, { ...existing, ...i });
    }
  });

  const incidents = Array.from(incidentMap.values());

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid grid-cols-4 gap-3.5">
        {[
          { label: 'Totale Incidenti', value: incidents.length, color: 'hsl(var(--destructive))' },
          { label: 'P1 / Critici', value: incidents.filter(i => i.sev === 'P1').length, color: 'hsl(var(--destructive))' },
          { label: 'Correlati a Change', value: incidents.filter(i => i.changeId).length, color: 'hsl(var(--warning))' },
          { label: 'Risolti', value: incidents.filter(i => i.status === 'Risolto' || i.status === 'Chiuso').length, color: 'hsl(var(--accent))' },
        ].map((k, i) => (
          <div key={i} className="bg-surface border border-border rounded-[10px] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: k.color }} />
            <div className="font-mono text-[28px] font-semibold leading-none mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-text-2">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-semibold flex items-center gap-2">
          <AlertTriangle size={14} /> Incidenti Correlati ai Change
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['ID', 'Severità', 'Descrizione', 'Change Correlato', 'Data', 'Stato', 'Risoluzione'].map(h => (
                <th key={h} className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => (
              <tr key={inc.id} className="hover:bg-surface-2 transition-colors">
                <td className="px-3.5 py-2.5 text-[11px] font-mono text-destructive border-b border-border/50">{inc.id}</td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${sevColors[inc.sev] || 'bg-muted text-muted-foreground'}`}>{inc.sev}</span>
                </td>
                <td className="px-3.5 py-2.5 text-[13px] border-b border-border/50 max-w-[300px]">{inc.desc}</td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  {inc.changeId ? (
                    <button onClick={() => onOpenDetail(inc.changeId!)} className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1">
                      {inc.changeId} <ExternalLink size={10} />
                    </button>
                  ) : <span className="text-text-3 text-[11px]">—</span>}
                </td>
                <td className="px-3.5 py-2.5 text-[11px] font-mono text-text-3 border-b border-border/50">{inc.date || '—'}</td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  <span className={`text-[12px] font-medium ${statusColors[inc.status || ''] || 'text-text-2'}`}>{inc.status || '—'}</span>
                </td>
                <td className="px-3.5 py-2.5 text-[12px] text-text-3 border-b border-border/50 max-w-[200px] truncate">{inc.resolution || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
