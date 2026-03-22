-- ============================================================
-- ChangeFlow — Dati iniziali (seed)
-- Esegui DOPO lo schema, nel SQL Editor di Supabase
-- ============================================================

-- NOTA: gli utenti vengono creati tramite Supabase Auth (vedi README).
-- Questo seed popola solo le tabelle non-auth.

-- ============================================================
-- CHANGES
-- ============================================================
insert into public.changes (id, title, type, priority, status, requester, assignee, team, involved_resources, category, risk, impact, opened, change_window, pipeline, pipeline_strategy, current_env, env_dates, deps, blocks, related_incident_ids, description, rollback, test_plan)
values
  ('CHG-2025-001', 'Aggiornamento firmware switch core DC01', 'Normale', 'Alta', 'In Review',
   'G. Bianchi', 'A. Russo', 'Network', '{"S. Conte","L. Ferri"}', 'Network', 'Alto', 'Alto',
   '2025-01-15', '2025-02-01 22:00',
   '{"done","active","pending","pending"}', 'full', 1,
   '{"DEV":"2025-01-20","INTEG":"2025-01-28","CERT":"2025-02-01","PROD":"2025-02-05"}',
   '{}', '{"CHG-2025-002"}', '{"INC-0042"}',
   'Aggiornamento firmware switch core DC01 alla versione 15.2.7. Necessario per CVE-2024-3892.',
   'Downgrade alla versione 15.2.5 tramite USB recovery. Tempo: 15 min.',
   'Ping sweep, test BGP neighbors, verifica connettività tutti segmenti.'),

  ('CHG-2025-002', 'Deploy applicazione CRM v3.4.1', 'Standard', 'Media', 'Approvato',
   'A. Russo', 'A. Russo', 'DevOps', '{"M. Albini"}', 'Applicazioni', 'Medio', 'Medio',
   '2025-01-18', '2025-02-07 23:00',
   '{"done","done","active","pending"}', 'full', 2,
   '{"DEV":"2025-01-22","INTEG":"2025-01-30","CERT":"2025-02-05","PROD":"2025-02-07"}',
   '{"CHG-2025-001"}', '{}', '{}',
   'Deploy CRM v3.4.1: integrazione billing, nuova dashboard analytics, fix 12 bug critici.',
   'Revert container Docker v3.3.8 via pipeline CI/CD.',
   'Smoke test suite automatizzata + verifica manuale flussi critici.'),

  ('CHG-2025-003', 'Migrazione database Oracle → PostgreSQL', 'Normale', 'Critica', 'Aperto',
   'M. Albini', 'L. Ferri', 'Database', '{"A. Russo"}', 'Database', 'Critico', 'Alto',
   '2025-01-20', 'TBD',
   '{"active","pending","pending","pending"}', 'full', 0,
   '{}', '{}', '{"CHG-2025-008"}', '{}',
   'Migrazione DB applicativo Oracle 19c → PostgreSQL 16.',
   'Oracle attivo 30 giorni post-migrazione come fallback.',
   'Test performance query critiche. Verifica integrità via checksum.'),

  ('CHG-2025-004', 'Sostituzione certificati SSL scaduti', 'Standard', 'Alta', 'Schedulato',
   'S. Conte', 'S. Conte', 'Security', '{}', 'Security', 'Basso', 'Basso',
   '2025-01-22', '2025-01-28 02:00',
   '{"skip","skip","done","active"}', 'skip-dev', 3,
   '{"INTEG":"2025-01-24","CERT":"2025-01-26","PROD":"2025-01-28"}',
   '{}', '{}', '{}',
   'Rinnovo e deploy certificati SSL/TLS per domini aziendali.',
   'Restore certificati precedenti da backup.',
   'Verifica catena certificazione con openssl.'),

  ('CHG-2025-005', 'Patching emergenza server web prod', 'Emergenza', 'Critica', 'Implementazione',
   'G. Bianchi', 'A. Russo', 'IT Operations', '{"M. Albini","S. Conte"}', 'Server', 'Alto', 'Alto',
   '2025-01-24', '2025-01-24 NOW',
   '{"skip","skip","skip","active"}', 'direct', 3,
   '{"PROD":"2025-01-24"}',
   '{}', '{}', '{"INC-0051"}',
   'Patch di sicurezza CVE-2025-0234 (CVSS 9.8) su server web PROD.',
   'Snapshot VM eseguito. Rollback max 10 min.',
   'Scanner vulnerabilità post-patch.'),

  ('CHG-2025-006', 'Espansione storage SAN cluster prod', 'Normale', 'Media', 'Aperto',
   'L. Ferri', 'M. Albini', 'Infrastruttura', '{"L. Ferri"}', 'Storage', 'Medio', 'Medio',
   '2025-01-25', 'TBD',
   '{"active","pending","pending","pending"}', 'full', 0,
   '{}', '{}', '{}', '{}',
   'Aggiunta 4 shelf da 48TB al cluster SAN di produzione.',
   'Rimozione shelf aggiuntivi se instabilità.',
   'Test I/O performance post-espansione.'),

  ('CHG-2025-007', 'Aggiornamento policy firewall perimetrale', 'Standard', 'Bassa', 'Chiuso',
   'S. Conte', 'S. Conte', 'Security', '{}', 'Network', 'Basso', 'Basso',
   '2025-01-10', '2025-01-12 22:00',
   '{"done","done","done","done"}', 'skip-dev', 4,
   '{"INTEG":"2025-01-10","CERT":"2025-01-11","PROD":"2025-01-12"}',
   '{}', '{}', '{}',
   'Aggiornamento ruleset firewall: blocco range IP malevoli.',
   'Restore configurazione da backup automatico firewall.',
   'Test connettività applicazioni.'),

  ('CHG-2025-008', 'Deploy middleware ESB versione 4.2', 'Normale', 'Media', 'In Review',
   'A. Russo', 'L. Ferri', 'DevOps', '{"A. Russo"}', 'Applicazioni', 'Medio', 'Medio',
   '2025-01-26', '2025-02-14 22:00',
   '{"done","active","pending","pending"}', 'full', 1,
   '{"DEV":"2025-01-28","INTEG":"2025-02-05","CERT":"2025-02-10","PROD":"2025-02-14"}',
   '{"CHG-2025-003"}', '{}', '{}',
   'Aggiornamento ESB che gestisce 47 integrazioni.',
   'Rollback v4.1.3. Configurazioni su Git.',
   'Test smoke 47 integrazioni.'),
  ('CHG-2025-009', 'Configurazione VPN site-to-site Milano', 'Standard', 'Media', 'Approvato',
   'G. Bianchi', 'A. Russo', 'Network', '{"G. Bianchi"}', 'Network', 'Basso', 'Basso',
   '2025-01-27', '2025-02-08 22:00',
   '{"skip","done","active","pending"}', 'skip-dev', 2,
   '{"INTEG":"2025-01-30","CERT":"2025-02-04","PROD":"2025-02-08"}',
   '{}', '{}', '{}',
   'Tunnel VPN IPSec tra sede Milano e datacenter principale.',
   'Rimozione configurazione VPN.',
   'Test connettività e performance VPN.'),
  ('CHG-2025-010', 'Upgrade kernel server Linux farm web', 'Normale', 'Alta', 'Chiuso',
   'M. Albini', 'L. Ferri', 'IT Operations', '{"M. Albini"}', 'Server', 'Medio', 'Medio',
   '2025-01-05', '2025-01-07 02:00',
   '{"done","done","done","done"}', 'full', 4,
   '{"DEV":"2025-01-05","INTEG":"2025-01-06","CERT":"2025-01-06","PROD":"2025-01-07"}',
   '{}', '{}', '{"INC-0055"}',
   'Upgrade kernel Linux 5.15 → 6.1 LTS.',
   'Boot su kernel precedente da GRUB.',
   'Test funzionale applicazioni.');

