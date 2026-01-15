'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface RevenueByProductData {
  productType: string;
  displayName: string;
  amount: number;
}

interface RevenueByProductChartProps {
  data: RevenueByProductData[];
}

// Theme-aware colors
const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export function RevenueByProductChart({ data }: RevenueByProductChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium">{label}</p>
          <p className="text-sm">
            <span className="font-medium">Revenue: </span>
            <span className="text-blue-600">
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
      <div className="h-[280px] flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-sm text-muted-foreground">No revenue data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
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
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip content={renderCustomTooltip} />
        <Bar
          dataKey="amount"
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
