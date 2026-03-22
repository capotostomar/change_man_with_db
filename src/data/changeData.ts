export const ENVS = ['DEV', 'INTEG', 'CERT', 'PROD'] as const;
export type EnvName = typeof ENVS[number];
export type EnvStatus = 'done' | 'active' | 'pending' | 'failed' | 'skip';
export type PipelineStrategy = 'full' | 'skip-dev' | 'direct' | 'custom';

export interface ChangeComment {
  user: string;
  avatar: string;
  time: string;
  text: string;
}

export interface Incident {
  id: string;
  desc: string;
  sev: string;
  changeId?: string;
  status?: string;
  date?: string;
  resolution?: string;
}

export type UserRole = 'admin' | 'change_manager' | 'requestor' | 'env_owner';

export interface AppUser {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  email: string;
  team?: string;
}

export const MOCK_USERS: AppUser[] = [
  { id: 'u1', name: 'Marco Albini', avatar: 'MA', role: 'admin', email: 'marco.albini@company.it', team: 'IT Operations' },
  { id: 'u2', name: 'Anna Russo', avatar: 'AR', role: 'change_manager', email: 'anna.russo@company.it', team: 'DevOps' },
  { id: 'u3', name: 'Giuseppe Bianchi', avatar: 'GB', role: 'requestor', email: 'giuseppe.bianchi@company.it', team: 'Sviluppo' },
  { id: 'u4', name: 'Sara Conte', avatar: 'SC', role: 'env_owner', email: 'sara.conte@company.it', team: 'Security' },
  { id: 'u5', name: 'Luigi Ferri', avatar: 'LF', role: 'requestor', email: 'luigi.ferri@company.it', team: 'Database' },
];

export const TEAMS = ['IT Operations', 'DevOps', 'Sviluppo', 'Security', 'Database', 'Network', 'Infrastruttura'];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Amministratore',
  change_manager: 'Change Manager',
  requestor: 'Requestor',
  env_owner: 'Environment Owner',
};

export interface Change {
  id: string;
  title: string;
  type: 'Standard' | 'Normale' | 'Emergenza';
  priority: 'Critica' | 'Alta' | 'Media' | 'Bassa';
  status: string;
  requester: string;
  assignee: string;
  team: string;
  involvedResources: string[];
  category: string;
  risk: string;
  impact: string;
  opened: string;
  window: string;
  pipeline: EnvStatus[];
  pipelineStrategy: PipelineStrategy;
  currentEnv: number;
  envDates: Record<string, string>;
  customEnvs?: string[];
  deps: string[];
  blocks: string[];
  incidents: Incident[];
  relatedIncidentIds: string[];
  desc: string;
  rollback: string;
  test: string;
  comments: ChangeComment[];
}

export interface FreezePeriod {
  id: string;
  name: string;
  start: string;
  end: string;
  envs: string[];
  color: string;
  description?: string;
}

export interface FreezeEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'maintenance' | 'deploy' | 'meeting' | 'test';
  assignee: string;
  technologies: string[];
  description?: string;
  changeId?: string;
}

export const ENV_COLORS: Record<string, string> = {
  DEV: '#4f7cff',
  INTEG: '#ffa94d',
  CERT: '#c084fc',
  PROD: '#00d4aa',
};

function makeEnvStatus(active: number, failed: number, skip: number[]): EnvStatus[] {
  return ENVS.map((_, i) => {
    if (skip?.includes(i)) return 'skip';
    if (i < active) return 'done';
    if (i === active) return failed === i ? 'failed' : 'active';
    return 'pending';
  });
}