-- ============================================================
-- CHANGE COMMENTS
-- ============================================================
insert into public.change_comments (change_id, user_name, user_avatar, text, created_at)
values
  ('CHG-2025-001', 'S. Conte', 'SC', 'Documentazione tecnica OK.', '2025-01-15 14:30:00+00'),
  ('CHG-2025-001', 'L. Ferri', 'LF', 'Finestra confermata con operations.', '2025-01-16 09:00:00+00'),
  ('CHG-2025-005', 'M. Albini', 'MA', 'URGENTE: Procedura emergenza CAB attivata.', '2025-01-24 08:45:00+00');

-- ============================================================
-- INCIDENTS
-- ============================================================
insert into public.incidents (id, description, severity, change_id, status, date, resolution)
values
  ('INC-0042', 'Flap interfaccia dopo patch firmware precedente', 'P3', 'CHG-2025-001', 'Chiuso', '2025-01-12', 'Rollback patch e riapertura change con fix'),
  ('INC-0051', 'Exploit attivo CVE-2025-0234 rilevato in produzione', 'P1', 'CHG-2025-005', 'Risolto', '2025-01-24', 'Patch applicata in emergenza'),
  ('INC-0055', 'Degradazione performance DB dopo aggiornamento statistiche', 'P2', 'CHG-2025-010', 'Chiuso', '2025-01-08', 'Rebuild index e aggiornamento query plan');

