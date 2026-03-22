import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppUser, MOCK_USERS, UserRole } from '@/data/changeData';

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  canSeeChange: (change: { requester: string; assignee: string; involvedResources: string[]; status: string }) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  hasRole: () => false,
  canSeeChange: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  const login = useCallback((email: string, _password: string) => {
    const found = MOCK_USERS.find(u => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const canSeeChange = useCallback((change: { requester: string; assignee: string; involvedResources: string[]; status: string }) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'change_manager') return true;
    if (user.role === 'env_owner') {
      return ['In Review', 'Approvato', 'Schedulato', 'Implementazione'].includes(change.status);
    }
    // requestor: sees changes where they are requester, assignee, or involved
    const nameVariants = [user.name, `${user.name.charAt(0)}. ${user.name.split(' ')[1]}`];
    const shortName = `${user.name.split(' ')[0].charAt(0)}. ${user.name.split(' ')[1]}`;
    const allNames = [user.name, shortName];
    return allNames.some(n =>
      change.requester === n || change.assignee === n || change.involvedResources.includes(n)
    );
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, canSeeChange }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
