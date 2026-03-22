import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbChange, DbComment, DbIncident, DbFreezePeriod, DbFreezeEvent } from '@/lib/supabase.types';
import {
  Change, FreezePeriod, FreezeEvent, Incident,
  ENVS, wfSteps, statusConfig
} from '@/data/changeData';

// ── Mappatura DB → tipi app ──────────────────────────────────

function dbToChange(db: DbChange, comments: DbComment[]): Change {
  return {
    id: db.id,
    title: db.title,
    type: db.type,
    priority: db.priority,
    status: db.status,
    requester: db.requester,
    assignee: db.assignee,
    team: db.team,
    involvedResources: db.involved_resources ?? [],
    category: db.category,
    risk: db.risk,
    impact: db.impact,
    opened: db.opened,
    window: db.change_window ?? 'TBD',
    pipeline: (db.pipeline ?? []) as any,
    pipelineStrategy: db.pipeline_strategy,
    currentEnv: db.current_env,
    envDates: db.env_dates ?? {},
    customEnvs: db.custom_envs ?? undefined,
    deps: db.deps ?? [],
    blocks: db.blocks ?? [],
    incidents: [],                          // caricati separatamente
    relatedIncidentIds: db.related_incident_ids ?? [],
    desc: db.description ?? '',
    rollback: db.rollback ?? '',
    test: db.test_plan ?? '',
    comments: comments
      .filter(c => c.change_id === db.id)
      .map(c => ({ user: c.user_name, avatar: c.user_avatar, time: new Date(c.created_at).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }), text: c.text })),
  };
}

function dbToFreezePeriod(db: DbFreezePeriod): FreezePeriod {
  return { id: db.id, name: db.name, start: db.start_date, end: db.end_date, envs: db.envs, color: db.color, description: db.description ?? undefined };
}

function dbToFreezeEvent(db: DbFreezeEvent): FreezeEvent {
  return { id: db.id, title: db.title, date: db.date, endDate: db.end_date ?? undefined, type: db.type, assignee: db.assignee, technologies: db.technologies, description: db.description ?? undefined, changeId: db.change_id ?? undefined };
}

function dbToIncident(db: DbIncident): Incident {
  return { id: db.id, desc: db.description, sev: db.severity, changeId: db.change_id ?? undefined, status: db.status, date: db.date, resolution: db.resolution ?? undefined };
}

// ── Helper: genera prossimo ID ───────────────────────────────

async function nextChangeId(): Promise<string> {
  const { data } = await supabase.from('changes').select('id').order('created_at', { ascending: false }).limit(1);
  if (!data || data.length === 0) return 'CHG-2025-001';
  const last = data[0].id as string;
  const num = parseInt(last.split('-')[2], 10) + 1;
  return `CHG-${new Date().getFullYear()}-${String(num).padStart(3, '0')}`;
}

// ── Hook principale ──────────────────────────────────────────

