import { useState, useMemo } from 'react';
import { Bell, Plus } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { useChangeStore } from '@/hooks/useChangeStore';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ChangesPage } from '@/pages/ChangesPage';
import { PipelinePage } from '@/pages/PipelinePage';
import { CalendarFreezePage } from '@/pages/CalendarFreezePage';
import { ApprovalsPage } from '@/pages/ApprovalsPage';
import { CABBoardPage } from '@/pages/CABBoardPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { IncidentsPage } from '@/pages/IncidentsPage';
import { CMDBPage } from '@/pages/CMDBPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ChangeDetailModal } from '@/components/ChangeDetailModal';
import { NewChangeModal } from '@/components/NewChangeModal';

const Index = () => {
  const { user, canSeeChange, hasRole } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [detailChangeId, setDetailChangeId] = useState<string | null>(null);
  const [showNewChange, setShowNewChange] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const store = useChangeStore();
  const { changes, notifications, markAllRead } = store;

  // Filter changes based on role
  const visibleChanges = useMemo(() => {
    if (!user) return [];
    return changes.filter(c => canSeeChange(c));
  }, [changes, user, canSeeChange]);

  const changeCount = visibleChanges.filter(c => c.status !== 'Chiuso').length;
  const approvalCount = visibleChanges.filter(c => c.status === 'In Review').length;
  const detailChange = detailChangeId ? changes.find(c => c.id === detailChangeId) : null;

  if (!user) return <LoginPage />;

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard', changes: 'Tutti i Change', pipeline: 'Pipeline Ambienti',
    approvals: 'Approvazioni', cab: 'CAB Board', calendar: 'Calendario & Freeze',
    reports: 'Report & Analytics', incidents: 'Incidenti Correlati', cmdb: 'CMDB', config: 'Configurazione',
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar activePage={activePage} onNavigate={setActivePage} changeCount={changeCount} approvalCount={approvalCount} cabCount={approvalCount} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[60px] bg-surface border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
          <div className="text-[17px] font-semibold">{pageTitles[activePage] || activePage}</div>
          <div className="ml-auto flex gap-2 items-center">
            <button className="flex items-center gap-1.5 text-[13px] text-text-2 border border-border rounded-lg px-3 py-1.5 hover:bg-surface-2" onClick={() => setShowNewChange(true)}>
              <Plus size={13} /> Nuovo Change
            </button>
            <div className="relative">
              <button className="flex items-center text-text-2 border border-border rounded-lg px-2 py-1.5 hover:bg-surface-2" onClick={() => setShowNotif(!showNotif)}>
                <Bell size={14} />
              </button>
              {notifications.some(n => !n.read) && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full border-2 border-surface" />}
              {showNotif && (
                <div className="absolute top-11 right-0 w-[320px] bg-surface border border-border rounded-[10px] shadow-2xl z-50">
                  <div className="px-4 py-3 border-b border-border flex justify-between items-center text-[13px] font-semibold">
                    Notifiche <span className="text-[10px] text-text-3 cursor-pointer" onClick={markAllRead}>Segna tutte lette</span>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.slice(0, 10).map((n, i) => (
                      <div key={i} className={`px-4 py-3 border-b border-border text-[13px] leading-snug ${!n.read ? 'bg-primary/[.04]' : ''}`}>
                        <div className="flex gap-2 items-start">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'opacity-0' : 'bg-primary'}`} />
                          <div>
                            <div>{n.text}</div>
                            <div className="text-[10px] text-text-3 font-mono mt-0.5">{n.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7">
          {activePage === 'dashboard' && <DashboardPage changes={visibleChanges} onNavigate={setActivePage} onOpenDetail={setDetailChangeId} />}
          {activePage === 'changes' && <ChangesPage changes={visibleChanges} onOpenDetail={setDetailChangeId} onNewChange={() => setShowNewChange(true)} />}
          {activePage === 'pipeline' && <PipelinePage changes={visibleChanges} onOpenDetail={setDetailChangeId} onPromote={store.promoteChange} />}
          {activePage === 'approvals' && <ApprovalsPage changes={visibleChanges} onOpenDetail={setDetailChangeId} onAdvance={store.advanceStatus} onReject={store.rejectChange} />}
          {activePage === 'cab' && <CABBoardPage changes={visibleChanges} onOpenDetail={setDetailChangeId} onAdvance={store.advanceStatus} onReject={store.rejectChange} />}
          {activePage === 'calendar' && (
            <CalendarFreezePage
              changes={visibleChanges} freezePeriods={store.freezePeriods} freezeEvents={store.freezeEvents}
              onOpenDetail={setDetailChangeId} onAddFreezePeriod={store.addFreezePeriod}
              onAddFreezeEvent={store.addFreezeEvent} onRemoveFreezeEvent={store.removeFreezeEvent}
              onRemoveFreezePeriod={store.removeFreezePeriod} getConflictsForDate={store.getConflictsForDate}
            />
          )}
          {activePage === 'reports' && <ReportsPage changes={visibleChanges} />}
          {activePage === 'incidents' && <IncidentsPage changes={visibleChanges} onOpenDetail={setDetailChangeId} />}
          {activePage === 'cmdb' && <CMDBPage changes={visibleChanges} onOpenDetail={setDetailChangeId} />}
          {activePage === 'config' && <SettingsPage />}
        </div>
      </div>

      {detailChange && (
        <ChangeDetailModal
          change={detailChange} changes={changes} onClose={() => setDetailChangeId(null)}
          onAdvance={store.advanceStatus} onReject={store.rejectChange} onReopen={store.reopenChange}
          onPromote={store.promoteChange} onAddComment={store.addComment}
        />
      )}
      {showNewChange && <NewChangeModal changes={changes} incidents={store.incidents} onClose={() => setShowNewChange(false)} onSubmit={store.addChange as any} />}
    </div>
  );
};

export default Index;
