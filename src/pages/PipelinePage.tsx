import { Change, ENVS } from '@/data/changeData';
import { StatusBadge } from '@/components/StatusBadge';
import { PipelineFull } from '@/components/PipelineInline';

interface PipelinePageProps {
  changes: Change[];
  onOpenDetail: (id: string) => void;
  onPromote: (id: string) => void;
}

function canPromote(c: Change, changes: Change[]) {
  if (['Chiuso', 'Rifiutato'].includes(c.status)) return false;
  if (c.deps?.length > 0) {
    const unmet = c.deps.some(depId => {
      const dep = changes.find(x => x.id === depId);
      return dep && dep.status !== 'Chiuso';
    });
    if (unmet) return false;
  }
  return ['Approvato', 'Schedulato', 'Implementazione'].includes(c.status) && c.currentEnv < 3;
}

function getPromoteBlock(c: Change, changes: Change[]) {
  if (c.status === 'In Review') return '⏳ In approvazione';
  if (c.status === 'Aperto') return '⏳ Non approvato';
  if (c.currentEnv >= 3) return c.status === 'Chiuso' ? '✓ Completato' : '⏳ In PROD';
  if (c.deps?.length > 0) {
    const unmet = c.deps.filter(d => { const dep = changes.find(x => x.id === d); return dep && dep.status !== 'Chiuso'; });
    if (unmet.length) return `🔗 Attende ${unmet[0]}`;
  }
  return '';
}

export function PipelinePage({ changes, onOpenDetail, onPromote }: PipelinePageProps) {
  const active = changes.filter(c => !['Chiuso', 'Rifiutato'].includes(c.status));

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <div className="text-sm text-text-2">Visualizzazione avanzamento change per ambiente. La promozione segue il path configurato.</div>
        <div className="ml-auto flex gap-2">
          {[
            { color: 'hsl(var(--accent))', label: 'Completato' },
            { color: 'hsl(var(--warning))', label: 'In corso' },
            { color: 'hsl(var(--destructive))', label: 'Fallito' },
            { color: 'hsl(var(--purple))', label: 'Skip (direct)' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-text-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-sm font-semibold">Stato Pipeline per Change</div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['ID', 'Titolo', 'Tipo', 'DEV → INTEG → CERT → PROD', 'Env Corrente', 'Azione'].map(h => (
                <th key={h} className="px-3.5 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border" style={h.includes('DEV') ? { minWidth: 340 } : undefined}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map(c => (
              <tr key={c.id}>
                <td className="px-3.5 py-2.5 text-[11px] font-mono text-primary border-b border-border/50">{c.id}</td>
                <td className="px-3.5 py-2.5 text-[13px] font-medium border-b border-border/50 max-w-[180px] truncate">{c.title}</td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  <span className="bg-surface-3 text-text-2 px-2 py-0.5 rounded text-[10px] font-mono">{c.type}</span>
                  {c.pipelineStrategy === 'direct' && (
                    <span className="ml-1 bg-destructive/10 border border-destructive/25 rounded text-[10px] text-destructive px-1.5 py-0.5 font-mono">DIRECT</span>
                  )}
                  {c.pipelineStrategy === 'custom' && (
                    <span className="ml-1 bg-purple/10 border border-purple/25 rounded text-[10px] text-purple px-1.5 py-0.5 font-mono">CUSTOM</span>
                  )}
                </td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  <PipelineFull change={c} />
                </td>
                <td className="px-3.5 py-2.5 border-b border-border/50"><StatusBadge status={c.status} /></td>
                <td className="px-3.5 py-2.5 border-b border-border/50">
                  {canPromote(c, changes) ? (
                    <button className="bg-accent/10 border border-accent/25 text-accent px-2.5 py-1 rounded text-[11px] font-medium hover:bg-accent/20 transition" onClick={() => onPromote(c.id)}>
                      Promuovi →
                    </button>
                  ) : (
                    <span className="text-[11px] text-text-3">{getPromoteBlock(c, changes)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
