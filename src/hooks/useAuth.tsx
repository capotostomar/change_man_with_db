import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { DbProfile } from '@/lib/supabase.types';
import type { UserRole } from '@/data/changeData';

interface AuthContextType {
  user: DbProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  canSeeChange: (change: { requester: string; assignee: string; involvedResources: string[]; status: string }) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ error: 'Non inizializzato' }),
  logout: async () => {},
  hasRole: () => false,
  canSeeChange: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) { console.error('Errore profilo:', error); return null; }
    return data as DbProfile;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await loadProfile(session.user.id);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const logout = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const canSeeChange = useCallback((change: {
    requester: string; assignee: string; involvedResources: string[]; status: string;
  }) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'change_manager') return true;
    if (user.role === 'env_owner') {
      return ['In Review', 'Approvato', 'Schedulato', 'Implementazione'].includes(change.status);
    }
    const shortName = `${user.name.split(' ')[0].charAt(0)}. ${user.name.split(' ')[1]}`;
    return [user.name, shortName].some(n =>
      change.requester === n || change.assignee === n || change.involvedResources.includes(n)
    );
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, canSeeChange }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
