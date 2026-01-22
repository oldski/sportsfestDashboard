'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface ReferralSourceChartData {
  name: string;
  value: number;
  percentage: number;
}

interface ReferralSourceChartProps {
  data: ReferralSourceChartData[];
  height?: number;
}

// Theme-aware colors
const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

export function ReferralSourceChart({ data, height = 320 }: ReferralSourceChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium">{label}</p>
          <p className="text-sm">
            <span className="font-medium">Responses: </span>
            <span className="text-blue-600">{item.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {item.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No referral source data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <YAxis
          type="category"
          dataKey="name"
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <Tooltip content={renderCustomTooltip} />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}