-- ============================================================
-- CI ITEMS (CMDB)
-- ============================================================
insert into public.ci_items (id, name, type, status, owner, env, related_changes)
values
  ('CI-001', 'Switch Core DC01', 'Network', 'Attivo', 'A. Russo', 'PROD', '{"CHG-2025-001"}'),
  ('CI-002', 'CRM Application Server', 'Applicazioni', 'Attivo', 'A. Russo', 'PROD', '{"CHG-2025-002"}'),
  ('CI-003', 'Oracle DB Primary', 'Database', 'Manutenzione', 'L. Ferri', 'PROD', '{"CHG-2025-003"}'),
  ('CI-004', 'Web Server Farm', 'Server', 'Attivo', 'A. Russo', 'PROD', '{"CHG-2025-005","CHG-2025-010"}'),
  ('CI-005', 'Firewall Perimetrale', 'Security', 'Attivo', 'S. Conte', 'PROD', '{"CHG-2025-007"}'),
  ('CI-006', 'SAN Cluster PROD', 'Storage', 'Attivo', 'M. Albini', 'PROD', '{"CHG-2025-006"}'),
  ('CI-007', 'ESB Middleware', 'Applicazioni', 'Attivo', 'L. Ferri', 'INTEG', '{"CHG-2025-008"}'),
  ('CI-008', 'VPN Gateway Milano', 'Network', 'Attivo', 'A. Russo', 'PROD', '{"CHG-2025-009"}'),
  ('CI-009', 'SSL Certificate Store', 'Security', 'Attivo', 'S. Conte', 'PROD', '{"CHG-2025-004"}');

-- ============================================================
-- FREEZE PERIODS
-- ============================================================
insert into public.freeze_periods (id, name, start_date, end_date, envs, color)
values
  ('f1', 'Fine Anno', '2024-12-20', '2025-01-02', '{"PROD"}', '#c084fc'),
  ('f2', 'Pasqua', '2025-04-18', '2025-04-22', '{"CERT","PROD"}', '#c084fc'),
  ('f3', 'Black Friday', '2025-11-28', '2025-12-01', '{"PROD"}', '#c084fc');

-- ============================================================
-- FREEZE EVENTS
-- ============================================================
insert into public.freeze_events (id, title, date, end_date, type, assignee, technologies, description, change_id)
values
  ('fe1', 'Manutenzione DB Oracle', '2025-02-01', '2025-02-02', 'maintenance', 'L. Ferri', '{"Oracle","Database"}', 'Manutenzione pianificata del DB Oracle', 'CHG-2025-003'),
  ('fe2', 'Deploy CRM v3.4.1', '2025-02-07', '2025-02-08', 'deploy', 'A. Russo', '{"CRM","Docker","Kubernetes"}', 'Deploy nuova versione CRM', 'CHG-2025-002'),
  ('fe3', 'Test VPN Milano', '2025-02-08', '2025-02-08', 'test', 'A. Russo', '{"Network","VPN","IPSec"}', 'Test connettività VPN site-to-site', 'CHG-2025-009'),
  ('fe4', 'Aggiornamento firmware switch', '2025-02-01', null, 'maintenance', 'A. Russo', '{"Network","Switch","BGP"}', 'Aggiornamento firmware switch core', 'CHG-2025-001');
