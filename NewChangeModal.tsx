import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Change, ENVS, Incident, TEAMS, MOCK_USERS } from '@/data/changeData';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NewChangeModalProps {
  changes: Change[];
  incidents: Incident[];
  onClose: () => void;
  onSubmit: (change: Omit<Change, 'id'>) => void;
}

const ALL_PEOPLE = ['A. Russo', 'M. Albini', 'L. Ferri', 'G. Bianchi', 'S. Conte'];

export function NewChangeModal({ changes, incidents, onClose, onSubmit }: NewChangeModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Change['type']>('Standard');
  const [priority, setPriority] = useState<Change['priority']>('Media');
  const [category, setCategory] = useState('Database');
  const [assignee, setAssignee] = useState('A. Russo');
  const [team, setTeam] = useState(TEAMS[0]);
  const [involvedResources, setInvolvedResources] = useState<string[]>([]);
  const [desc, setDesc] = useState('');
  const [risk, setRisk] = useState('Basso');
  const [impact, setImpact] = useState('Basso');
  const [rollback, setRollback] = useState('');
  const [test, setTest] = useState('');
  const [strategy, setStrategy] = useState<'full' | 'skip-dev' | 'direct' | 'custom'>('full');
  const [deps, setDeps] = useState<string[]>([]);
  const [customEnvs, setCustomEnvs] = useState<string[]>([]);
  const [envDates, setEnvDates] = useState<Record<string, Date | undefined>>({});
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);

  const strategyPreviews: Record<string, string> = {
    full: 'DEV → INTEG → CERT → PROD',
    'skip-dev': 'INTEG → CERT → PROD',
    direct: '⚡ PROD direttamente (richiede approvazione speciale)',
    custom: `Personalizzato: ${customEnvs.length > 0 ? customEnvs.join(' → ') : 'seleziona ambienti'}`,
  };

  const activeEnvs = useMemo(() => {
    if (strategy === 'full') return [...ENVS];
    if (strategy === 'skip-dev') return ['INTEG', 'CERT', 'PROD'];
    if (strategy === 'direct') return ['PROD'];
    return customEnvs;
  }, [strategy, customEnvs]);

  const toggleCustomEnv = (env: string) => {
    setCustomEnvs(prev => prev.includes(env) ? prev.filter(e => e !== env) : [...prev, env]);
  };

  const toggleInvolvedResource = (person: string) => {
    setInvolvedResources(prev => prev.includes(person) ? prev.filter(p => p !== person) : [...prev, person]);
  };

  const toggleIncident = (incId: string) => {
    setSelectedIncidents(prev => prev.includes(incId) ? prev.filter(i => i !== incId) : [...prev, incId]);
  };

  const setEnvDate = (env: string, date: Date | undefined) => {
    setEnvDates(prev => ({ ...prev, [env]: date }));
  };

  const handleSubmit = () => {
    if (!title.trim()) return alert('Inserisci il titolo');
    if (strategy === 'custom' && customEnvs.length === 0) return alert('Seleziona almeno un ambiente');

    const today = new Date().toISOString().split('T')[0];
    let pipeline: Change['pipeline'], startEnv: number;

    if (strategy === 'direct') { pipeline = ['skip', 'skip', 'skip', 'active']; startEnv = 3; }
    else if (strategy === 'skip-dev') { pipeline = ['skip', 'active', 'pending', 'pending']; startEnv = 1; }
    else if (strategy === 'custom') {
      pipeline = ENVS.map((env) => customEnvs.includes(env) ? 'pending' : 'skip') as Change['pipeline'];
      const firstActiveIdx = ENVS.findIndex(env => customEnvs.includes(env));
      if (firstActiveIdx >= 0) pipeline[firstActiveIdx] = 'active';
      startEnv = firstActiveIdx >= 0 ? firstActiveIdx : 0;
    }
    else { pipeline = ['active', 'pending', 'pending', 'pending']; startEnv = 0; }

    const envDatesStr: Record<string, string> = {};
    Object.entries(envDates).forEach(([env, date]) => {
      if (date && activeEnvs.includes(env)) {
        envDatesStr[env] = format(date, 'yyyy-MM-dd');
      }
    });

    const firstDate = activeEnvs.map(env => envDatesStr[env]).filter(Boolean)[0];
    const linkedIncidents = incidents.filter(i => selectedIncidents.includes(i.id));

    const parts = user?.name?.split(' ') ?? [];
    const requesterName = parts.length >= 2
      ? `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`
      : (user?.name ?? 'Sconosciuto');

    onSubmit({
      title, type, priority, category, assignee, team, involvedResources,
      desc: desc || 'Nessuna descrizione.',
      risk, impact, rollback: rollback || 'Da definire.', test: test || 'Da definire.',
      status: 'Aperto', requester: requesterName, opened: today,
      window: firstDate ? `${firstDate} 22:00` : 'TBD',
      pipeline, pipelineStrategy: strategy, currentEnv: startEnv,
      envDates: envDatesStr,
      customEnvs: strategy === 'custom' ? customEnvs : undefined,
      deps, blocks: [],
      incidents: linkedIncidents,
      relatedIncidentIds: selectedIncidents,
      comments: [],
    } as any);
    onClose();
  };

  const inputClass = "bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary";
  const labelClass = "text-[11px] font-semibold text-text-2 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface border border-border rounded-xl w-[760px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex items-start gap-3">
          <div>
            <div className="text-[17px] font-semibold">Nuovo Change Request</div>
            <div className="text-[13px] text-text-2 mt-0.5">Compila tutti i campi obbligatori</div>
          </div>
          <button className="ml-auto text-text-3 hover:text-foreground text-xl" onClick={onClose}>✕</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* General info */}
          <div className="border-b border-border pb-5">
            <div className="text-xs font-semibold text-text-2 uppercase tracking-wide mb-3 flex items-center gap-1.5">📋 Informazioni Generali</div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Titolo *</label>
                <input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} placeholder="Descrizione breve..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Tipo *</label>
                  <select className={inputClass} value={type} onChange={e => setType(e.target.value as any)}>
                    <option>Standard</option><option>Normale</option><option>Emergenza</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Priorità *</label>
                  <select className={inputClass} value={priority} onChange={e => setPriority(e.target.value as any)}>
                    <option>Bassa</option><option>Media</option><option>Alta</option><option>Critica</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Categoria CI</label>
                  <select className={inputClass} value={category} onChange={e => setCategory(e.target.value)}>
                    {['Database', 'Network', 'Server', 'Applicazioni', 'Storage', 'Security'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Team</label>
                  <select className={inputClass} value={team} onChange={e => setTeam(e.target.value)}>
                    {TEAMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Assegnato a</label>
                  <select className={inputClass} value={assignee} onChange={e => setAssignee(e.target.value)}>
                    {ALL_PEOPLE.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              {/* Involved resources */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>👥 Risorse Coinvolte</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PEOPLE.filter(p => p !== assignee).map(person => (
                    <button
                      key={person}
                      type="button"
                      onClick={() => toggleInvolvedResource(person)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[12px] font-medium border transition",
                        involvedResources.includes(person)
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-surface-2 border-border text-text-3 hover:border-primary/30"
                      )}
                    >
                      {person}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Descrizione *</label>
                <textarea className={cn(inputClass, "min-h-[70px] resize-y")} value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Incidents linking */}
          {incidents.length > 0 && (
            <div className="border-b border-border pb-5">
              <div className="text-xs font-semibold text-text-2 uppercase tracking-wide mb-3 flex items-center gap-1.5">🔥 Incidenti Correlati</div>
              <div className="space-y-1.5">
                {incidents.map(inc => (
                  <button
                    key={inc.id}
                    type="button"
                    onClick={() => toggleIncident(inc.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition",
                      selectedIncidents.includes(inc.id)
                        ? "bg-destructive/5 border-destructive/30"
                        : "bg-surface-2 border-border hover:border-primary/30"
                    )}
                  >
                    <input type="checkbox" checked={selectedIncidents.includes(inc.id)} readOnly className="accent-destructive" />
                    <span className="text-[11px] font-mono text-destructive">{inc.id}</span>
                    <span className="text-[12px] text-text-2 flex-1 truncate">{inc.desc}</span>
                    <span className="text-[10px] font-mono bg-surface-3 px-1.5 py-0.5 rounded text-text-3">{inc.sev}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline strategy */}
          <div className="border-b border-border pb-5">
            <div className="text-xs font-semibold text-text-2 uppercase tracking-wide mb-3 flex items-center gap-1.5">🌍 Pipeline Ambienti</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Strategia Deployment</label>
                  <select className={inputClass} value={strategy} onChange={e => setStrategy(e.target.value as any)}>
                    <option value="full">Completo: DEV → INTEG → CERT → PROD</option>
                    <option value="skip-dev">Skip DEV: INTEG → CERT → PROD</option>
                    <option value="direct">Direct to PROD (solo Emergenza)</option>
                    <option value="custom">Personalizzato (scegli ambienti)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Anteprima</label>
                  <div className="bg-surface-2 rounded-lg px-3 py-2 text-xs font-mono text-text-2">{strategyPreviews[strategy]}</div>
                </div>
              </div>

              {strategy === 'custom' && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Seleziona Ambienti</label>
                  <div className="flex gap-2">
                    {ENVS.map(env => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => toggleCustomEnv(env)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[12px] font-mono font-semibold border transition",
                          customEnvs.includes(env)
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-surface-2 border-border text-text-3 hover:border-primary/30"
                        )}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeEnvs.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>📅 Pianificazione Date per Ambiente</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {activeEnvs.map(env => (
                      <div key={env} className="flex items-center gap-2 bg-surface-2 rounded-lg p-2.5 border border-border">
                        <span className="text-[11px] font-mono font-semibold text-primary w-12">{env}</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "flex-1 flex items-center gap-2 text-left text-[12px] border border-border rounded-md px-2.5 py-1.5 hover:bg-surface-3 transition",
                                !envDates[env] && "text-text-3"
                              )}
                            >
                              <CalendarIcon size={12} />
                              {envDates[env] ? format(envDates[env]!, 'dd/MM/yyyy') : 'Seleziona data...'}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={envDates[env]}
                              onSelect={(date) => setEnvDate(env, date)}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        {envDates[env] && (
                          <button type="button" className="text-text-3 hover:text-destructive text-xs" onClick={() => setEnvDate(env, undefined)}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Risk */}
          <div className="border-b border-border pb-5">
            <div className="text-xs font-semibold text-text-2 uppercase tracking-wide mb-3 flex items-center gap-1.5">🛡 Rischio & Rollback</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Rischio</label>
                <select className={inputClass} value={risk} onChange={e => setRisk(e.target.value)}>
                  <option>Basso</option><option>Medio</option><option>Alto</option><option>Critico</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Impatto</label>
                <select className={inputClass} value={impact} onChange={e => setImpact(e.target.value)}>
                  <option>Basso</option><option>Medio</option><option>Alto</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Piano di Rollback</label>
                <textarea className={cn(inputClass, "min-h-[60px] resize-y")} value={rollback} onChange={e => setRollback(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Test Plan</label>
                <textarea className={cn(inputClass, "min-h-[60px] resize-y")} value={test} onChange={e => setTest(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Deps */}
          <div>
            <div className="text-xs font-semibold text-text-2 uppercase tracking-wide mb-3 flex items-center gap-1.5">🔗 Dipendenze</div>
            <select className={cn(inputClass, "w-full")} multiple value={deps} onChange={e => setDeps(Array.from(e.target.selectedOptions, o => o.value))}>
              {changes.filter(c => c.status !== 'Chiuso').map(c => <option key={c.id} value={c.id}>{c.id} — {c.title}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-2 justify-end">
          <button className="text-[13px] text-text-2 border border-border rounded-lg px-4 py-2 hover:bg-surface-2" onClick={onClose}>Annulla</button>
          <button className="text-[13px] bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:brightness-110" onClick={handleSubmit}>✓ Invia Change Request</button>
        </div>
      </div>
    </div>
  );
}
