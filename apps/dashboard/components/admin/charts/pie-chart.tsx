'use client';

import * as React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  height?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  donut?: boolean;
  valueFormatter?: (value: number) => string;
}

// Theme-aware colors that work in light/dark mode
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

export function PieChart({
  data,
  height = 280,
  showLabels = true,
  showLegend = true,
  donut = false,
  valueFormatter = (value) => value.toLocaleString()
}: PieChartProps): React.JSX.Element {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.payload.fill }}
            />
            <span className="text-foreground text-sm font-medium">{item.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{valueFormatter(item.value)}</span>
            {' '}({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't show labels for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const legendFormatter = (value: string, entry: any) => {
    const item = data.find(d => d.name === value);
    if (item && total > 0) {
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <span className="text-sm text-foreground">
          {value} ({percentage}%)
        </span>
      );
    }
    return <span className="text-sm text-foreground">{value}</span>;
  };

  if (data.length === 0 || total === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomLabel : undefined}
          outerRadius={donut ? 80 : 90}
          innerRadius={donut ? 50 : 0}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={renderCustomTooltip} />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={10}
            formatter={legendFormatter}
            wrapperStyle={{ fontSize: '12px' }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
