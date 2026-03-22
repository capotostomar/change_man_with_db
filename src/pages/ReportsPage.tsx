import { useState, useMemo } from 'react';
import { Change } from '@/data/changeData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Search, Filter } from 'lucide-react';

interface ReportsPageProps {
  changes: Change[];
}

export function ReportsPage({ changes }: ReportsPageProps) {
  const [queryStatus, setQueryStatus] = useState('');
  const [queryCategory, setQueryCategory] = useState('');
  const [queryPriority, setQueryPriority] = useState('');
  const [queryAssignee, setQueryAssignee] = useState('');
  const [queryText, setQueryText] = useState('');

  const filtered = useMemo(() => {
    return changes.filter(c => {
      if (queryStatus && c.status !== queryStatus) return false;
      if (queryCategory && c.category !== queryCategory) return false;
      if (queryPriority && c.priority !== queryPriority) return false;
      if (queryAssignee && c.assignee !== queryAssignee) return false;
      if (queryText && !c.title.toLowerCase().includes(queryText.toLowerCase()) && !c.id.toLowerCase().includes(queryText.toLowerCase())) return false;
      return true;
    });
  }, [changes, queryStatus, queryCategory, queryPriority, queryAssignee, queryText]);

  // Stats from filtered
  const statusCounts = filtered.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const pieColors = ['hsl(220, 70%, 55%)', 'hsl(35, 100%, 65%)', 'hsl(160, 60%, 45%)', 'hsl(270, 60%, 65%)', 'hsl(0, 70%, 55%)', 'hsl(200, 70%, 55%)'];
  const catCounts = filtered.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>);
  const catData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));
  const priCounts = filtered.reduce((acc, c) => { acc[c.priority] = (acc[c.priority] || 0) + 1; return acc; }, {} as Record<string, number>);
  const priData = Object.entries(priCounts).map(([name, value]) => ({ name, value }));

  const trendData = [
    { month: 'Set', aperti: 8, chiusi: 6 },
    { month: 'Ott', aperti: 12, chiusi: 10 },
    { month: 'Nov', aperti: 9, chiusi: 11 },
    { month: 'Dic', aperti: 5, chiusi: 4 },
    { month: 'Gen', aperti: 10, chiusi: 7 },
  ];

  const total = filtered.length;
  const closed = filtered.filter(c => c.status === 'Chiuso').length;
  const emergency = filtered.filter(c => c.type === 'Emergenza').length;
  const avgRisk = filtered.filter(c => c.risk === 'Alto' || c.risk === 'Critico').length;

  const kpis = [
    { label: 'Change Totali', value: total, color: 'hsl(var(--primary))' },
    { label: 'Tasso Chiusura', value: total > 0 ? `${Math.round((closed / total) * 100)}%` : '0%', color: 'hsl(var(--accent))' },
    { label: 'Change Emergenza', value: emergency, color: 'hsl(var(--destructive))' },
    { label: 'Alto Rischio', value: avgRisk, color: 'hsl(var(--warning))' },
  ];

  const uniqueStatuses = [...new Set(changes.map(c => c.status))];
  const uniqueCategories = [...new Set(changes.map(c => c.category))];
  const uniquePriorities = [...new Set(changes.map(c => c.priority))];
  const uniqueAssignees = [...new Set(changes.map(c => c.assignee))];

  const exportCSV = () => {
    const headers = ['ID', 'Titolo', 'Tipo', 'Priorità', 'Stato', 'Categoria', 'Assegnato', 'Rischio', 'Impatto', 'Aperto', 'Finestra', 'Pipeline'];
    const rows = filtered.map(c => [c.id, c.title, c.type, c.priority, c.status, c.category, c.assignee, c.risk, c.impact, c.opened, c.window, c.pipelineStrategy]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `change-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = filtered.map(c => ({
      id: c.id, title: c.title, type: c.type, priority: c.priority, status: c.status,
      category: c.category, assignee: c.assignee, risk: c.risk, impact: c.impact,
      opened: c.opened, window: c.window, pipeline: c.pipelineStrategy, envDates: c.envDates,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `change-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const selectClass = "bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-foreground outline-none focus:border-primary";

  return (
    <div className="animate-fade-in space-y-4">
      {/* Query / Filter bar */}
      <div className="bg-surface border border-border rounded-[10px] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-text-3" />
          <span className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px]">Filtri & Query</span>
          <div className="ml-auto flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 text-[11px] bg-accent/10 border border-accent/25 text-accent px-2.5 py-1.5 rounded-lg hover:bg-accent/20 transition">
              <Download size={12} /> CSV
            </button>
            <button onClick={exportJSON} className="flex items-center gap-1.5 text-[11px] bg-primary/10 border border-primary/25 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition">
              <Download size={12} /> JSON
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              className="w-full bg-surface-2 border border-border rounded-lg pl-7 pr-3 py-1.5 text-[12px] text-foreground outline-none focus:border-primary"
              placeholder="Cerca per ID o titolo..."
              value={queryText} onChange={e => setQueryText(e.target.value)}
            />
          </div>
          <select className={selectClass} value={queryStatus} onChange={e => setQueryStatus(e.target.value)}>
            <option value="">Tutti gli stati</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className={selectClass} value={queryCategory} onChange={e => setQueryCategory(e.target.value)}>
            <option value="">Tutte le categorie</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className={selectClass} value={queryPriority} onChange={e => setQueryPriority(e.target.value)}>
            <option value="">Tutte le priorità</option>
            {uniquePriorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className={selectClass} value={queryAssignee} onChange={e => setQueryAssignee(e.target.value)}>
            <option value="">Tutti gli assegnatari</option>
            {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        {(queryStatus || queryCategory || queryPriority || queryAssignee || queryText) && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-text-3">{filtered.length} di {changes.length} change</span>
            <button className="text-[11px] text-primary hover:underline" onClick={() => { setQueryStatus(''); setQueryCategory(''); setQueryPriority(''); setQueryAssignee(''); setQueryText(''); }}>Reset filtri</button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3.5">
        {kpis.map((k, i) => (
          <div key={i} className="bg-surface border border-border rounded-[10px] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: k.color }} />
            <div className="font-mono text-[28px] font-semibold leading-none mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-text-2">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-[10px] p-4">
          <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-4">Trend Mensile</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="aperti" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="chiusi" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-[10px] p-4">
          <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-4">Distribuzione per Stato</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {statusData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-[12px]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                  <span className="text-text-2">{s.name}</span>
                  <span className="font-mono text-text-3 ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[10px] p-4">
          <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-4">Per Categoria</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-[10px] p-4">
          <div className="text-[12px] font-semibold text-text-2 uppercase tracking-[1px] mb-4">Per Priorità</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={60} />
              <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filtered results table */}
      {(queryStatus || queryCategory || queryPriority || queryAssignee || queryText) && (
        <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Risultati Query ({filtered.length})</span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['ID', 'Titolo', 'Stato', 'Priorità', 'Categoria', 'Assegnato', 'Rischio', 'Finestra'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-text-3 bg-surface-2 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-surface-2 transition">
                  <td className="px-3 py-2 text-[11px] font-mono text-primary border-b border-border/50">{c.id}</td>
                  <td className="px-3 py-2 text-[13px] font-medium border-b border-border/50 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-3 py-2 text-[11px] border-b border-border/50">{c.status}</td>
                  <td className="px-3 py-2 text-[11px] border-b border-border/50">{c.priority}</td>
                  <td className="px-3 py-2 text-[11px] border-b border-border/50">{c.category}</td>
                  <td className="px-3 py-2 text-[11px] border-b border-border/50">{c.assignee}</td>
                  <td className="px-3 py-2 text-[11px] border-b border-border/50">{c.risk}</td>
                  <td className="px-3 py-2 text-[11px] font-mono text-text-2 border-b border-border/50">{c.window}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
