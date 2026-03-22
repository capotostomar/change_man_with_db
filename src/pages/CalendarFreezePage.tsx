import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, AlertTriangle, Users, Wrench, X, Calendar as CalendarIcon } from 'lucide-react';
import { Change, FreezePeriod, FreezeEvent } from '@/data/changeData';
import { StatusBadge } from '@/components/StatusBadge';
import { PipelineInline } from '@/components/PipelineInline';

interface CalendarFreezePageProps {
  changes: Change[];
  freezePeriods: FreezePeriod[];
  freezeEvents: FreezeEvent[];
  onOpenDetail: (id: string) => void;
  onAddFreezePeriod: (period: Omit<FreezePeriod, 'id'>) => void;
  onAddFreezeEvent: (event: Omit<FreezeEvent, 'id'>) => void;
  onRemoveFreezeEvent: (id: string) => void;
  onRemoveFreezePeriod: (id: string) => void;
  getConflictsForDate: (date: string) => { eventsOnDate: FreezeEvent[]; changesOnDate: Change[]; conflicts: Array<{ type: string; items: string[]; description: string }> };
}

export function CalendarFreezePage({
  changes, freezePeriods, freezeEvents, onOpenDetail,
  onAddFreezePeriod, onAddFreezeEvent, onRemoveFreezeEvent, onRemoveFreezePeriod,
  getConflictsForDate,
}: CalendarFreezePageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddFreeze, setShowAddFreeze] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', endDate: '', type: 'maintenance' as const, assignee: '', technologies: '', description: '', changeId: '' });
  const [newFreeze, setNewFreeze] = useState({ name: '', start: '', end: '', envs: 'PROD', description: '' });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const dayNames = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

  const dayInfo = useMemo(() => {
    const info: Record<number, { hasChange: boolean; hasEvent: boolean; isFreeze: boolean; conflictCount: number }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const { eventsOnDate, changesOnDate, conflicts } = getConflictsForDate(dateStr);
      const isFreeze = freezePeriods.some(fp => dateStr >= fp.start && dateStr <= fp.end);
      info[d] = {
        hasChange: changesOnDate.length > 0,
        hasEvent: eventsOnDate.length > 0,
        isFreeze,
        conflictCount: conflicts.length,
      };
    }
    return info;
  }, [year, month, daysInMonth, getConflictsForDate, freezePeriods]);

  const selectedDateInfo = selectedDate ? getConflictsForDate(selectedDate) : null;

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    onAddFreezeEvent({
      title: newEvent.title,
      date: newEvent.date,
      endDate: newEvent.endDate || newEvent.date,
      type: newEvent.type,
      assignee: newEvent.assignee,
      technologies: newEvent.technologies.split(',').map(t => t.trim()).filter(Boolean),
      description: newEvent.description,
      changeId: newEvent.changeId,
    });
    setNewEvent({ title: '', date: '', endDate: '', type: 'maintenance', assignee: '', technologies: '', description: '', changeId: '' });
    setShowAddEvent(false);
  };

  const handleAddFreeze = () => {
    if (!newFreeze.name || !newFreeze.start || !newFreeze.end) return;
    onAddFreezePeriod({
      name: newFreeze.name,
      start: newFreeze.start,
      end: newFreeze.end,
      envs: newFreeze.envs.split(',').map(e => e.trim()),
      color: '#c084fc',
      description: newFreeze.description,
    });
    setNewFreeze({ name: '', start: '', end: '', envs: 'PROD', description: '' });
    setShowAddFreeze(false);
  };

  const eventTypeColors: Record<string, string> = {
    maintenance: 'hsl(var(--warning))',
    deploy: 'hsl(var(--accent))',
    meeting: 'hsl(var(--primary))',
    test: 'hsl(var(--purple))',
  };

  const eventTypeLabels: Record<string, string> = {
    maintenance: '🔧 Manutenzione',
    deploy: '🚀 Deploy',
    meeting: '📋 Meeting',
    test: '🧪 Test',
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-[1fr_380px] gap-4">
        {/* LEFT: Calendar + Freeze + Events */}
        <div className="space-y-4">
          {/* Calendar */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px]">
                Calendario — {monthNames[month]} {year}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button className="p-1 rounded hover:bg-surface-2 text-text-3" onClick={() => setCurrentMonth(new Date(year, month - 1))}>
                  <ChevronLeft size={16} />
                </button>
                <button className="p-1 rounded hover:bg-surface-2 text-text-3" onClick={() => setCurrentMonth(new Date(year, month + 1))}>
                  <ChevronRight size={16} />
                </button>
                <div className="flex gap-2 ml-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-primary">● Change</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-purple">● Freeze</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-warning">● Eventi</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-destructive">⚠ Conflitti</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {dayNames.map(d => (
                <div key={d} className="text-[10px] text-center text-text-3 font-semibold py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const info = dayInfo[day];
                const isSelected = selectedDate === dateStr;
                const today = new Date();
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square flex flex-col items-center justify-center text-[11px] rounded-md cursor-pointer transition-all relative ${
                      isSelected ? 'ring-2 ring-primary bg-primary/20 text-primary font-bold' :
                      isToday ? 'bg-primary text-primary-foreground font-bold' :
                      info?.isFreeze ? 'bg-purple/10 text-purple' :
                      info?.hasChange ? 'bg-primary/10 text-primary font-semibold' :
                      info?.hasEvent ? 'bg-warning/10 text-warning' :
                      'text-text-3 hover:bg-surface-3 hover:text-foreground'
                    }`}
                  >
                    {day}
                    <div className="flex gap-0.5 mt-0.5">
                      {info?.hasChange && !isToday && <div className="w-1 h-1 rounded-full bg-primary" />}
                      {info?.hasEvent && !isToday && <div className="w-1 h-1 rounded-full bg-warning" />}
                      {info?.isFreeze && !isToday && <div className="w-1 h-1 rounded-full bg-purple" />}
                    </div>
                    {info?.conflictCount > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive flex items-center justify-center text-[7px] text-primary-foreground font-bold">
                        {info.conflictCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Freeze Periods */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <div className="flex items-center mb-3">
              <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px]">Freeze Periods Configurati</div>
              <button className="ml-auto text-xs bg-purple/10 border border-purple/25 text-purple px-2.5 py-1 rounded-lg hover:bg-purple/20 flex items-center gap-1" onClick={() => setShowAddFreeze(true)}>
                <Plus size={12} /> Aggiungi Freeze
              </button>
            </div>
            {freezePeriods.map(f => (
              <div key={f.id} className="bg-purple/5 border border-purple/20 rounded-lg p-3 flex items-center gap-2.5 mb-2.5">
                <div className="text-lg">🔒</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-purple">{f.name}</div>
                  <div className="text-[11px] text-text-3 font-mono mt-0.5">{f.start} → {f.end} · Ambienti: {f.envs.join(', ')}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple/10 text-purple before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-purple`}>
                  {new Date(f.end) > new Date() ? 'Attivo' : 'Passato'}
                </span>
                <button className="text-text-3 hover:text-destructive transition" onClick={() => onRemoveFreezePeriod(f.id)}><X size={14} /></button>
              </div>
            ))}
          </div>

          {/* Events List */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <div className="flex items-center mb-3">
              <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px]">Eventi Pianificati</div>
              <button className="ml-auto text-xs bg-primary/10 border border-primary/25 text-primary px-2.5 py-1 rounded-lg hover:bg-primary/20 flex items-center gap-1" onClick={() => setShowAddEvent(true)}>
                <Plus size={12} /> Aggiungi Evento
              </button>
            </div>
            <div className="space-y-2">
              {freezeEvents.map(e => (
                <div key={e.id} className="flex items-start gap-3 p-3 bg-surface-2 rounded-lg">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: eventTypeColors[e.type] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{e.title}</div>
                    <div className="text-[11px] text-text-3 font-mono mt-0.5">{e.date}{e.endDate && e.endDate !== e.date ? ` → ${e.endDate}` : ''}</div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] bg-surface-3 text-text-2 px-1.5 py-0.5 rounded">{eventTypeLabels[e.type]}</span>
                      <span className="text-[10px] text-text-3">👤 {e.assignee}</span>
                      {e.technologies.map(t => (
                        <span key={t} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                  {e.changeId && (
                    <button className="text-[10px] font-mono text-primary hover:underline flex-shrink-0" onClick={() => onOpenDetail(e.changeId!)}>
                      {e.changeId}
                    </button>
                  )}
                  <button className="text-text-3 hover:text-destructive transition flex-shrink-0" onClick={() => onRemoveFreezeEvent(e.id)}><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Selected day detail + conflicts */}
        <div className="space-y-4">
          {selectedDate && selectedDateInfo ? (
            <>
              <div className="bg-surface border border-border rounded-[10px] p-5">
                <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3 flex items-center gap-2">
                  <CalendarIcon size={14} />
                  Dettaglio {selectedDate}
                </div>

                {/* Conflicts */}
                {selectedDateInfo.conflicts.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-destructive uppercase tracking-[1px] mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={12} /> Conflitti Rilevati ({selectedDateInfo.conflicts.length})
                    </div>
                    {selectedDateInfo.conflicts.map((conflict, i) => (
                      <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 mb-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          {conflict.type === 'person' ? <Users size={12} className="text-destructive" /> : <Wrench size={12} className="text-destructive" />}
                          <span className="text-[12px] font-semibold text-destructive">
                            {conflict.type === 'person' ? 'Conflitto Persona' : 'Conflitto Tecnologico'}
                          </span>
                        </div>
                        <div className="text-[12px] text-text-2">{conflict.description}</div>
                        <div className="flex flex-col gap-0.5 mt-1.5">
                          {conflict.items.map((item, j) => (
                            <div key={j} className="text-[11px] text-text-3 pl-3 border-l-2 border-destructive/30">{item}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Events on this day */}
                {selectedDateInfo.eventsOnDate.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-warning uppercase tracking-[1px] mb-2">Eventi ({selectedDateInfo.eventsOnDate.length})</div>
                    {selectedDateInfo.eventsOnDate.map(e => (
                      <div key={e.id} className="bg-surface-2 rounded-lg p-3 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: eventTypeColors[e.type] }} />
                          <span className="text-[13px] font-medium">{e.title}</span>
                        </div>
                        <div className="text-[11px] text-text-3">👤 {e.assignee}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {e.technologies.map(t => (
                            <span key={t} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                        {e.description && <div className="text-[11px] text-text-2 mt-1.5">{e.description}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Changes on this day */}
                {selectedDateInfo.changesOnDate.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-primary uppercase tracking-[1px] mb-2">Change Schedulati ({selectedDateInfo.changesOnDate.length})</div>
                    {selectedDateInfo.changesOnDate.map(c => (
                      <div key={c.id} className="bg-surface-2 rounded-lg p-3 mb-2 cursor-pointer hover:bg-surface-3 transition" onClick={() => onOpenDetail(c.id)}>
                        <div className="text-[11px] font-mono text-primary mb-1">{c.id}</div>
                        <div className="text-[13px] font-medium">{c.title}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <StatusBadge status={c.status} />
                          <PipelineInline change={c} />
                        </div>
                        <div className="text-[11px] text-text-3 mt-1">👤 {c.assignee} · {c.category}</div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDateInfo.eventsOnDate.length === 0 && selectedDateInfo.changesOnDate.length === 0 && selectedDateInfo.conflicts.length === 0 && (
                  <div className="text-text-3 text-[13px] text-center py-6">Nessuna attività pianificata per questa data</div>
                )}
              </div>

              {/* Freeze status for this day */}
              {freezePeriods.filter(fp => selectedDate >= fp.start && selectedDate <= fp.end).length > 0 && (
                <div className="bg-purple/5 border border-purple/20 rounded-[10px] p-4">
                  <div className="text-[11px] font-semibold text-purple uppercase tracking-[1px] mb-2">🔒 Freeze Period Attivo</div>
                  {freezePeriods.filter(fp => selectedDate >= fp.start && selectedDate <= fp.end).map(fp => (
                    <div key={fp.id}>
                      <div className="text-[13px] font-semibold text-purple">{fp.name}</div>
                      <div className="text-[11px] text-text-3 font-mono mt-0.5">{fp.start} → {fp.end}</div>
                      <div className="text-[11px] text-text-3 mt-0.5">Ambienti bloccati: {fp.envs.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface border border-border rounded-[10px] p-5 text-center">
              <div className="text-3xl mb-3">📅</div>
              <div className="text-[14px] font-semibold text-text-2 mb-2">Seleziona un giorno</div>
              <div className="text-[13px] text-text-3">Clicca su un giorno nel calendario per vedere change, eventi e conflitti</div>
            </div>
          )}

          {/* Quick scheduled changes */}
          <div className="bg-surface border border-border rounded-[10px] p-5">
            <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-3">Change Schedulati</div>
            {changes.filter(c => c.window !== 'TBD').slice(0, 6).map(c => (
              <div key={c.id} className="py-2 border-b border-border cursor-pointer hover:bg-surface-2 px-1 rounded" onClick={() => onOpenDetail(c.id)}>
                <div className="text-[11px] font-mono text-primary mb-0.5">{c.window}</div>
                <div className="text-[13px] font-medium">{c.title}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <StatusBadge status={c.status} />
                  <PipelineInline change={c} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowAddEvent(false)}>
          <div className="bg-surface border border-border rounded-xl w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex items-start gap-3">
              <div>
                <div className="text-[17px] font-semibold">Nuovo Evento</div>
                <div className="text-[13px] text-text-2 mt-0.5">Aggiungi un evento al calendario per rilevare conflitti</div>
              </div>
              <button className="ml-auto text-text-3 hover:text-foreground text-xl" onClick={() => setShowAddEvent(false)}>✕</button>
            </div>
            <div className="px-6 py-5 space-y-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Titolo *</label>
                <input className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Data Inizio *</label>
                  <input type="date" className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Data Fine</label>
                  <input type="date" className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newEvent.endDate} onChange={e => setNewEvent(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Tipo</label>
                  <select className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value as any }))}>
                    <option value="maintenance">🔧 Manutenzione</option>
                    <option value="deploy">🚀 Deploy</option>
                    <option value="meeting">📋 Meeting</option>
                    <option value="test">🧪 Test</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Assegnato a</label>
                  <input className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newEvent.assignee} onChange={e => setNewEvent(p => ({ ...p, assignee: e.target.value }))} placeholder="Nome persona" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Tecnologie (separate da virgola)</label>
                <input className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newEvent.technologies} onChange={e => setNewEvent(p => ({ ...p, technologies: e.target.value }))} placeholder="Oracle, Network, Docker..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Change collegato</label>
                <select className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newEvent.changeId} onChange={e => setNewEvent(p => ({ ...p, changeId: e.target.value }))}>
                  <option value="">Nessuno</option>
                  {changes.map(c => <option key={c.id} value={c.id}>{c.id} — {c.title}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Descrizione</label>
                <textarea className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary min-h-[70px] resize-y" value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-2 justify-end">
              <button className="text-[13px] text-text-2 border border-border rounded-lg px-4 py-2 hover:bg-surface-2" onClick={() => setShowAddEvent(false)}>Annulla</button>
              <button className="text-[13px] bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:brightness-110" onClick={handleAddEvent}>✓ Aggiungi Evento</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Freeze Modal */}
      {showAddFreeze && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowAddFreeze(false)}>
          <div className="bg-surface border border-border rounded-xl w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex items-start gap-3">
              <div>
                <div className="text-[17px] font-semibold">Nuovo Freeze Period</div>
                <div className="text-[13px] text-text-2 mt-0.5">Blocca i cambiamenti su ambienti specifici</div>
              </div>
              <button className="ml-auto text-text-3 hover:text-foreground text-xl" onClick={() => setShowAddFreeze(false)}>✕</button>
            </div>
            <div className="px-6 py-5 space-y-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Nome *</label>
                <input className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newFreeze.name} onChange={e => setNewFreeze(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Data Inizio *</label>
                  <input type="date" className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newFreeze.start} onChange={e => setNewFreeze(p => ({ ...p, start: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Data Fine *</label>
                  <input type="date" className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newFreeze.end} onChange={e => setNewFreeze(p => ({ ...p, end: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Ambienti (separati da virgola)</label>
                <input className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary" value={newFreeze.envs} onChange={e => setNewFreeze(p => ({ ...p, envs: e.target.value }))} placeholder="PROD, CERT" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex gap-2 justify-end">
              <button className="text-[13px] text-text-2 border border-border rounded-lg px-4 py-2 hover:bg-surface-2" onClick={() => setShowAddFreeze(false)}>Annulla</button>
              <button className="text-[13px] bg-purple text-purple-foreground rounded-lg px-4 py-2 hover:brightness-110" onClick={handleAddFreeze}>✓ Aggiungi Freeze</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
