// Tipi che rispecchiano esattamente le colonne del DB Supabase
// Usati nelle query dirette; l'app usa i tipi di changeData.ts come "view model"

export interface DbChange {
  id: string;
  title: string;
  type: 'Standard' | 'Normale' | 'Emergenza';
  priority: 'Critica' | 'Alta' | 'Media' | 'Bassa';
  status: string;
  requester: string;
  assignee: string;
  team: string;
  involved_resources: string[];
  category: string;
  risk: string;
  impact: string;
  opened: string;
  change_window: string | null;
  pipeline: string[];
  pipeline_strategy: 'full' | 'skip-dev' | 'direct' | 'custom';
  current_env: number;
  env_dates: Record<string, string>;
  custom_envs: string[] | null;
  deps: string[];
  blocks: string[];
  related_incident_ids: string[];
  description: string | null;
  rollback: string | null;
  test_plan: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbComment {
  id: string;
  change_id: string;
  user_name: string;
  user_avatar: string;
  text: string;
  created_at: string;
}

export interface DbIncident {
  id: string;
  description: string;
  severity: string;
  change_id: string | null;
  status: string;
  date: string;
  resolution: string | null;
}

export interface DbProfile {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'change_manager' | 'requestor' | 'env_owner';
  email: string;
  team: string | null;
}

export interface DbCIItem {
  id: string;
  name: string;
  type: string;
  status: 'Attivo' | 'Manutenzione' | 'Dismesso';
  owner: string;
  env: string;
  related_changes: string[];
}

export interface DbFreezePeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  envs: string[];
  color: string;
  description: string | null;
}

export interface DbFreezeEvent {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  type: 'maintenance' | 'deploy' | 'meeting' | 'test';
  assignee: string;
  technologies: string[];
  description: string | null;
  change_id: string | null;
}
