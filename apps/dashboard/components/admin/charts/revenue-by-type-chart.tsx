'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueByTypeData {
  type: string;
  amount: number;
}

interface RevenueByTypeChartProps {
  data: RevenueByTypeData[];
}

// Generate blue-scaled colors with different shades and opacities
const generateColors = (count: number): string[] => {
  const baseColors = [
    '#1e40af', // blue-800
    '#2563eb', // blue-600  
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd'  // blue-300
  ];
  
  // If we need more colors, cycle through the base colors
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

export function RevenueByTypeChart({ data }: RevenueByTypeChartProps): React.JSX.Element {
  const colors = generateColors(data.length);

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="text-foreground text-sm font-medium">{data.payload.type}</p>
          <p className="text-primary text-sm">${data.value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="hsl(var(--muted-foreground))" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs"
      >
        ${(value / 1000).toFixed(0)}k
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={60}
          fill="#8884d8"
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={renderCustomTooltip} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          wrapperStyle={{
            fontSize: '12px',
            color: 'hsl(var(--muted-foreground))'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}