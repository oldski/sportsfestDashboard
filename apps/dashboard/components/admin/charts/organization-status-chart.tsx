'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface OrganizationStatusData {
  status: string;
  displayName: string;
  count: number;
}

interface OrganizationStatusChartProps {
  data: OrganizationStatusData[];
}

// Chart colors
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',      // amber
  confirmed: '#3b82f6',    // blue
  deposit_paid: '#8b5cf6', // violet
  fully_paid: '#10b981',   // emerald
  cancelled: '#ef4444',    // red
  refunded: '#6b7280',     // gray
};

export function OrganizationStatusChart({ data }: OrganizationStatusChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium">{label}</p>
          <p className="text-sm">
            <span className="font-medium">Organizations: </span>
            <span>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-sm text-muted-foreground">No registration data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
        <XAxis type="number" className="fill-muted-foreground text-xs" tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="displayName"
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip content={renderCustomTooltip} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
