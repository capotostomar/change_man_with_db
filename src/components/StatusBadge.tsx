import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  'Aperto': 'bg-destructive/10 text-destructive before:bg-destructive',
  'In Review': 'bg-primary/10 text-primary before:bg-primary',
  'Approvato': 'bg-accent/10 text-accent before:bg-accent',
  'Schedulato': 'bg-warning/10 text-warning before:bg-warning',
  'Implementazione': 'bg-warning/20 text-warning animate-pulse before:bg-warning',
  'Chiuso': 'bg-text-3/20 text-text-3 before:bg-text-3',
  'Rifiutato': 'bg-destructive/10 text-destructive before:bg-destructive',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide',
      "before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:flex-shrink-0",
      statusStyles[status] || statusStyles['Chiuso']
    )}>
      {status}
    </span>
  );
}

const priorityIcons: Record<string, string> = {
  'Critica': '🔴',
  'Alta': '🟠',
  'Media': '🔵',
  'Bassa': '⚪',
};

const priorityStyles: Record<string, string> = {
  'Critica': 'text-destructive',
  'Alta': 'text-warning',
  'Media': 'text-primary',
  'Bassa': 'text-text-3',
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', priorityStyles[priority])}>
      {priorityIcons[priority]} {priority}
    </span>
  );
}

const riskStyles: Record<string, string> = {
  'Basso': 'bg-accent/10 text-accent before:bg-accent',
  'Medio': 'bg-primary/10 text-primary before:bg-primary',
  'Alto': 'bg-warning/10 text-warning before:bg-warning',
  'Critico': 'bg-destructive/10 text-destructive before:bg-destructive',
};

export function RiskBadge({ risk }: { risk: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
      "before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full",
      riskStyles[risk] || riskStyles['Basso']
    )}>
      {risk}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className="bg-surface-3 text-text-2 px-2 py-0.5 rounded text-[10px] font-mono">
      {type}
    </span>
  );
}
