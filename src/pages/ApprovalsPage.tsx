import { useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { Change, statusConfig } from '@/data/changeData';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';

interface ApprovalsPageProps {
  changes: Change[];
  onOpenDetail: (id: string) => void;
  onAdvance: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalsPage({ changes, onOpenDetail, onAdvance, onReject }: ApprovalsPageProps) {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const pending = changes.filter(c => c.status === 'In Review');
  const approved = changes.filter(c => c.status === 'Approvato');
  const rejected = changes.filter(c => c.status === 'Rifiutato');

  const lists = { pending, approved, rejected };
  const current = lists[tab];

  const tabs = [
    { key: 'pending' as const, label: 'In Attesa', count: pending.length, icon: <Clock size={14} /> },
    { key: 'approved' as const, label: 'Approvati', count: approved.length, icon: <CheckCircle size={14} /> },
    { key: 'rejected' as const, label: 'Rifiutati', count: rejected.length, icon: <XCircle size={14} /> },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all border ${
              tab === t.key
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-surface border-border text-text-2 hover:bg-surface-2'
            }`}
          >
            {t.icon} {t.label}
            <span className={`ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-surface-3 text-text-3'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        {current.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-[13px]">
            Nessun change in questa categoria
          </div>
        ) : (
          <div className="divide-y divide-border">
            {current.map(c => (
              <div key={c.id} className="p-4 hover:bg-surface-2 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => onOpenDetail(c.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-primary">{c.id}</span>
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                      <span className="bg-surface-3 text-text-2 px-2 py-0.5 rounded text-[10px] font-mono">{c.type}</span>
                    </div>
                    <div className="text-[14px] font-medium mb-1">{c.title}</div>
                    <div className="text-[12px] text-text-3 line-clamp-1">{c.desc}</div>
                    <div className="flex gap-4 mt-2 text-[11px] text-text-3">
                      <span>Richiedente: <span className="text-text-2">{c.requester}</span></span>
                      <span>Assegnatario: <span className="text-text-2">{c.assignee}</span></span>
                      <span>Rischio: <span className="text-text-2">{c.risk}</span></span>
                      <span>Finestra: <span className="text-text-2 font-mono">{c.window}</span></span>
                    </div>
                  </div>
                  {tab === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => onAdvance(c.id)}
                        className="flex items-center gap-1 bg-accent text-accent-foreground text-[12px] font-medium px-3 py-1.5 rounded-lg hover:brightness-110 transition-all"
                      >
                        <CheckCircle size={13} /> Approva
                      </button>
                      <button
                        onClick={() => onReject(c.id)}
                        className="flex items-center gap-1 bg-destructive text-destructive-foreground text-[12px] font-medium px-3 py-1.5 rounded-lg hover:brightness-110 transition-all"
                      >
                        <XCircle size={13} /> Rifiuta
                      </button>
                    </div>
                  )}
                  {tab === 'rejected' && (
                    <button
                      onClick={() => onOpenDetail(c.id)}
                      className="flex items-center gap-1 text-[12px] text-text-2 border border-border px-3 py-1.5 rounded-lg hover:bg-surface-2"
                    >
                      Dettagli <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
