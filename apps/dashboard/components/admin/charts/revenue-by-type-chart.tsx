'use client';

import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

import type { RevenueTrendData, RevenueProductType, FrequencyType } from '~/actions/admin/get-revenue-trends';

interface RevenueByTypeChartProps {
  data: RevenueTrendData[];
  productTypes: RevenueProductType[];
  frequency: FrequencyType;
  onFrequencyChange: (frequency: FrequencyType) => void;
}

export function RevenueByTypeChart({
  data,
  productTypes,
  frequency,
  onFrequencyChange
}: RevenueByTypeChartProps): React.JSX.Element {

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">{entry.dataKey}</span>
              </div>
              <span className="text-xs font-medium">${entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (value: string) => {
    if (frequency === 'monthly') {
      return new Date(value + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Frequency Selector */}
      <div className="flex justify-end">
        <Select value={frequency} onValueChange={onFrequencyChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatXAxisLabel}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={renderCustomTooltip} />

          {productTypes.map((productType, index) => (
            <Line
              key={productType.type}
              type="monotone"
              dataKey={productType.type}
              stroke={productType.color}
              strokeWidth={2}
              dot={{ fill: productType.color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: productType.color, strokeWidth: 2 }}
            />
          ))}

          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="line"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}