-- ============================================================
-- ChangeFlow — Schema Supabase
-- Esegui questo script nel SQL Editor del tuo progetto Supabase
-- ============================================================

-- Abilita l'estensione UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELLA: profiles
-- Estende auth.users di Supabase con i dati applicativi
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  avatar      text not null,        -- iniziali, es. "MA"
  role        text not null check (role in ('admin', 'change_manager', 'requestor', 'env_owner')),
  email       text not null unique,
  team        text,
  created_at  timestamptz default now()
);

-- Trigger: crea il profilo automaticamente al signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, avatar, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar', upper(left(split_part(new.email, '@', 1), 2))),
    coalesce(new.raw_user_meta_data->>'role', 'requestor'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABELLA: changes
-- ============================================================
create table public.changes (
  id                  text primary key,              -- es. CHG-2025-001
  title               text not null,
  type                text not null check (type in ('Standard', 'Normale', 'Emergenza')),
  priority            text not null check (priority in ('Critica', 'Alta', 'Media', 'Bassa')),
  status              text not null default 'Aperto',
  requester           text not null,
  assignee            text not null,
  team                text not null,
  involved_resources  text[] default '{}',
  category            text not null,
  risk                text not null,
  impact              text not null,
  opened              date not null default current_date,
  change_window       text,                          -- es. "2025-02-01 22:00" o "TBD"
  pipeline            text[] not null default '{"pending","pending","pending","pending"}',
  pipeline_strategy   text not null default 'full' check (pipeline_strategy in ('full', 'skip-dev', 'direct', 'custom')),
  current_env         integer not null default 0,
  env_dates           jsonb default '{}',
  custom_envs         text[],
  deps                text[] default '{}',           -- CHG ids dipendenze
  blocks              text[] default '{}',           -- CHG ids bloccati
  related_incident_ids text[] default '{}',
  description         text,
  rollback            text,
  test_plan           text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Trigger: aggiorna updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger changes_updated_at
  before update on public.changes
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TABELLA: change_comments
-- ============================================================
create table public.change_comments (
  id          uuid primary key default uuid_generate_v4(),
  change_id   text not null references public.changes(id) on delete cascade,
  user_name   text not null,
  user_avatar text not null,
  text        text not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABELLA: incidents
-- ============================================================
create table public.incidents (
  id          text primary key,              -- es. INC-0042
  description text not null,
  severity    text not null,                 -- P1, P2, P3, P4
  change_id   text references public.changes(id) on delete set null,
  status      text default 'Aperto',
  date        date default current_date,
  resolution  text,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABELLA: ci_items (CMDB - Configuration Items)
-- ============================================================
create table public.ci_items (
  id          text primary key,              -- es. CI-001
  name        text not null,
  type        text not null,                 -- Network, Applicazioni, Database, ecc.
  status      text not null default 'Attivo' check (status in ('Attivo', 'Manutenzione', 'Dismesso')),
  owner       text not null,
  env         text not null,
  related_changes text[] default '{}',
  created_at  timestamptz default now()
);

-- ============================================================
-- TABELLA: freeze_periods
-- ============================================================
create table public.freeze_periods (
  id          text primary key,
  name        text not null,
  start_date  date not null,
  end_date    date not null,
  envs        text[] not null default '{"PROD"}',
  color       text default '#c084fc',
  description text,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABELLA: freeze_events
-- ============================================================
create table public.freeze_events (
  id          text primary key,
  title       text not null,
  date        date not null,
  end_date    date,
  type        text not null check (type in ('maintenance', 'deploy', 'meeting', 'test')),
  assignee    text not null,
  technologies text[] default '{}',
  description text,
  change_id   text references public.changes(id) on delete set null,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABELLA: notifications
-- ============================================================
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade,
  text        text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.changes        enable row level security;
alter table public.change_comments enable row level security;
alter table public.incidents      enable row level security;
alter table public.ci_items       enable row level security;
alter table public.freeze_periods enable row level security;
alter table public.freeze_events  enable row level security;
alter table public.notifications  enable row level security;

-- Profili: visibili a tutti gli utenti autenticati
create policy "profiles: lettura autenticati"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles: modifica proprio profilo"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- Changes: visibili a tutti gli autenticati (le restrizioni per ruolo restano lato app)
create policy "changes: lettura autenticati"
  on public.changes for select
  to authenticated using (true);

create policy "changes: inserimento autenticati"
  on public.changes for insert
  to authenticated with check (true);

create policy "changes: modifica autenticati"
  on public.changes for update
  to authenticated using (true);

-- Commenti
create policy "comments: lettura autenticati"
  on public.change_comments for select
  to authenticated using (true);

create policy "comments: inserimento autenticati"
  on public.change_comments for insert
  to authenticated with check (true);

-- Incidents
create policy "incidents: lettura autenticati"
  on public.incidents for select
  to authenticated using (true);

create policy "incidents: scrittura autenticati"
  on public.incidents for all
  to authenticated using (true);

-- CI Items
create policy "ci_items: lettura autenticati"
  on public.ci_items for select
  to authenticated using (true);

create policy "ci_items: scrittura autenticati"
  on public.ci_items for all
  to authenticated using (true);

-- Freeze periods e events
create policy "freeze_periods: lettura autenticati"
  on public.freeze_periods for select
  to authenticated using (true);

create policy "freeze_periods: scrittura autenticati"
  on public.freeze_periods for all
  to authenticated using (true);

create policy "freeze_events: lettura autenticati"
  on public.freeze_events for select
  to authenticated using (true);

create policy "freeze_events: scrittura autenticati"
  on public.freeze_events for all
  to authenticated using (true);

-- Notifiche: solo il proprio utente
create policy "notifications: solo proprie"
  on public.notifications for all
  to authenticated using (auth.uid() = user_id);

-- ============================================================
-- INDICI
-- ============================================================
create index idx_changes_status on public.changes(status);
create index idx_changes_assignee on public.changes(assignee);
create index idx_change_comments_change_id on public.change_comments(change_id);
create index idx_incidents_change_id on public.incidents(change_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_freeze_events_date on public.freeze_events(date);
