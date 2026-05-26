interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#2a2a2a',
      border: '1px solid #c87941',
      borderRadius: 6,
      padding: '8px 12px',
      fontFamily: 'DM Mono, monospace',
      fontSize: 12,
    }}>
      <p style={{ color: '#888', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#ebebeb', margin: '2px 0' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}
