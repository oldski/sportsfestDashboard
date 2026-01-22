'use client';

import * as React from 'react';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface PaymentStatusData {
  status: string;
  displayName: string;
  count: number;
}

interface PaymentPipelineChartProps {
  data: PaymentStatusData[];
}

// Define the pipeline order and colors
const PIPELINE_ORDER = ['pending', 'payment_processing', 'confirmed', 'deposit_paid', 'fully_paid'];
const PIPELINE_COLORS: Record<string, string> = {
  pending: '#f59e0b',           // amber
  payment_processing: '#f97316', // orange
  confirmed: '#3b82f6',         // blue
  deposit_paid: '#8b5cf6',      // violet
  fully_paid: '#10b981',        // emerald
};

const PIPELINE_LABELS: Record<string, string> = {
  pending: 'Pending',
  payment_processing: 'Processing',
  confirmed: 'Confirmed',
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Fully Paid',
};

export function PaymentPipelineChart({ data }: PaymentPipelineChartProps): React.JSX.Element {
  // Filter and order data for the funnel (exclude cancelled/refunded)
  const funnelData = PIPELINE_ORDER
    .map(status => {
      const found = data.find(d => d.status === status);
      return {
        status,
        name: PIPELINE_LABELS[status],
        value: found?.count || 0,
        fill: PIPELINE_COLORS[status],
      };
    })
    .filter(d => d.value > 0);

  // Get cancelled/refunded counts for separate display
  const cancelledCount = data.find(d => d.status === 'cancelled')?.count || 0;
  const refundedCount = data.find(d => d.status === 'refunded')?.count || 0;

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-md">
          <p className="text-foreground text-sm font-medium">{item.name}</p>
          <p className="text-sm">
            <span className="font-medium">{item.value}</span>
            <span className="text-muted-foreground"> companies</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (funnelData.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-sm text-muted-foreground">No payment data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-6">
        {/* Funnel Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={200}>
            <FunnelChart>
              <Tooltip content={renderCustomTooltip} />
              <Funnel
                data={funnelData}
                dataKey="value"
                isAnimationActive={true}
              >
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <LabelList
                  position="center"
                  fill="#fff"
                  stroke="none"
                  dataKey="value"
                  style={{ fontSize: 14, fontWeight: 600 }}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col justify-center gap-3 pr-4">
          {funnelData.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Show cancelled/refunded separately if any */}
      {(cancelledCount > 0 || refundedCount > 0) && (
        <div className="flex justify-center gap-6 text-sm border-t pt-3">
          {cancelledCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-muted-foreground">Cancelled:</span>
              <span className="font-medium">{cancelledCount}</span>
            </div>
          )}
          {refundedCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gray-500" />
              <span className="text-muted-foreground">Refunded:</span>
              <span className="font-medium">{refundedCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
