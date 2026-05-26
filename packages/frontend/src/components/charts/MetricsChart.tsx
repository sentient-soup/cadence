import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MetricsPoint } from '../../utils/chartAdapters';
import { colors } from '../../theme/tokens';
import { ChartTooltip } from './ChartTooltip';

type Metric = 'hr' | 'systolic' | 'diastolic' | 'sleep' | 'weight';

const METRICS: { key: Metric; label: string; color: string; unit: string }[] = [
  { key: 'weight',    label: 'Weight',   color: colors.accent,  unit: 'lbs' },
  { key: 'hr',        label: 'HR',       color: colors.info,    unit: 'bpm' },
  { key: 'systolic',  label: 'Systolic', color: colors.danger,  unit: 'mmHg' },
  { key: 'diastolic', label: 'Diastolic',color: '#e07070',      unit: 'mmHg' },
  { key: 'sleep',     label: 'Sleep',    color: colors.success, unit: 'hrs' },
];

interface Props { data: MetricsPoint[] }

export function MetricsChart({ data }: Props) {
  const [active, setActive] = useState<Metric[]>(['weight', 'hr']);

  const toggle = (key: Metric) => {
    setActive((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const hasData = data.some((d) => METRICS.some(({ key }) => d[key] !== null));
  if (!hasData) return <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-data)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No vitals data yet</p>;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {METRICS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.08em',
              padding: '3px 10px',
              borderRadius: 20,
              border: `1px solid ${active.includes(key) ? color : colors.gridLine}`,
              background: active.includes(key) ? `${color}22` : 'transparent',
              color: active.includes(key) ? color : colors.textDim,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip />} />
            {METRICS.filter(({ key }) => active.includes(key)).map(({ key, label, color }) => (
              <Line key={key} type="monotone" dataKey={key} name={label} stroke={color} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
