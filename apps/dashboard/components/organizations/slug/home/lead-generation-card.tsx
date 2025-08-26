'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  type CardProps
} from '@workspace/ui/components/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@workspace/ui/components/chart';
import { cn } from '@workspace/ui/lib/utils';

import type { LeadGenerationDataPointDto } from '~/types/dtos/lead-generation-data-point-dto';

const chartConfig = {
  contacts: {
    label: 'Contacts'
  },
  people: {
    label: 'People',
    color: 'var(--chart-1)'
  },
  companies: {
    label: 'Companies',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export type LeadGenerationCardProps = CardProps & {
  data: LeadGenerationDataPointDto[];
};

export function LeadGenerationCard({
  data,
  className,
  ...other
}: LeadGenerationCardProps): React.JSX.Element {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('people');

  const total = React.useMemo(
    () => ({
      people: data.reduce((acc, curr) => acc + curr.people, 0),
      companies: data.reduce((acc, curr) => acc + curr.companies, 0)
    }),
    [data]
  );

  return (
    <Card
      className={cn('pt-0', className)}
      {...other}
    >
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-sm">Lead generation</CardTitle>
          <CardDescription>New contacts added to the pool.</CardDescription>
        </div>
        <div className="flex">
          {['people', 'companies'].map((value) => {
            const chart = value as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="cursor-pointer relative z-10 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span
                  suppressHydrationWarning
                  className="text-xs text-muted-foreground"
                >
                  {chartConfig[chart].label}
                </span>
                <span
                  suppressHydrationWarning
                  className="text-lg font-bold leading-none sm:text-2xl"
                >
                  {total[value as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="contacts"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  }
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
