-- ============================================================
-- Crea gli utenti demo direttamente in Supabase Auth
-- Esegui nel SQL Editor DOPO schema.sql e seed.sql
-- ============================================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'marco.albini@company.it',
    crypt('changeme123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Marco Albini","avatar":"MA","role":"admin","team":"IT Operations"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'anna.russo@company.it',
    crypt('changeme123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Anna Russo","avatar":"AR","role":"change_manager","team":"DevOps"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'giuseppe.bianchi@company.it',
    crypt('changeme123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Giuseppe Bianchi","avatar":"GB","role":"requestor","team":"Sviluppo"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'sara.conte@company.it',
    crypt('changeme123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Sara Conte","avatar":"SC","role":"env_owner","team":"Security"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'luigi.ferri@company.it',
    crypt('changeme123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Luigi Ferri","avatar":"LF","role":"requestor","team":"Database"}',
    now(), now(), 'authenticated', 'authenticated'
  );

-- Verifica: mostra i profili creati dal trigger
SELECT id, name, role, email, team FROM public.profiles ORDER BY name;
