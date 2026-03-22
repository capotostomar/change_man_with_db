import { useState } from 'react';
import { MOCK_USERS, ROLE_LABELS } from '@/data/changeData';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(email, password)) {
      setError('Credenziali non valide. Usa una delle email demo.');
    }
  };

  const quickLogin = (userEmail: string) => {
    login(userEmail, 'demo');
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
                placeholder="Qualsiasi valore (demo)"
              />
            </div>
            {error && <div className="text-destructive text-[12px] bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground text-[13px] font-medium py-2.5 rounded-lg hover:brightness-110 transition-all"
            >
              Accedi
            </button>
          </form>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[11px] font-semibold text-text-3 uppercase tracking-wide mb-3">Accesso rapido (Demo)</div>
          <div className="space-y-2">
            {MOCK_USERS.map(u => (
              <button
                key={u.id}
                onClick={() => quickLogin(u.email)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-surface-2 hover:border-primary/30 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[11px] font-semibold text-primary-foreground flex-shrink-0">
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{u.name}</div>
                  <div className="text-[11px] text-text-3">{ROLE_LABELS[u.role]} · {u.team}</div>
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
