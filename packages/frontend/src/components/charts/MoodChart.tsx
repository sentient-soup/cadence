import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MoodPoint } from '../../utils/chartAdapters';
import { colors } from '../../theme/tokens';
import { ChartTooltip } from './ChartTooltip';

interface Props { data: MoodPoint[] }

export function MoodChart({ data }: Props) {
  const hasData = data.some((d) => d.mood !== null);
  if (!hasData) return <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-data)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No mood data yet</p>;

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[1, 10]} tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} ticks={[1, 5, 10]} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontFamily: 'DM Mono', fontSize: 11, color: colors.textDim }} />
          <Line type="monotone" dataKey="mood"   name="Mood"   stroke={colors.accent}  strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="energy" name="Energy" stroke={colors.success} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="stress" name="Stress" stroke={colors.danger}  strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
