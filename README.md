# ChangeFlow — Migrazione a Supabase

Questa versione sostituisce il mock in-memory con **Supabase** (PostgreSQL),
con autenticazione reale, persistenza e aggiornamenti realtime.

---

## Architettura delle tabelle

```
Supabase Auth  ──→  profiles          (utenti + ruoli)
                    changes            (change requests)
                    change_comments    (commenti per change)
                    incidents          (incidenti collegati)
                    ci_items           (CMDB)
                    freeze_periods     (periodi freeze)
                    freeze_events      (eventi nel calendario)
                    notifications      (notifiche per utente)
```

---

## PASSO 1 — Crea il progetto Supabase

1. Vai su https://supabase.com e crea un account (gratuito).
2. Clicca **New project**, scegli nome, password DB e region (es. `West EU`).
3. Attendi la creazione (~1 minuto).

---

## PASSO 2 — Esegui lo schema SQL

1. Vai su **SQL Editor** → **New query**.
2. Copia e incolla `supabase/schema.sql`.
3. Clicca **Run**.

---

## PASSO 3 — Carica i dati di esempio

1. **SQL Editor** → **New query**.
2. Copia e incolla `supabase/seed.sql`.
3. Clicca **Run**.

---

## PASSO 4 — Crea gli utenti in Supabase Auth

Vai su **Authentication → Users → Add user → Create new user**.
Crea i 5 utenti con password `changeme123`:

| Email                             | Ruolo          |
|-----------------------------------|----------------|
| marco.albini@company.it           | admin          |
| anna.russo@company.it             | change_manager |
| giuseppe.bianchi@company.it       | requestor      |
| sara.conte@company.it             | env_owner      |
| luigi.ferri@company.it            | requestor      |

Il trigger SQL crea automaticamente i profili nella tabella `profiles`.
Verifica in **Table Editor → profiles** che i 5 record siano presenti.

> Se i profili non vengono creati automaticamente, esegui in SQL Editor:
>
>     INSERT INTO public.profiles (id, name, avatar, role, email, team)
>     VALUES
>       ('<UUID-marco>', 'Marco Albini', 'MA', 'admin', 'marco.albini@company.it', 'IT Operations'),
>       ('<UUID-anna>', 'Anna Russo', 'AR', 'change_manager', 'anna.russo@company.it', 'DevOps'),
>       ('<UUID-giuseppe>', 'Giuseppe Bianchi', 'GB', 'requestor', 'giuseppe.bianchi@company.it', 'Sviluppo'),
>       ('<UUID-sara>', 'Sara Conte', 'SC', 'env_owner', 'sara.conte@company.it', 'Security'),
>       ('<UUID-luigi>', 'Luigi Ferri', 'LF', 'requestor', 'luigi.ferri@company.it', 'Database');
> (sostituisci ogni <UUID-xxx> con il valore visibile in Authentication → Users)

---

## PASSO 5 — Variabili d'ambiente

1. **Settings → API**: copia **Project URL** e **anon public key**.
2. Crea `.env.local` nella root del progetto:

    cp .env.local.example .env.local

3. Apri `.env.local` e inserisci:

    VITE_SUPABASE_URL=https://xxxx.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJ...

Non committare mai `.env.local` (è nel .gitignore).

---

## PASSO 6 — Avvia

    npm install
    npm run dev

Apri http://localhost:5173 e accedi con un utente demo.

---

## Deploy (Vercel / Netlify)

Aggiungi le due variabili d'ambiente nel pannello del tuo hosting.
In Supabase → **Authentication → URL Configuration** aggiungi
l'URL del deploy tra i **Redirect URLs**.

---

## Cosa è cambiato nel codice

| File                              | Modifica                                     |
|-----------------------------------|----------------------------------------------|
| src/lib/supabase.ts               | Client Supabase (NUOVO)                      |
| src/lib/supabase.types.ts         | Tipi DB row (NUOVO)                          |
| src/hooks/useAuth.tsx             | Login/logout via Supabase Auth               |
| src/hooks/useChangeStore.ts       | Tutte le operazioni su DB + realtime         |
| src/pages/LoginPage.tsx           | Form async + gestione errori reali           |
| src/pages/Index.tsx               | Loading state + wrapper addComment           |
| package.json                      | Aggiunta @supabase/supabase-js               |
| supabase/schema.sql               | Schema completo con RLS (NUOVO)              |
| supabase/seed.sql                 | Dati di esempio (NUOVO)                      |
