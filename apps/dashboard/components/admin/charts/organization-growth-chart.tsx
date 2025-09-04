'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OrganizationGrowthData {
  month: string;
  organizations: number;
}

interface OrganizationGrowthChartProps {
  data: OrganizationGrowthData[];
}

export function OrganizationGrowthChart({ data }: OrganizationGrowthChartProps): React.JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))', 
            borderRadius: '6px',
            fontSize: '12px'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Area 
          type="monotone" 
          dataKey="organizations" 
          stroke="#3b82f6" 
          fill="#3b82f6"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}