export const initialChanges: Change[] = [
  { id: 'CHG-2025-001', title: 'Aggiornamento firmware switch core DC01', type: 'Normale', priority: 'Alta', status: 'In Review',
    requester: 'G. Bianchi', assignee: 'A. Russo', team: 'Network', involvedResources: ['S. Conte', 'L. Ferri'], category: 'Network', risk: 'Alto', impact: 'Alto',
    opened: '2025-01-15', window: '2025-02-01 22:00',
    pipeline: makeEnvStatus(1, -1, []), pipelineStrategy: 'full', currentEnv: 1,
    envDates: { DEV: '2025-01-20', INTEG: '2025-01-28', CERT: '2025-02-01', PROD: '2025-02-05' },
    deps: [], blocks: ['CHG-2025-002'],
    incidents: [{ id: 'INC-0042', desc: 'Flap interfaccia dopo patch precedente', sev: 'P3' }],
    relatedIncidentIds: ['INC-0042'],
    desc: 'Aggiornamento firmware switch core DC01 alla versione 15.2.7. Necessario per CVE-2024-3892.',
    rollback: 'Downgrade alla versione 15.2.5 tramite USB recovery. Tempo: 15 min.',
    test: 'Ping sweep, test BGP neighbors, verifica connettività tutti segmenti.',
    comments: [
      { user: 'S. Conte', avatar: 'SC', time: '15 Jan 14:30', text: 'Documentazione tecnica OK.' },
      { user: 'L. Ferri', avatar: 'LF', time: '16 Jan 09:00', text: 'Finestra confermata con operations.' },
    ],
  },
  { id: 'CHG-2025-002', title: 'Deploy applicazione CRM v3.4.1', type: 'Standard', priority: 'Media', status: 'Approvato',
    requester: 'A. Russo', assignee: 'A. Russo', team: 'DevOps', involvedResources: ['M. Albini'], category: 'Applicazioni', risk: 'Medio', impact: 'Medio',
    opened: '2025-01-18', window: '2025-02-07 23:00',
    pipeline: makeEnvStatus(2, -1, []), pipelineStrategy: 'full', currentEnv: 2,
    envDates: { DEV: '2025-01-22', INTEG: '2025-01-30', CERT: '2025-02-05', PROD: '2025-02-07' },
    deps: ['CHG-2025-001'], blocks: [],
    incidents: [], relatedIncidentIds: [],
    desc: 'Deploy CRM v3.4.1: integrazione billing, nuova dashboard analytics, fix 12 bug critici.',
    rollback: 'Revert container Docker v3.3.8 via pipeline CI/CD.',
    test: 'Smoke test suite automatizzata + verifica manuale flussi critici.',
    comments: [],
  },
  { id: 'CHG-2025-003', title: 'Migrazione database Oracle → PostgreSQL', type: 'Normale', priority: 'Critica', status: 'Aperto',
    requester: 'M. Albini', assignee: 'L. Ferri', team: 'Database', involvedResources: ['A. Russo'], category: 'Database', risk: 'Critico', impact: 'Alto',
    opened: '2025-01-20', window: 'TBD',
    pipeline: makeEnvStatus(0, -1, []), pipelineStrategy: 'full', currentEnv: 0,
    envDates: {}, deps: [], blocks: ['CHG-2025-008'],
    incidents: [], relatedIncidentIds: [],
    desc: 'Migrazione DB applicativo Oracle 19c → PostgreSQL 16.',
    rollback: 'Oracle attivo 30 giorni post-migrazione come fallback.',
    test: 'Test performance query critiche. Verifica integrità via checksum.',
    comments: [],
  },
  { id: 'CHG-2025-004', title: 'Sostituzione certificati SSL scaduti', type: 'Standard', priority: 'Alta', status: 'Schedulato',
    requester: 'S. Conte', assignee: 'S. Conte', team: 'Security', involvedResources: [], category: 'Security', risk: 'Basso', impact: 'Basso',
    opened: '2025-01-22', window: '2025-01-28 02:00',
    pipeline: makeEnvStatus(3, -1, [0, 1]), pipelineStrategy: 'skip-dev', currentEnv: 3,
    envDates: { INTEG: '2025-01-24', CERT: '2025-01-26', PROD: '2025-01-28' },
    deps: [], blocks: [],
    incidents: [], relatedIncidentIds: [],
    desc: 'Rinnovo e deploy certificati SSL/TLS per domini aziendali.',
    rollback: 'Restore certificati precedenti da backup.',
    test: 'Verifica catena certificazione con openssl.',
    comments: [],
  },
  { id: 'CHG-2025-005', title: 'Patching emergenza server web prod', type: 'Emergenza', priority: 'Critica', status: 'Implementazione',
    requester: 'G. Bianchi', assignee: 'A. Russo', team: 'IT Operations', involvedResources: ['M. Albini', 'S. Conte'], category: 'Server', risk: 'Alto', impact: 'Alto',
    opened: '2025-01-24', window: '2025-01-24 NOW',
    pipeline: makeEnvStatus(3, -1, [0, 1, 2]), pipelineStrategy: 'direct', currentEnv: 3,
    envDates: { PROD: '2025-01-24' },
    deps: [], blocks: [],
    incidents: [{ id: 'INC-0051', desc: 'Exploit attivo CVE-2025-0234', sev: 'P1' }],
    relatedIncidentIds: ['INC-0051'],
    desc: 'Patch di sicurezza CVE-2025-0234 (CVSS 9.8) su server web PROD.',
    rollback: 'Snapshot VM eseguito. Rollback max 10 min.',
    test: 'Scanner vulnerabilità post-patch.',
    comments: [{ user: 'M. Albini', avatar: 'MA', time: '24 Jan 08:45', text: 'URGENTE: Procedura emergenza CAB attivata.' }],
  },
  { id: 'CHG-2025-006', title: 'Espansione storage SAN cluster prod', type: 'Normale', priority: 'Media', status: 'Aperto',
    requester: 'L. Ferri', assignee: 'M. Albini', team: 'Infrastruttura', involvedResources: ['L. Ferri'], category: 'Storage', risk: 'Medio', impact: 'Medio',
    opened: '2025-01-25', window: 'TBD',
    pipeline: makeEnvStatus(0, -1, []), pipelineStrategy: 'full', currentEnv: 0,
    envDates: {}, deps: [], blocks: [],
    incidents: [], relatedIncidentIds: [],
    desc: 'Aggiunta 4 shelf da 48TB al cluster SAN di produzione.',
    rollback: 'Rimozione shelf aggiuntivi se instabilità.',
    test: 'Test I/O performance post-espansione.',
    comments: [],
  },
  { id: 'CHG-2025-007', title: 'Aggiornamento policy firewall perimetrale', type: 'Standard', priority: 'Bassa', status: 'Chiuso',
    requester: 'S. Conte', assignee: 'S. Conte', team: 'Security', involvedResources: [], category: 'Network', risk: 'Basso', impact: 'Basso',
    opened: '2025-01-10', window: '2025-01-12 22:00',
    pipeline: ['done', 'done', 'done', 'done'], pipelineStrategy: 'skip-dev', currentEnv: 4,
    envDates: { INTEG: '2025-01-10', CERT: '2025-01-11', PROD: '2025-01-12' },
    deps: [], blocks: [],
    incidents: [], relatedIncidentIds: [],
    desc: 'Aggiornamento ruleset firewall: blocco range IP malevoli.',
    rollback: 'Restore configurazione da backup automatico firewall.',
    test: 'Test connettività applicazioni.',
    comments: [],
  },
  { id: 'CHG-2025-008', title: 'Deploy middleware ESB versione 4.2', type: 'Normale', priority: 'Media', status: 'In Review',
    requester: 'A. Russo', assignee: 'L. Ferri', team: 'DevOps', involvedResources: ['A. Russo'], category: 'Applicazioni', risk: 'Medio', impact: 'Medio',
    opened: '2025-01-26', window: '2025-02-14 22:00',
    pipeline: makeEnvStatus(1, -1, []), pipelineStrategy: 'full', currentEnv: 1,
    envDates: { DEV: '2025-01-28', INTEG: '2025-02-05', CERT: '2025-02-10', PROD: '2025-02-14' },
    deps: ['CHG-2025-003'], blocks: [],
    incidents: [], relatedIncidentIds: [],
    desc: 'Aggiornamento ESB che gestisce 47 integrazioni.',
    rollback: 'Rollback v4.1.3. Configurazioni su Git.',
    test: 'Test smoke 47 integrazioni.',
    comments: [],
  },
  { id: 'CHG-2025-009', title: 'Configurazione VPN site-to-site Milano', type: 'Standard', priority: 'Media', status: 'Approvato',
    requester: 'G. Bianchi', assignee: 'A. Russo', team: 'Network', involvedResources: ['G. Bianchi'], category: 'Network', risk: 'Basso', impact: 'Basso',
    opened: '2025-01-27', window: '2025-02-08 22:00',
    pipeline: makeEnvStatus(2, -1, [0]), pipelineStrategy: 'skip-dev', currentEnv: 2,
    envDates: { INTEG: '2025-01-30', CERT: '2025-02-04', PROD: '2025-02-08' },
    deps: [], blocks: [],
    incidents: [], relatedIncidentIds: [],
    desc: 'Tunnel VPN IPSec tra sede Milano e datacenter principale.',
    rollback: 'Rimozione configurazione VPN.',
    test: 'Test connettività e performance VPN.',
    comments: [],
  },
  { id: 'CHG-2025-010', title: 'Upgrade kernel server Linux farm web', type: 'Normale', priority: 'Alta', status: 'Chiuso',
    requester: 'M. Albini', assignee: 'L. Ferri', team: 'IT Operations', involvedResources: ['M. Albini'], category: 'Server', risk: 'Medio', impact: 'Medio',
    opened: '2025-01-05', window: '2025-01-07 02:00',
    pipeline: ['done', 'done', 'done', 'done'], pipelineStrategy: 'full', currentEnv: 4,
    envDates: { DEV: '2025-01-05', INTEG: '2025-01-06', CERT: '2025-01-06', PROD: '2025-01-07' },
    deps: [], blocks: [],
    incidents: [], relatedIncidentIds: [],
    desc: 'Upgrade kernel Linux 5.15 → 6.1 LTS.',
    rollback: 'Boot su kernel precedente da GRUB.',
    test: 'Test funzionale applicazioni.',
    comments: [],
  },
];

