import { Change, statusConfig, wfSteps, ENVS, ENV_COLORS } from '@/data/changeData';
import { StatusBadge, PriorityBadge, RiskBadge, TypeBadge } from '@/components/StatusBadge';
import { PipelineInline } from '@/components/PipelineInline';
import { useState } from 'react';

interface ChangeDetailModalProps {
  change: Change;
  changes: Change[];
  onClose: () => void;
  onAdvance: (id: string) => void;
  onReject: (id: string) => void;
  onReopen: (id: string) => void;
  onPromote: (id: string) => void;
  onAddComment: (changeId: string, text: string) => void;
}

export function ChangeDetailModal({ change: c, changes, onClose, onAdvance, onReject, onReopen, onPromote, onAddComment }: ChangeDetailModalProps) {
  const [activeTab, setActiveTab] = useState('detail');
  const [commentText, setCommentText] = useState('');

  const wfI = statusConfig[c.status]?.wf ?? 0;

  const canPromoteChange = () => {
    if (['Chiuso', 'Rifiutato'].includes(c.status)) return false;
    if (c.deps?.length > 0 && c.deps.some(depId => { const dep = changes.find(x => x.id === depId); return dep && dep.status !== 'Chiuso'; })) return false;
    return ['Approvato', 'Schedulato', 'Implementazione'].includes(c.status) && c.currentEnv < 3;
  };

  const tabs = ['Dettagli', 'Pipeline', 'Dipendenze', 'Attività', 'Commenti'];
  const tabIds = ['detail', 'pipeline', 'deps', 'activity', 'comments'];

  const handleComment = () => {
    if (!commentText.trim()) return;
    onAddComment(c.id, commentText);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface border border-border rounded-xl w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start gap-3">
          <div className="flex-1">
            <div className="text-[17px] font-semibold">{c.id} — {c.title}</div>
            <div className="flex gap-1.5 flex-wrap mt-1.5">
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
              <TypeBadge type={c.type} />
              {c.pipelineStrategy === 'direct' && (
                <span className="bg-destructive/10 border border-destructive/25 rounded text-[10px] text-destructive px-1.5 py-0.5 font-mono">DIRECT TO PROD</span>
              )}
            </div>
          </div>
          <button className="text-text-3 hover:text-foreground text-xl" onClick={onClose}>✕</button>
        </div>

        {/* Workflow stepper */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-start">
            {wfSteps.map((step, i) => (
              <div key={step} className="flex-1 text-center relative">
                {i < wfSteps.length - 1 && (
                  <div className="absolute top-[14px] left-1/2 right-[-50%] h-0.5" style={{ background: i < wfI ? 'hsl(var(--accent))' : 'hsl(var(--border))' }} />
                )}
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 ${
                    i < wfI ? 'bg-accent border-accent text-accent-foreground' :
                    i === wfI && c.status !== 'Rifiutato' ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_14px_rgba(79,124,255,0.5)]' :
                    c.status === 'Rifiutato' && i === 1 ? 'bg-destructive border-destructive text-destructive-foreground' :
                    'bg-surface-2 border-border text-text-3'
                  }`}>
                    {i < wfI ? '✓' : (c.status === 'Rifiutato' && i === 1 ? '✕' : i + 1)}
                  </div>
                  <div className={`text-[10px] font-medium ${i <= wfI ? 'text-foreground' : 'text-text-3'}`}>{step}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval bar */}
        {c.status === 'In Review' && (
          <div className="mx-6 mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2.5">
            <span className="text-[13px] text-text-2 flex-1">Questo change è in attesa di approvazione CAB.</span>
            <button className="bg-accent/10 border border-accent/30 text-accent text-[13px] font-medium px-3 py-1.5 rounded-lg hover:bg-accent/20" onClick={() => onAdvance(c.id)}>✓ Approva</button>
            <button className="bg-destructive/10 border border-destructive/30 text-destructive text-[13px] font-medium px-3 py-1.5 rounded-lg hover:bg-destructive/20" onClick={() => onReject(c.id)}>✕ Rifiuta</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border mx-6 mt-4">
          {tabs.map((tab, i) => (
            <div key={tab} onClick={() => setActiveTab(tabIds[i])}
              className={`px-4 py-2 text-[13px] font-medium cursor-pointer border-b-2 transition ${
                activeTab === tabIds[i] ? 'text-primary border-primary' : 'text-text-3 border-transparent hover:text-foreground'
              }`}
            >{tab}</div>
          ))}
        </div>

        <div className="px-6 py-5">
          {/* Detail tab */}
          {activeTab === 'detail' && (
            <div className="grid grid-cols-[1fr_260px] gap-4">
              <div>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {[
                    ['Richiedente', c.requester],
                    ['Assegnato a', c.assignee],
                    ['Team', c.team],
                    ['Categoria CI', c.category],
                    ['Finestra', c.window],
                    ['Rischio', c.risk],
                    ['Impatto', c.impact],
                    ['Aperto il', c.opened],
                    ['Pipeline', c.pipelineStrategy],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-[10px] font-semibold uppercase tracking-[1px] text-text-3 mb-0.5">{label}</div>
                      <div className="text-[13px]">{label === 'Rischio' || label === 'Impatto' ? <RiskBadge risk={value} /> : <span className={label === 'Finestra' || label === 'Aperto il' || label === 'Pipeline' ? 'font-mono text-xs text-text-2' : ''}>{value}</span>}</div>
                    </div>
                  ))}
                </div>
                {c.involvedResources && c.involvedResources.length > 0 && (
                  <div className="bg-surface-2 rounded-lg p-3 mb-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[1px] text-text-3 mb-1.5">Risorse Coinvolte</div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.involvedResources.map(r => (
                        <span key={r} className="bg-primary/10 border border-primary/20 text-primary text-[11px] px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-surface-2 rounded-lg p-3 mb-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[1px] text-text-3 mb-1.5">Descrizione</div>
                  <p className="text-[13px] leading-relaxed text-text-2">{c.desc}</p>
                </div>
                <div className="bg-surface-2 rounded-lg p-3 mb-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[1px] text-text-3 mb-1.5">Piano di Rollback</div>
                  <p className="text-[13px] leading-relaxed text-text-2">{c.rollback}</p>
                </div>
                <div className="bg-surface-2 rounded-lg p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[1px] text-text-3 mb-1.5">Test Plan</div>
                  <p className="text-[13px] leading-relaxed text-text-2">{c.test}</p>
                </div>
              </div>
              <div>
                <div className="bg-surface border border-border rounded-[10px] p-4 mb-3">
                  <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3">Azioni</div>
                  <div className="space-y-2">
                    {c.status === 'Aperto' && <button className="w-full bg-primary text-primary-foreground text-[13px] py-2 rounded-lg" onClick={() => onAdvance(c.id)}>→ Invia per Review</button>}
                    {c.status === 'Approvato' && <button className="w-full bg-primary text-primary-foreground text-[13px] py-2 rounded-lg" onClick={() => onAdvance(c.id)}>📅 Schedula</button>}
                    {c.status === 'Schedulato' && <button className="w-full bg-primary text-primary-foreground text-[13px] py-2 rounded-lg" onClick={() => onAdvance(c.id)}>▶ Avvia Implementazione</button>}
                    {c.status === 'Implementazione' && <button className="w-full bg-accent/10 border border-accent/30 text-accent text-[13px] py-2 rounded-lg" onClick={() => onAdvance(c.id)}>✓ Chiudi con Successo</button>}
                    {['Chiuso', 'Rifiutato'].includes(c.status) && <button className="w-full border border-border text-text-2 text-[13px] py-2 rounded-lg hover:bg-surface-2" onClick={() => onReopen(c.id)}>🔄 Riapri</button>}
                    {!['Chiuso', 'Rifiutato'].includes(c.status) && <button className="w-full bg-destructive/10 border border-destructive/30 text-destructive text-[13px] py-2 rounded-lg" onClick={() => onReject(c.id)}>✕ Rifiuta</button>}
                  </div>
                </div>
                {c.incidents.length > 0 && (
                  <div className="bg-surface border border-border rounded-[10px] p-4">
                    <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3">Incidenti</div>
                    {c.incidents.map(inc => (
                      <div key={inc.id} className="text-[12px] mb-2">
                        <span className="font-mono text-destructive">{inc.id}</span>
                        <span className="text-text-2 ml-1">— {inc.desc}</span>
                        <span className="text-warning ml-1">[{inc.sev}]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pipeline tab */}
          {activeTab === 'pipeline' && (
            <div>
              <div className="bg-surface-2 rounded-[10px] p-4 mb-3.5">
                <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3">Avanzamento per Ambiente</div>
                {ENVS.map((env, i) => {
                  const s = c.pipeline[i];
                  const color = s === 'done' || s === 'active' ? ENV_COLORS[env] : s === 'failed' ? '#ff6b6b' : s === 'skip' ? '#c084fc' : 'hsl(var(--text-3))';
                  const labels: Record<string, string> = { done: '✓ Completato', active: '▶ In corso', failed: '✕ Fallito', skip: '⤵ Saltato', pending: '○ In attesa' };
                  return (
                    <div key={env} className="flex items-center gap-0 w-full py-2.5 border-b border-border last:border-0">
                      <div className="w-20 text-xs font-mono font-semibold" style={{ color }}>{env}</div>
                      <div className="flex-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: `${color}22`, color }}>{labels[s]}</span>
                      </div>
                      <div className="w-32 text-right text-[10px] text-text-3 font-mono">{['done', 'active'].includes(s) ? `${c.opened} (est)` : '—'}</div>
                      <div className="w-24 text-right">
                        {s === 'active' && canPromoteChange() && (
                          <button className="bg-accent/10 border border-accent/25 text-accent px-2 py-0.5 rounded text-[11px] hover:bg-accent/20" onClick={() => onPromote(c.id)}>Promuovi →</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {canPromoteChange() && (
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-[13px] text-text-2">Pronto per promozione a <strong className="text-accent">{ENVS[c.currentEnv + 1] || 'PROD'}</strong></span>
                  <button className="bg-accent/10 border border-accent/25 text-accent text-[13px] px-3 py-1.5 rounded-lg hover:bg-accent/20" onClick={() => onPromote(c.id)}>▶ Promuovi ora</button>
                </div>
              )}
            </div>
          )}

          {/* Deps tab */}
          {activeTab === 'deps' && (
            <div>
              <div className="mb-4">
                <div className="text-[11px] font-semibold uppercase tracking-[1px] text-text-3 mb-2">Questo change dipende da</div>
                {c.deps.length > 0 ? c.deps.map(depId => {
                  const dep = changes.find(x => x.id === depId);
                  const blocked = dep && dep.status !== 'Chiuso';
                  return (
                    <div key={depId} className="flex items-center gap-2.5 p-3 bg-surface-2 rounded-lg mb-2">
                      <span className="text-lg">{blocked ? '🔴' : '🟢'}</span>
                      <span className="text-text-3">←</span>
                      <div className="flex-1">
                        <div className="text-[11px] font-mono text-primary">{depId}</div>
                        <div className="text-xs text-text-2">{dep?.title || '—'}</div>
                      </div>
                      {dep && <StatusBadge status={dep.status} />}
                      {blocked ? <span className="text-[11px] text-destructive">⚠ Non completato</span> : <span className="text-[11px] text-accent">✓ OK</span>}
                    </div>
                  );
                }) : <div className="text-text-3 text-[13px] p-2">Nessuna dipendenza</div>}
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[1px] text-text-3 mb-2">Bloccato da questo change</div>
                {changes.filter(x => x.deps?.includes(c.id)).map(dep => (
                  <div key={dep.id} className="flex items-center gap-2.5 p-3 bg-surface-2 rounded-lg mb-2">
                    <span className="text-lg">⏳</span>
                    <span className="text-text-3">→</span>
                    <div className="flex-1">
                      <div className="text-[11px] font-mono text-primary">{dep.id}</div>
                      <div className="text-xs text-text-2">{dep.title}</div>
                    </div>
                    <StatusBadge status={dep.status} />
                  </div>
                )) || <div className="text-text-3 text-[13px] p-2">Nessun change in attesa</div>}
              </div>
            </div>
          )}

          {/* Activity tab */}
          {activeTab === 'activity' && (
            <div>
              {[
                { icon: '📝', header: `Change aperto da ${c.requester}`, time: `${c.opened} 09:00` },
                { icon: '🔍', header: 'Inviato per review CAB', time: `${c.opened} 14:00` },
                { icon: '✅', header: 'Approvato dal CAB', time: `${c.opened} +2d` },
                { icon: '📅', header: 'Schedulato', time: `${c.opened} +3d` },
                { icon: '⚙️', header: 'Implementazione avviata', time: `${c.opened} +4d` },
                { icon: '🏁', header: 'Change chiuso con successo', time: `${c.opened} +5d` },
              ].slice(0, Math.max(0, wfI + 1)).reverse().map((t, i) => (
                <div key={i} className="flex gap-2.5 mb-3.5">
                  <div className="w-7 h-7 rounded-full bg-surface-2 border-2 border-border flex-shrink-0 flex items-center justify-center text-[11px]">{t.icon}</div>
                  <div>
                    <div className="text-[13px] font-medium">{t.header}</div>
                    <div className="text-[10px] text-text-3 font-mono mt-0.5">{t.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comments tab */}
          {activeTab === 'comments' && (
            <div>
              {c.comments.length > 0 ? c.comments.map((cm, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-semibold text-primary-foreground flex-shrink-0">{cm.avatar}</div>
                  <div className="bg-surface-2 rounded-lg p-2.5 flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold">{cm.user}</span>
                      <span className="text-[10px] text-text-3 font-mono">{cm.time}</span>
                    </div>
                    <div className="text-[13px] text-text-2 leading-relaxed mt-1">{cm.text}</div>
                  </div>
                </div>
              )) : (
                <div className="text-text-3 text-[13px] mb-3">Nessun commento.</div>
              )}
              <div className="flex gap-2 mt-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-semibold text-primary-foreground flex-shrink-0">MA</div>
                <textarea className="flex-1 min-h-[54px] bg-surface-2 border border-border rounded-lg p-2.5 text-[13px] text-foreground outline-none focus:border-primary resize-y" placeholder="Aggiungi un commento..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                <button className="bg-primary text-primary-foreground text-[13px] px-3 rounded-lg self-end py-2" onClick={handleComment}>Invia</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
