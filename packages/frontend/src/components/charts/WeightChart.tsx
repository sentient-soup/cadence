import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeightPoint } from '../../utils/chartAdapters';
import { colors } from '../../theme/tokens';
import { ChartTooltip } from './ChartTooltip';

interface Props { data: WeightPoint[] }

export function WeightChart({ data }: Props) {
  const filtered = data.filter((d) => d.weight !== null);
  if (filtered.length < 2) return <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-data)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Not enough data yet</p>;

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.accent} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: colors.textDim, fontSize: 10, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="weight" name="Weight (lbs)" stroke={colors.accent} strokeWidth={2} fill="url(#weightGrad)" connectNulls dot={false} activeDot={{ r: 4, fill: colors.accent }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
