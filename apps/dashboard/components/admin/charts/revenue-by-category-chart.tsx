'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueByCategoryData {
  month: string;
  sponsorships: number;
  companyTeams: number;
  tentRentals: number;
}

interface RevenueByCategoryChartProps {
  data: RevenueByCategoryData[];
}

const CATEGORY_CONFIG = {
  sponsorships: {
    label: 'Sponsorships',
    color: '#8b5cf6', // purple
    gradientId: 'sponsorshipsGradient'
  },
  companyTeams: {
    label: 'Company Teams',
    color: '#3b82f6', // blue
    gradientId: 'companyTeamsGradient'
  },
  tentRentals: {
    label: 'Tent Rentals',
    color: '#10b981', // emerald
    gradientId: 'tentRentalsGradient'
  }
};

export function RevenueByCategoryChart({ data }: RevenueByCategoryChartProps): React.JSX.Element {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Calculate total for this data point
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-xs font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs flex justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </p>
          ))}
          <div className="border-t border-border mt-2 pt-2">
            <p className="text-xs flex justify-between gap-4 font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-4 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-xs text-muted-foreground">No revenue data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={CATEGORY_CONFIG.sponsorships.gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CATEGORY_CONFIG.sponsorships.color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={CATEGORY_CONFIG.sponsorships.color} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id={CATEGORY_CONFIG.companyTeams.gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CATEGORY_CONFIG.companyTeams.color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={CATEGORY_CONFIG.companyTeams.color} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id={CATEGORY_CONFIG.tentRentals.gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CATEGORY_CONFIG.tentRentals.color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={CATEGORY_CONFIG.tentRentals.color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          width={45}
        />
        <Tooltip content={renderCustomTooltip} />
        <Legend content={renderLegend} />
        <Area
          type="monotone"
          dataKey="tentRentals"
          name={CATEGORY_CONFIG.tentRentals.label}
          stackId="1"
          stroke={CATEGORY_CONFIG.tentRentals.color}
          strokeWidth={1.5}
          fill={`url(#${CATEGORY_CONFIG.tentRentals.gradientId})`}
        />
        <Area
          type="monotone"
          dataKey="companyTeams"
          name={CATEGORY_CONFIG.companyTeams.label}
          stackId="1"
          stroke={CATEGORY_CONFIG.companyTeams.color}
          strokeWidth={1.5}
          fill={`url(#${CATEGORY_CONFIG.companyTeams.gradientId})`}
        />
        <Area
          type="monotone"
          dataKey="sponsorships"
          name={CATEGORY_CONFIG.sponsorships.label}
          stackId="1"
          stroke={CATEGORY_CONFIG.sponsorships.color}
          strokeWidth={1.5}
          fill={`url(#${CATEGORY_CONFIG.sponsorships.gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
