'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface OrganizationRevenueData {
  name: string;
  teamRegistration: number;
  tentRentals: number;
  sponsorships: number;
  other: number;
  total: number;
}

interface OrganizationPerformanceChartProps {
  data: OrganizationRevenueData[];
}

const COLORS = {
  teamRegistration: '#3b82f6', // blue-500
  tentRentals: '#10b981', // emerald-500
  sponsorships: '#f59e0b', // amber-500
  other: '#6b7280', // gray-500
};

export function OrganizationPerformanceChart({ data }: OrganizationPerformanceChartProps): React.JSX.Element {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              entry.value > 0 && (
                <p key={index} className="text-sm flex justify-between gap-4">
                  <span style={{ color: entry.color }}>{entry.name}:</span>
                  <span className="font-medium">${entry.value.toLocaleString()}</span>
                </p>
              )
            ))}
            <div className="border-t border-border pt-1 mt-1">
              <p className="text-sm flex justify-between gap-4 font-medium">
                <span>Total:</span>
                <span>${total.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Check which categories have data
  const hasTeamRegistration = data.some(d => d.teamRegistration > 0);
  const hasTentRentals = data.some(d => d.tentRentals > 0);
  const hasSponsorships = data.some(d => d.sponsorships > 0);
  const hasOther = data.some(d => d.other > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-muted-foreground">
        No revenue data available
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
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
        <Legend
          wrapperStyle={{ paddingTop: 10 }}
          iconType="square"
          iconSize={10}
        />
        {hasTeamRegistration && (
          <Bar
            dataKey="teamRegistration"
            stackId="revenue"
            fill={COLORS.teamRegistration}
            name="Team Registration"
          />
        )}
        {hasTentRentals && (
          <Bar
            dataKey="tentRentals"
            stackId="revenue"
            fill={COLORS.tentRentals}
            name="Tent Rentals"
          />
        )}
        {hasSponsorships && (
          <Bar
            dataKey="sponsorships"
            stackId="revenue"
            fill={COLORS.sponsorships}
            name="Sponsorships"
          />
        )}
        {hasOther && (
          <Bar
            dataKey="other"
            stackId="revenue"
            fill={COLORS.other}
            name="Other"
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
