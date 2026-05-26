import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts';
import type { CaloriePoint } from '../../utils/chartAdapters';
import { colors } from '../../theme/tokens';
import { ChartTooltip } from './ChartTooltip';

interface Props { data: CaloriePoint[] }

export function CalorieChart({ data }: Props) {
  const hasData = data.some((d) => d.calories > 0);
  if (!hasData) return <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-data)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No calorie data yet</p>;

  const goal = data[0]?.goal ?? 2000;

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine y={goal} stroke={colors.accentDim} strokeDasharray="4 4" label={{ value: 'Goal', fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} />
          <Bar dataKey="calories" name="Calories" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.calories > d.goal ? colors.danger : colors.accent} fillOpacity={d.calories === 0 ? 0.2 : 0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
