'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueProgressionData {
  date: string;
  cumulative: number;
}

interface RevenueProgressionChartProps {
  data: RevenueProgressionData[];
}

export function RevenueProgressionChart({ data }: RevenueProgressionChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="text-foreground text-xs font-medium">{label}</p>
          <p className="text-xs">
            <span className="text-emerald-600 font-medium">
              ${payload[0].value.toLocaleString()}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center">
        <p className="text-xs text-muted-foreground">No revenue data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis hide />
        <Tooltip content={renderCustomTooltip} />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          activeDot={{ r: 4, fill: '#10b981' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
