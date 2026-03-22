import { useState } from 'react';
import { Users, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Change } from '@/data/changeData';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';

interface CABBoardPageProps {
  changes: Change[];
  onOpenDetail: (id: string) => void;
  onAdvance: (id: string) => void;
  onReject: (id: string) => void;
}

const cabMembers = [
  { name: 'Marco Albini', role: 'Change Manager', avatar: 'MA' },
  { name: 'Giulia Bianchi', role: 'IT Director', avatar: 'GB' },
  { name: 'Stefano Conte', role: 'Security Lead', avatar: 'SC' },
  { name: 'Luca Ferri', role: 'DBA Lead', avatar: 'LF' },
  { name: 'Anna Russo', role: 'DevOps Lead', avatar: 'AR' },
];

export function CABBoardPage({ changes, onOpenDetail, onAdvance, onReject }: CABBoardPageProps) {
  const [selectedChange, setSelectedChange] = useState<string | null>(null);
  const cabChanges = changes.filter(c => ['In Review', 'Approvato'].includes(c.status));
  const emergencyChanges = changes.filter(c => c.type === 'Emergenza' && c.status !== 'Chiuso');

  return (
    <div className="animate-fade-in space-y-4">
      {/* CAB Members */}
      <div className="bg-surface border border-border rounded-[10px] p-4">
        <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3 flex items-center gap-2">
          <Users size={14} /> Membri CAB
        </div>
        <div className="flex gap-3">
          {cabMembers.map(m => (
            <div key={m.name} className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-semibold text-primary-foreground flex-shrink-0">
                {m.avatar}
              </div>
              <div>
                <div className="text-[12px] font-medium">{m.name}</div>
                <div className="text-[10px] text-text-3">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Changes for CAB review */}
        <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-sm font-semibold flex items-center gap-2">
            Agenda CAB
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">{cabChanges.length}</span>
          </div>
          {cabChanges.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-text-3 text-[13px]">Nessun change in agenda</div>
          ) : (
            <div className="divide-y divide-border">
              {cabChanges.map(c => (
                <div
                  key={c.id}
                  className={`p-4 cursor-pointer transition-colors ${selectedChange === c.id ? 'bg-primary/5' : 'hover:bg-surface-2'}`}
                  onClick={() => setSelectedChange(c.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-primary">{c.id}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    {c.type === 'Emergenza' && <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">🚨 EMERGENZA</span>}
                  </div>
                  <div className="text-[13px] font-medium">{c.title}</div>
                  <div className="flex gap-3 mt-2 text-[11px] text-text-3">
                    <span>Rischio: <span className="text-text-2">{c.risk}</span></span>
                    <span>Impatto: <span className="text-text-2">{c.impact}</span></span>
                    <span>Finestra: <span className="text-text-2 font-mono">{c.window}</span></span>
                  </div>
                  {c.status === 'In Review' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={e => { e.stopPropagation(); onAdvance(c.id); }} className="flex items-center gap-1 bg-accent text-accent-foreground text-[11px] font-medium px-2.5 py-1 rounded-lg hover:brightness-110">
                        <CheckCircle size={12} /> Approva
                      </button>
                      <button onClick={e => { e.stopPropagation(); onReject(c.id); }} className="flex items-center gap-1 bg-destructive text-destructive-foreground text-[11px] font-medium px-2.5 py-1 rounded-lg hover:brightness-110">
                        <XCircle size={12} /> Rifiuta
                      </button>
                      <button onClick={e => { e.stopPropagation(); onOpenDetail(c.id); }} className="flex items-center gap-1 text-[11px] text-text-2 border border-border px-2.5 py-1 rounded-lg hover:bg-surface-2">
                        <MessageSquare size={12} /> Dettagli
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-3.5">
          <div className="bg-surface border border-border rounded-[10px] p-4">
            <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3">Prossimo CAB Meeting</div>
            <div className="text-[22px] font-mono font-semibold text-primary">Mercoledì</div>
            <div className="text-[12px] text-text-3 mt-1">05 Feb 2025 — 10:00-12:00</div>
            <div className="text-[12px] text-text-3 mt-0.5">Sala Riunioni A / Teams</div>
            <div className="mt-3 text-[11px] text-text-3">
              <span className="font-mono text-primary">{cabChanges.length}</span> change in agenda
            </div>
          </div>

          {emergencyChanges.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-[10px] p-4">
              <div className="text-[12px] font-semibold text-destructive uppercase tracking-[1px] mb-2">🚨 Change Emergenza</div>
              {emergencyChanges.map(c => (
                <div key={c.id} className="py-2 border-b border-destructive/20 last:border-0 cursor-pointer" onClick={() => onOpenDetail(c.id)}>
                  <div className="text-[13px] font-medium">{c.title}</div>
                  <div className="text-[11px] font-mono text-destructive">{c.id} — {c.status}</div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-surface border border-border rounded-[10px] p-4">
            <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3">Statistiche CAB</div>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-text-3">Approvati questo mese</span><span className="font-mono text-accent">{changes.filter(c => c.status === 'Approvato').length}</span></div>
              <div className="flex justify-between"><span className="text-text-3">Rifiutati questo mese</span><span className="font-mono text-destructive">{changes.filter(c => c.status === 'Rifiutato').length}</span></div>
              <div className="flex justify-between"><span className="text-text-3">Tasso approvazione</span><span className="font-mono text-primary">87%</span></div>
              <div className="flex justify-between"><span className="text-text-3">Tempo medio revisione</span><span className="font-mono text-text-2">2.3 giorni</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
