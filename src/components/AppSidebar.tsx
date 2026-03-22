import { LayoutGrid, ClipboardList, GitBranch, CheckCircle, Users, Calendar, BarChart3, AlertTriangle, Monitor, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/data/changeData';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
  roles?: string[]; // if set, only these roles see it
}

interface AppSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  changeCount: number;
  approvalCount: number;
  cabCount: number;
}

export function AppSidebar({ activePage, onNavigate, changeCount, approvalCount, cabCount }: AppSidebarProps) {
  const { user, logout, hasRole } = useAuth();

  const mainNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={16} /> },
    { id: 'changes', label: 'Tutti i Change', icon: <ClipboardList size={16} />, badge: changeCount },
    { id: 'pipeline', label: 'Pipeline Ambienti', icon: <GitBranch size={16} />, roles: ['admin', 'change_manager', 'env_owner'] },
    { id: 'approvals', label: 'Approvazioni', icon: <CheckCircle size={16} />, badge: approvalCount, badgeColor: 'destructive', roles: ['admin', 'change_manager', 'env_owner'] },
    { id: 'cab', label: 'CAB Board', icon: <Users size={16} />, badge: cabCount, roles: ['admin', 'change_manager'] },
    { id: 'calendar', label: 'Calendario & Freeze', icon: <Calendar size={16} />, roles: ['admin', 'change_manager', 'env_owner'] },
  ];

  const analysisNav: NavItem[] = [
    { id: 'reports', label: 'Report & Analytics', icon: <BarChart3 size={16} />, roles: ['admin', 'change_manager'] },
    { id: 'incidents', label: 'Incidenti Correlati', icon: <AlertTriangle size={16} />, badge: 2, badgeColor: 'destructive', roles: ['admin', 'change_manager'] },
  ];

  const configNav: NavItem[] = [
    { id: 'cmdb', label: 'CMDB', icon: <Monitor size={16} />, roles: ['admin', 'change_manager'] },
    { id: 'config', label: 'Impostazioni', icon: <Settings size={16} />, roles: ['admin'] },
  ];

  const filterByRole = (items: NavItem[]) =>
    items.filter(item => !item.roles || hasRole(item.roles as any));

  const renderNavItem = (item: NavItem) => (
    <div
      key={item.id}
      onClick={() => onNavigate(item.id)}
      className={`flex items-center gap-2.5 px-5 py-2 cursor-pointer transition-all text-[13.5px] border-l-[3px] ${
        activePage === item.id
          ? 'bg-primary/10 text-primary border-l-primary'
          : 'text-text-2 border-l-transparent hover:bg-surface-2 hover:text-foreground'
      }`}
    >
      <span className="opacity-80">{item.icon}</span>
      {item.label}
      {item.badge !== undefined && item.badge > 0 && (
        <span className={`ml-auto text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${
          item.badgeColor === 'destructive' ? 'bg-destructive' : 'bg-primary'
        } text-primary-foreground`}>
          {item.badge}
        </span>
      )}
    </div>
  );

  const filteredMain = filterByRole(mainNav);
  const filteredAnalysis = filterByRole(analysisNav);
  const filteredConfig = filterByRole(configNav);

  return (
    <nav className="w-[248px] bg-surface border-r border-border flex flex-col flex-shrink-0">
      <div className="px-5 py-4 border-b border-border">
        <div className="font-mono text-lg font-semibold text-primary">ChangeFlow</div>
        <div className="text-[10px] text-text-3 tracking-[2px] uppercase mt-0.5">Change Management</div>
        <div className="text-[9px] text-text-3 font-mono mt-0.5">v2.0 — Enterprise</div>
      </div>
      <div className="py-2.5 flex-1 overflow-y-auto">
        <div className="px-4 py-2.5 text-[10px] font-semibold tracking-[2px] uppercase text-text-3">Principale</div>
        {filteredMain.map(renderNavItem)}
        {filteredAnalysis.length > 0 && (
          <>
            <div className="px-4 py-2.5 mt-2 text-[10px] font-semibold tracking-[2px] uppercase text-text-3">Analisi</div>
            {filteredAnalysis.map(renderNavItem)}
          </>
        )}
        {filteredConfig.length > 0 && (
          <>
            <div className="px-4 py-2.5 mt-2 text-[10px] font-semibold tracking-[2px] uppercase text-text-3">Configurazione</div>
            {filteredConfig.map(renderNavItem)}
          </>
        )}
      </div>
      <div className="px-4 py-3.5 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-primary-foreground flex-shrink-0">
            {user?.avatar || '??'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">{user?.name || 'Utente'}</div>
            <div className="text-[11px] text-text-3">{user ? ROLE_LABELS[user.role] : ''}</div>
          </div>
          <button onClick={logout} className="text-text-3 hover:text-destructive transition-colors" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
