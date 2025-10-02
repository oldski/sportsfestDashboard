'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

interface OrganizationRegistrationData {
  date: string;
  newCompanies: number;
}

interface OrganizationRegistrationChartProps {
  data: OrganizationRegistrationData[];
  frequency: 'day' | 'week' | 'month';
  onFrequencyChange: (frequency: 'day' | 'week' | 'month') => void;
}

export function OrganizationRegistrationChart({
  data,
  frequency,
  onFrequencyChange
}: OrganizationRegistrationChartProps): React.JSX.Element {

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium mb-2">{formatDateLabel(label, frequency)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">New Companies</span>
              </div>
              <span className="text-xs font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatDateLabel = (value: string, freq: string) => {
    if (freq === 'month') {
      const [year, month] = value.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (freq === 'week') {
      return `Week of ${new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatXAxisLabel = (value: string) => {
    if (frequency === 'month') {
      const [year, month] = value.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else if (frequency === 'week') {
      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Create gradient
  const gradientId = 'gradient-companies';

  return (
    <div className="space-y-4">
      {/* Frequency Selector */}
      <div className="flex justify-end">
        <Select value={frequency} onValueChange={onFrequencyChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 80 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--chart-2))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgb(var(--chart-2))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatXAxisLabel}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={frequency === 'day' ? 'preserveEnd' : frequency === 'week' ? 0 : 'preserveStartEnd'}
            minTickGap={frequency === 'day' ? 30 : 5}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={renderCustomTooltip} />

          <Area
            type="monotone"
            dataKey="newCompanies"
            stroke="rgb(var(--chart-2))"
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            fillOpacity={0.6}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="rect"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
            formatter={() => 'New Company Registrations'}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}