export function useChangeStore() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [freezePeriods, setFreezePeriods] = useState<FreezePeriod[]>([]);
  const [freezeEvents, setFreezeEvents] = useState<FreezeEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<Array<{ text: string; time: string; read: boolean }>>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const addNotification = useCallback((text: string) => {
    setNotifications(prev => [{ text, time: 'Adesso', read: false }, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Caricamento dati iniziale
  useEffect(() => {
    async function load() {
      const [changesRes, commentsRes, incidentsRes, fpRes, feRes] = await Promise.all([
        supabase.from('changes').select('*').order('created_at', { ascending: false }),
        supabase.from('change_comments').select('*').order('created_at'),
        supabase.from('incidents').select('*').order('date', { ascending: false }),
        supabase.from('freeze_periods').select('*').order('start_date'),
        supabase.from('freeze_events').select('*').order('date'),
      ]);

      const comments = (commentsRes.data ?? []) as DbComment[];
      const dbChanges = (changesRes.data ?? []) as DbChange[];
      const dbIncidents = (incidentsRes.data ?? []) as DbIncident[];

      setChanges(dbChanges.map(c => dbToChange(c, comments)));
      setIncidents(dbIncidents.map(dbToIncident));
      setFreezePeriods((fpRes.data ?? []).map(dbToFreezePeriod));
      setFreezeEvents((feRes.data ?? []).map(dbToFreezeEvent));
      setDataLoaded(true);
    }
    load();
  }, []);

  // Realtime: subscribe ai cambiamenti nella tabella changes
  useEffect(() => {
    const channel = supabase
      .channel('changes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'changes' }, async () => {
        // Ricarica tutto in caso di update remoto
        const [changesRes, commentsRes] = await Promise.all([
          supabase.from('changes').select('*').order('created_at', { ascending: false }),
          supabase.from('change_comments').select('*').order('created_at'),
        ]);
        const comments = (commentsRes.data ?? []) as DbComment[];
        setChanges(((changesRes.data ?? []) as DbChange[]).map(c => dbToChange(c, comments)));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Azioni ───────────────────────────────────────────────

  const advanceStatus = useCallback(async (id: string) => {
    const change = changes.find(c => c.id === id);
    if (!change) return;
    const wfI = statusConfig[change.status]?.wf ?? 0;
    if (wfI >= wfSteps.length - 1) return;
    const newStatus = wfSteps[wfI + 1];
    const { error } = await supabase.from('changes').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setChanges(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      addNotification(`${id}: stato → "${newStatus}"`);
    }
  }, [changes, addNotification]);

  const rejectChange = useCallback(async (id: string) => {
    const { error } = await supabase.from('changes').update({ status: 'Rifiutato' }).eq('id', id);
    if (!error) setChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'Rifiutato' } : c));
  }, []);

  const reopenChange = useCallback(async (id: string) => {
    const { error } = await supabase.from('changes').update({ status: 'Aperto' }).eq('id', id);
    if (!error) setChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'Aperto' } : c));
  }, []);

  const promoteChange = useCallback(async (id: string) => {
    const change = changes.find(c => c.id === id);
    if (!change || change.currentEnv >= 3) return;
    const newPipeline = [...change.pipeline] as any[];
    newPipeline[change.currentEnv] = 'done';
    const newEnv = change.currentEnv + 1;
    newPipeline[newEnv] = 'active';
    const newStatus = newEnv === 3 ? 'Implementazione' : change.status;
    const { error } = await supabase.from('changes').update({
      pipeline: newPipeline,
      current_env: newEnv,
      status: newStatus,
    }).eq('id', id);
    if (!error) {
      setChanges(prev => prev.map(c => c.id === id ? { ...c, pipeline: newPipeline, currentEnv: newEnv, status: newStatus } : c));
      addNotification(`${id} promosso a ${ENVS[newEnv]}`);
    }
  }, [changes, addNotification]);

  const addChange = useCallback(async (change: Omit<Change, 'id'>) => {
    const id = await nextChangeId();
    const row = {
      id,
      title: change.title,
      type: change.type,
      priority: change.priority,
      status: change.status,
      requester: change.requester,
      assignee: change.assignee,
      team: change.team,
      involved_resources: change.involvedResources,
      category: change.category,
      risk: change.risk,
      impact: change.impact,
      opened: change.opened,
      change_window: change.window,
      pipeline: change.pipeline,
      pipeline_strategy: change.pipelineStrategy,
      current_env: change.currentEnv,
      env_dates: change.envDates,
      deps: change.deps,
      blocks: change.blocks,
      related_incident_ids: change.relatedIncidentIds,
      description: change.desc,
      rollback: change.rollback,
      test_plan: change.test,
    };
    const { error } = await supabase.from('changes').insert(row);
    if (!error) {
      setChanges(prev => [{ ...change, id, comments: [] }, ...prev]);
      addNotification(`Nuovo change ${id} creato: "${change.title}"`);
    }
    return id;
  }, [addNotification]);

  const addComment = useCallback(async (changeId: string, text: string, userName: string, userAvatar: string) => {
    const { data, error } = await supabase.from('change_comments').insert({
      change_id: changeId,
      user_name: userName,
      user_avatar: userAvatar,
      text,
    }).select().single();
    if (!error && data) {
      const now = new Date(data.created_at).toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      setChanges(prev => prev.map(c =>
        c.id === changeId
          ? { ...c, comments: [...c.comments, { user: userName, avatar: userAvatar, time: now, text }] }
          : c
      ));
    }
  }, []);

  const addFreezePeriod = useCallback(async (period: Omit<FreezePeriod, 'id'>) => {
    const id = `f${Date.now()}`;
    const row = { id, name: period.name, start_date: period.start, end_date: period.end, envs: period.envs, color: period.color, description: period.description ?? null };
    const { error } = await supabase.from('freeze_periods').insert(row);
    if (!error) {
      setFreezePeriods(prev => [...prev, { ...period, id }]);
      addNotification(`Nuovo freeze period: "${period.name}"`);
    }
  }, [addNotification]);

  const removeFreezePeriod = useCallback(async (id: string) => {
    const { error } = await supabase.from('freeze_periods').delete().eq('id', id);
    if (!error) setFreezePeriods(prev => prev.filter(p => p.id !== id));
  }, []);

  const addFreezeEvent = useCallback(async (event: Omit<FreezeEvent, 'id'>) => {
    const id = `fe${Date.now()}`;
    const row = { id, title: event.title, date: event.date, end_date: event.endDate ?? null, type: event.type, assignee: event.assignee, technologies: event.technologies, description: event.description ?? null, change_id: event.changeId ?? null };
    const { error } = await supabase.from('freeze_events').insert(row);
    if (!error) {
      setFreezeEvents(prev => [...prev, { ...event, id }]);
      addNotification(`Nuovo evento freeze: "${event.title}"`);
    }
  }, [addNotification]);

  const removeFreezeEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from('freeze_events').delete().eq('id', id);
    if (!error) setFreezeEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // Conflict detection (invariata, lavora sui dati in memoria)
  const getConflictsForDate = useCallback((date: string) => {
    const eventsOnDate = freezeEvents.filter(e => {
      const start = e.date;
      const end = e.endDate || e.date;
      return date >= start && date <= end;
    });
    const changesOnDate = changes.filter(c => {
      if (c.window === 'TBD') return false;
      return c.window.split(' ')[0] === date;
    });
    const conflicts: Array<{ type: 'person' | 'technology'; items: string[]; description: string }> = [];
    const assignees = new Map<string, string[]>();
    [...eventsOnDate, ...changesOnDate.map(c => ({ assignee: c.assignee, title: c.title }))].forEach((item: any) => {
      const name = item.assignee;
      if (!assignees.has(name)) assignees.set(name, []);
      assignees.get(name)!.push(item.title);
    });
    assignees.forEach((items, person) => {
      if (items.length > 1) conflicts.push({ type: 'person', items, description: `${person} è assegnato a ${items.length} attività` });
    });
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
      if (items.length > 1) conflicts.push({ type: 'technology', items, description: `Tecnologia "${tech}" impattata da ${items.length} attività` });
    });
    const activeFreeze = freezePeriods.filter(fp => date >= fp.start && date <= fp.end);
    if (activeFreeze.length > 0 && (eventsOnDate.length > 0 || changesOnDate.length > 0)) {
      conflicts.push({ type: 'technology', items: activeFreeze.map(f => f.name), description: `Attività durante freeze: ${activeFreeze.map(f => f.name).join(', ')}` });
    }
    return { eventsOnDate, changesOnDate, conflicts };
  }, [freezeEvents, changes, freezePeriods]);

  return {
    changes, freezePeriods, freezeEvents, incidents, notifications, dataLoaded,
    addNotification, markAllRead, advanceStatus, rejectChange, reopenChange,
    promoteChange, addChange, addComment, addFreezePeriod, addFreezeEvent,
    removeFreezeEvent, removeFreezePeriod, getConflictsForDate,
  };
}
