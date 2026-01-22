'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompanyPlayerCountData {
  name: string;
  playerCount: number;
}

interface TopCompaniesByPlayersChartProps {
  data: CompanyPlayerCountData[];
}

export function TopCompaniesByPlayersChart({ data }: TopCompaniesByPlayersChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium">{label}</p>
          <p className="text-sm mt-1">
            <span className="font-medium text-emerald-600">{payload[0].value}</span>
            <span className="text-muted-foreground"> players</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-muted-foreground">
        No player data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          width={120}
          tick={{ fontSize: 11 }}
        />
        <Tooltip content={renderCustomTooltip} />
        <Bar
          dataKey="playerCount"
          fill="#10b981"
          radius={[0, 4, 4, 0]}
          name="Players"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
