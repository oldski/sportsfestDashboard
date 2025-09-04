'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OrganizationPerformanceData {
  name: string;
  registrationRate: number; // percentage
  paymentCompletion: number; // percentage
  memberCount: number;
  revenue: number;
}

interface OrganizationPerformanceChartProps {
  data: OrganizationPerformanceData[];
}

export function OrganizationPerformanceChart({ data }: OrganizationPerformanceChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const orgData = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="font-medium">Registration Rate: </span>
              <span className="text-blue-600">{orgData.registrationRate}%</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Payment Rate: </span>
              <span className="text-blue-500">{orgData.paymentCompletion}%</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Members: </span>
              <span className="text-muted-foreground">{orgData.memberCount}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Revenue: </span>
              <span className="text-muted-foreground">${orgData.revenue.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="name" 
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          className="fill-muted-foreground text-xs"
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={renderCustomTooltip} />
        <Bar 
          dataKey="registrationRate" 
          fill="#3b82f6" 
          name="Registration Rate"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="paymentCompletion" 
          fill="#60a5fa" 
          name="Payment Completion"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}