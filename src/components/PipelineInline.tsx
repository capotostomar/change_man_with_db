import { ENVS, ENV_COLORS, type Change } from '@/data/changeData';

export function PipelineInline({ change }: { change: Change }) {
  return (
    <div className="flex items-center gap-0.5">
      {ENVS.map((env, i) => {
        const s = change.pipeline[i];
        const bg = s === 'done' || s === 'active' ? ENV_COLORS[env] 
          : s === 'failed' ? '#ff6b6b' 
          : s === 'skip' ? '#c084fc' 
          : 'hsl(var(--surface-3))';
        const opacity = s === 'pending' ? 0.3 : 1;
        const icon = s === 'done' ? '✓' : s === 'active' ? '▶' : s === 'failed' ? '✕' : s === 'skip' ? '⤵' : env[0];
        const textColor = s === 'pending' ? 'hsl(var(--text-3))' : '#fff';
        
        return (
          <div key={env} className="flex items-center gap-0.5">
            <div 
              className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
              style={{ background: bg, opacity, color: textColor }}
              title={`${env}: ${s}`}
            >
              {icon}
            </div>
            {i < 3 && <span className="text-text-3 text-[10px]">›</span>}
          </div>
        );
      })}
    </div>
  );
}

export function PipelineFull({ change }: { change: Change }) {
  return (
    <div className="flex items-center gap-0 w-full" style={{ minWidth: 320 }}>
      {ENVS.map((env, i) => {
        const s = change.pipeline[i];
        const isDone = s === 'done';
        const isActive = s === 'active';
        const isFailed = s === 'failed';
        const isSkip = s === 'skip';

        const dotBg = isDone ? ENV_COLORS[env]
          : isActive ? ENV_COLORS[env]
          : isFailed ? '#ff6b6b'
          : isSkip ? '#c084fc'
          : 'hsl(var(--surface-2))';

        const dotBorder = isDone || isActive || isFailed || isSkip ? dotBg : 'hsl(var(--border))';
        const textColor = isDone ? ENV_COLORS[env] 
          : isActive ? ENV_COLORS[env]
          : isFailed ? '#ff6b6b'
          : isSkip ? '#c084fc'
          : 'hsl(var(--text-3))';

        const icon = isDone ? '✓' : isActive ? '▶' : isFailed ? '✕' : isSkip ? '⤵' : String(i + 1);

        return (
          <div key={env} className="flex-1 flex flex-col items-center relative">
            {i < 3 && (
              <div 
                className="absolute top-[13px] left-1/2 w-full h-0.5"
                style={{
                  background: isDone ? ENV_COLORS[env] : isActive 
                    ? `linear-gradient(90deg, ${ENV_COLORS[env]}, hsl(var(--border)))` 
                    : 'hsl(var(--border))',
                }}
              />
            )}
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                style={{
                  background: dotBg,
                  borderColor: dotBorder,
                  color: isDone || isActive || isFailed || isSkip ? '#fff' : 'hsl(var(--text-3))',
                  boxShadow: isActive ? `0 0 12px ${ENV_COLORS[env]}80` : 'none',
                }}
              >
                {icon}
              </div>
              <div className="text-[10px] font-mono font-semibold tracking-wide" style={{ color: textColor }}>
                {env}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
