import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { VolumePoint } from '../../utils/chartAdapters';
import { colors } from '../../theme/tokens';
import { ChartTooltip } from './ChartTooltip';

interface Props { data: VolumePoint[] }

export function ExerciseVolumeChart({ data }: Props) {
  const hasData = data.some((d) => d.volumeLbs > 0 || d.sessions > 0);
  if (!hasData) return <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-data)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No exercise data yet</p>;

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 24, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis yAxisId="vol" tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="sess" orientation="right" tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
          <Tooltip content={<ChartTooltip />} />
          <Bar yAxisId="vol" dataKey="volumeLbs" name="Volume (lbs)" fill={colors.accent} fillOpacity={0.8} radius={[3, 3, 0, 0]} />
          <Line yAxisId="sess" type="monotone" dataKey="sessions" name="Sessions" stroke={colors.success} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
