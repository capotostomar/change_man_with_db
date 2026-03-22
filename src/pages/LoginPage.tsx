import { useState } from 'react';
import { ROLE_LABELS } from '@/data/changeData';
import { useAuth } from '@/hooks/useAuth';

// Utenti demo: dopo aver eseguito il seed SQL, crea questi utenti
// in Supabase Auth (Authentication → Users) con le stesse email.
// Password consigliata per il demo: "changeme123"
const DEMO_USERS = [
  { email: 'marco.albini@company.it', name: 'Marco Albini', avatar: 'MA', role: 'admin', team: 'IT Operations' },
  { email: 'anna.russo@company.it', name: 'Anna Russo', avatar: 'AR', role: 'change_manager', team: 'DevOps' },
  { email: 'giuseppe.bianchi@company.it', name: 'Giuseppe Bianchi', avatar: 'GB', role: 'requestor', team: 'Sviluppo' },
  { email: 'sara.conte@company.it', name: 'Sara Conte', avatar: 'SC', role: 'env_owner', team: 'Security' },
  { email: 'luigi.ferri@company.it', name: 'Luigi Ferri', avatar: 'LF', role: 'requestor', team: 'Database' },
] as const;

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) setError(err);
  };

  const quickLogin = async (userEmail: string) => {
    setError('');
    setLoading(true);
    const { error: err } = await login(userEmail, 'changeme123');
    setLoading(false);
    if (err) setError(`Login rapido fallito: ${err}. Assicurati di aver creato gli utenti in Supabase Auth.`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="font-mono text-3xl font-bold text-primary mb-1">ChangeFlow</div>
          <div className="text-[11px] text-text-3 tracking-[3px] uppercase">Change Management Platform</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-xl mb-4">
          <div className="text-[15px] font-semibold mb-4">Accedi</div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@company.it"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-text-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-primary"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            {error && <div className="text-destructive text-[12px] bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground text-[13px] font-medium py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[11px] font-semibold text-text-3 uppercase tracking-wide mb-3">Accesso rapido (Demo)</div>
          <div className="space-y-2">
            {DEMO_USERS.map(u => (
              <button
                key={u.email}
                onClick={() => quickLogin(u.email)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-surface-2 hover:border-primary/30 transition-all text-left disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[11px] font-semibold text-primary-foreground flex-shrink-0">
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{u.name}</div>
                  <div className="text-[11px] text-text-3">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS]} · {u.team}</div>
                </div>
                <span className="text-[10px] font-mono text-text-3 bg-surface-3 px-2 py-0.5 rounded">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
