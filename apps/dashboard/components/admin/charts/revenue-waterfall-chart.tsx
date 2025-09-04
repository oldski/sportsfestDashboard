'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueWaterfallData {
  category: string;
  amount: number;
  type: 'positive' | 'negative' | 'total';
}

interface RevenueWaterfallChartProps {
  data: RevenueWaterfallData[];
}

export function RevenueWaterfallChart({ data }: RevenueWaterfallChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium">{label}</p>
          <p className="text-sm">
            <span className="font-medium">Amount: </span>
            <span className={data.payload.type === 'negative' ? 'text-red-600' : 'text-blue-600'}>
              ${Math.abs(data.value).toLocaleString()}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (entry: RevenueWaterfallData) => {
    switch (entry.type) {
      case 'positive': return '#3b82f6'; // blue-500
      case 'negative': return '#ef4444'; // red-500  
      case 'total': return '#1e40af'; // blue-800
      default: return '#3b82f6';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="category" 
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={renderCustomTooltip} />
        <Bar 
          dataKey="amount" 
          fill="#3b82f6"
          shape={(props: any) => {
            const { payload } = props;
            return (
              <rect
                {...props}
                fill={getBarColor(payload)}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}