export const initialFreezePeriods: FreezePeriod[] = [
  { id: 'f1', name: 'Fine Anno', start: '2024-12-20', end: '2025-01-02', envs: ['PROD'], color: '#c084fc' },
  { id: 'f2', name: 'Pasqua', start: '2025-04-18', end: '2025-04-22', envs: ['CERT', 'PROD'], color: '#c084fc' },
  { id: 'f3', name: 'Black Friday', start: '2025-11-28', end: '2025-12-01', envs: ['PROD'], color: '#c084fc' },
];

export const initialFreezeEvents: FreezeEvent[] = [
  { id: 'fe1', title: 'Manutenzione DB Oracle', date: '2025-02-01', endDate: '2025-02-02', type: 'maintenance', assignee: 'L. Ferri', technologies: ['Oracle', 'Database'], description: 'Manutenzione pianificata del DB Oracle per ottimizzazione indici', changeId: 'CHG-2025-003' },
  { id: 'fe2', title: 'Deploy CRM v3.4.1', date: '2025-02-07', endDate: '2025-02-08', type: 'deploy', assignee: 'A. Russo', technologies: ['CRM', 'Docker', 'Kubernetes'], description: 'Deploy della nuova versione CRM', changeId: 'CHG-2025-002' },
  { id: 'fe3', title: 'Test VPN Milano', date: '2025-02-08', endDate: '2025-02-08', type: 'test', assignee: 'A. Russo', technologies: ['Network', 'VPN', 'IPSec'], description: 'Test di connettività VPN site-to-site', changeId: 'CHG-2025-009' },
  { id: 'fe4', title: 'Aggiornamento firmware switch', date: '2025-02-01', type: 'maintenance', assignee: 'A. Russo', technologies: ['Network', 'Switch', 'BGP'], description: 'Aggiornamento firmware switch core', changeId: 'CHG-2025-001' },
];

