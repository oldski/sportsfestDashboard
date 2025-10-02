'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

interface RevenueTrendData {
  date: string;
  [productType: string]: number | string;
}

interface ProductTypeData {
  type: string;
  color: string;
}

interface RevenueTrendsChartProps {
  data: RevenueTrendData[];
  productTypes: ProductTypeData[];
  frequency: 'day' | 'week' | 'month';
  onFrequencyChange: (frequency: 'day' | 'week' | 'month') => void;
}

export function RevenueTrendsChart({
  data,
  productTypes,
  frequency,
  onFrequencyChange
}: RevenueTrendsChartProps): React.JSX.Element {


  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium mb-2">{formatDateLabel(label, frequency)}</p>
          {payload
            .filter((entry: any) => entry.value > 0)
            .map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground capitalize">{entry.dataKey.replace('_', ' ')}</span>
              </div>
              <span className="text-xs font-medium">${entry.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-border">
            <span className="text-xs font-medium">Total</span>
            <span className="text-xs font-bold">${total.toLocaleString()}</span>
          </div>
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

  // Create gradients for each product type
  const gradients = productTypes.map((productType) => {
    const gradientId = `gradient-${productType.type}`;
    return (
      <defs key={gradientId}>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={productType.color} stopOpacity={0.8} />
          <stop offset="95%" stopColor={productType.color} stopOpacity={0.1} />
        </linearGradient>
      </defs>
    );
  });

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
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 80 }}>
          {gradients}
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
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={renderCustomTooltip} />

          {productTypes.map((productType, index) => (
            <Area
              key={productType.type}
              type="monotone"
              dataKey={productType.type}
              stackId={index}
              stroke={productType.color}
              fill={`url(#gradient-${productType.type})`}
              strokeWidth={2}
              fillOpacity={0.6}
            />
          ))}

          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="rect"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
            formatter={(value) => value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}