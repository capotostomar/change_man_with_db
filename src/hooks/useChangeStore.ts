import { useState, useCallback } from 'react';
import { 
  Change, FreezePeriod, FreezeEvent, Incident,
  initialChanges, initialFreezePeriods, initialFreezeEvents, initialIncidents,
  ENVS, wfSteps, statusConfig
} from '@/data/changeData';

export function useChangeStore() {
  const [changes, setChanges] = useState<Change[]>(initialChanges);
  const [freezePeriods, setFreezePeriods] = useState<FreezePeriod[]>(initialFreezePeriods);
  const [freezeEvents, setFreezeEvents] = useState<FreezeEvent[]>(initialFreezeEvents);
  const [incidents] = useState<Incident[]>(initialIncidents);
  const [notifications, setNotifications] = useState<Array<{ text: string; time: string; read: boolean }>>([
    { text: 'CHG-2025-008 è in attesa di approvazione CAB', time: '10 min fa', read: false },
    { text: 'CHG-2025-001 promosso da DEV a INTEG con successo', time: '2 ore fa', read: false },
    { text: 'Nuovo incidente INC-0051 collegato a CHG-2025-005', time: '5 ore fa', read: false },
  ]);

  const addNotification = useCallback((text: string) => {
    setNotifications(prev => [{ text, time: 'Adesso', read: false }, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const advanceStatus = useCallback((id: string) => {
    setChanges(prev => prev.map(c => {
      if (c.id !== id) return c;
      const wfI = statusConfig[c.status]?.wf ?? 0;
      if (wfI < wfSteps.length - 1) {
        addNotification(`${c.id}: stato → "${wfSteps[wfI + 1]}"`);
        return { ...c, status: wfSteps[wfI + 1] };
      }
      return c;
    }));
  }, [addNotification]);

  const rejectChange = useCallback((id: string) => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'Rifiutato' } : c));
  }, []);

  const reopenChange = useCallback((id: string) => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'Aperto' } : c));
  }, []);

  const promoteChange = useCallback((id: string) => {
    setChanges(prev => prev.map(c => {
      if (c.id !== id || c.currentEnv >= 3) return c;
      const newPipeline = [...c.pipeline];
      newPipeline[c.currentEnv] = 'done';
      const newEnv = c.currentEnv + 1;
      newPipeline[newEnv] = 'active';
      const newStatus = newEnv === 3 ? 'Implementazione' : c.status;
      addNotification(`${c.id} promosso a ${ENVS[newEnv]}`);
      return { ...c, pipeline: newPipeline, currentEnv: newEnv, status: newStatus };
    }));
  }, [addNotification]);

  const addChange = useCallback((change: Omit<Change, 'id'>) => {
    const num = String(changes.length + 1).padStart(3, '0');
    const id = `CHG-2025-${num}`;
    const newChange = { ...change, id } as Change;
    setChanges(prev => [newChange, ...prev]);
    addNotification(`Nuovo change ${id} creato: "${change.title}"`);
    return id;
  }, [changes.length, addNotification]);

  const addComment = useCallback((changeId: string, text: string) => {
    const now = new Date().toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    setChanges(prev => prev.map(c =>
      c.id === changeId
        ? { ...c, comments: [...c.comments, { user: 'Marco Albini', avatar: 'MA', time: now, text }] }
        : c
    ));
  }, []);

  const addFreezePeriod = useCallback((period: Omit<FreezePeriod, 'id'>) => {
    const id = `f${Date.now()}`;
    setFreezePeriods(prev => [...prev, { ...period, id }]);
    addNotification(`Nuovo freeze period: "${period.name}"`);
  }, [addNotification]);

  const addFreezeEvent = useCallback((event: Omit<FreezeEvent, 'id'>) => {
    const id = `fe${Date.now()}`;
    setFreezeEvents(prev => [...prev, { ...event, id }]);
    addNotification(`Nuovo evento freeze: "${event.title}"`);
  }, [addNotification]);

  const removeFreezeEvent = useCallback((id: string) => {
    setFreezeEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const removeFreezePeriod = useCallback((id: string) => {
    setFreezePeriods(prev => prev.filter(p => p.id !== id));
  }, []);

  // Conflict detection
  const getConflictsForDate = useCallback((date: string) => {
    const eventsOnDate = freezeEvents.filter(e => {
      const start = e.date;
      const end = e.endDate || e.date;
      return date >= start && date <= end;
    });

    const changesOnDate = changes.filter(c => {
      if (c.window === 'TBD') return false;
      const windowDate = c.window.split(' ')[0];
      return windowDate === date;
    });

    const conflicts: Array<{ type: 'person' | 'technology'; items: string[]; description: string }> = [];

    // Person conflicts
    const assignees = new Map<string, string[]>();
    [...eventsOnDate, ...changesOnDate.map(c => ({ assignee: c.assignee, title: c.title }))].forEach((item: any) => {
      const name = item.assignee;
      if (!assignees.has(name)) assignees.set(name, []);
      assignees.get(name)!.push(item.title);
    });
    assignees.forEach((items, person) => {
      if (items.length > 1) {
        conflicts.push({ type: 'person', items, description: `${person} è assegnato a ${items.length} attività` });
      }
    });

    // Technology conflicts
    const techMap = new Map<string, string[]>();
    eventsOnDate.forEach(e => {
      e.technologies.forEach(tech => {
        if (!techMap.has(tech)) techMap.set(tech, []);
        techMap.get(tech)!.push(e.title);
      });
    });
    changesOnDate.forEach(c => {
      const tech = c.category;
      if (!techMap.has(tech)) techMap.set(tech, []);
      techMap.get(tech)!.push(c.title);
    });
    techMap.forEach((items, tech) => {
      if (items.length > 1) {
        conflicts.push({ type: 'technology', items, description: `Tecnologia "${tech}" impattata da ${items.length} attività` });
      }
    });

    // Freeze period conflicts
    const activeFreeze = freezePeriods.filter(fp => date >= fp.start && date <= fp.end);
    if (activeFreeze.length > 0 && (eventsOnDate.length > 0 || changesOnDate.length > 0)) {
      conflicts.push({ 
        type: 'technology', 
        items: activeFreeze.map(f => f.name), 
        description: `Attività pianificata durante freeze period: ${activeFreeze.map(f => f.name).join(', ')}` 
      });
    }

    return { eventsOnDate, changesOnDate, conflicts };
  }, [freezeEvents, changes, freezePeriods]);

  return {
    changes, freezePeriods, freezeEvents, incidents, notifications,
    addNotification, markAllRead, advanceStatus, rejectChange, reopenChange,
    promoteChange, addChange, addComment, addFreezePeriod, addFreezeEvent,
    removeFreezeEvent, removeFreezePeriod, getConflictsForDate,
  };
}