export const initialIncidents: Incident[] = [
  { id: 'INC-0042', desc: 'Flap interfaccia dopo patch firmware precedente', sev: 'P3', changeId: 'CHG-2025-001', status: 'Chiuso', date: '2025-01-12', resolution: 'Rollback patch e riapertura change con fix' },
  { id: 'INC-0051', desc: 'Exploit attivo CVE-2025-0234 rilevato in produzione', sev: 'P1', changeId: 'CHG-2025-005', status: 'Risolto', date: '2025-01-24', resolution: 'Patch applicata in emergenza' },
  { id: 'INC-0055', desc: 'Degradazione performance DB dopo aggiornamento statistiche', sev: 'P2', changeId: 'CHG-2025-010', status: 'Chiuso', date: '2025-01-08', resolution: 'Rebuild index e aggiornamento query plan' },
];

export const statusConfig: Record<string, { badge: string; wf: number }> = {
  'Aperto': { badge: 'open', wf: 0 },
  'In Review': { badge: 'review', wf: 1 },
  'Approvato': { badge: 'approved', wf: 2 },
  'Schedulato': { badge: 'scheduled', wf: 3 },
  'Implementazione': { badge: 'implementing', wf: 4 },
  'Chiuso': { badge: 'closed', wf: 5 },
  'Rifiutato': { badge: 'rejected', wf: -1 },
};

export const wfSteps = ['Aperto', 'In Review', 'Approvato', 'Schedulato', 'Implementazione', 'Chiuso'];
