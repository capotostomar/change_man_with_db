import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRequestSent, setShowRequestSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) setError('Credenziali non valide. Riprova.');
  };

  const handleRequestAccess = () => {
    // Apre il client email con una richiesta precompilata all'admin
    const subject = encodeURIComponent('Richiesta accesso ChangeFlow');
    const body = encodeURIComponent(
      'Gentile amministratore,\n\nRichiedo l\'accesso alla piattaforma ChangeFlow.\n\nNome: \nEmail: \nTeam: \nRuolo richiesto: \n\nGrazie.'
    );
    window.location.href = `mailto:marco.albini@company.it?subject=${subject}&body=${body}`;
    setShowRequestSent(true);
    setTimeout(() => setShowRequestSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="font-mono text-3xl font-bold text-primary mb-1">ChangeFlow</div>
          <div className="text-[11px] text-text-3 tracking-[3px] uppercase">Change Management Platform</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-xl mb-3">
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
                required
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
                required
              />
            </div>
            {error && (
              <div className="text-destructive text-[12px] bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground text-[13px] font-medium py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-[12px] text-text-3 mb-2">Non hai ancora un account?</p>
          {showRequestSent ? (
            <div className="text-[12px] text-accent font-medium">
              ✓ Richiesta inviata all'amministratore
            </div>
          ) : (
            <button
              onClick={handleRequestAccess}
              className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline font-medium"
            >
              <Mail size={13} />
              Richiedi accesso all'amministratore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
