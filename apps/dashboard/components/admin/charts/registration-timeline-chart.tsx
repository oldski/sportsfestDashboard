'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RegistrationTimelineData {
  date: string;
  registrations: number;
  cumulative: number;
}

interface RegistrationTimelineChartProps {
  data: RegistrationTimelineData[];
}

export function RegistrationTimelineChart({ data }: RegistrationTimelineChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Daily: </span>
              <span className="text-blue-600">{payload[0].value} registrations</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Total: </span>
              <span className="text-blue-800">{payload[1].value} registered</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          yAxisId="daily"
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          orientation="left"
        />
        <YAxis 
          yAxisId="cumulative"
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          orientation="right"
        />
        <Tooltip content={renderCustomTooltip} />
        <Area 
          yAxisId="daily"
          type="monotone" 
          dataKey="registrations" 
          stroke="#60a5fa" 
          fill="#60a5fa"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Area 
          yAxisId="cumulative"
          type="monotone" 
          dataKey="cumulative" 
          stroke="#1e40af" 
          fill="#1e40af"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}