'use client';

import * as React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@workspace/ui/components/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@workspace/ui/components/tabs";
import {DollarSignIcon} from "lucide-react";
import {getRevenueTrends} from "~/actions/admin/get-revenue-trends";
import {RevenueTrendsChart} from "~/components/admin/charts/revenue-trends-chart";
import {formatCurrency} from "~/lib/formatters";

export default function RevenueStatsPage(): React.JSX.Element {
  const [frequency, setFrequency] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string>('products');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getRevenueTrends(frequency);
        setData(result);
      } catch (error) {
        console.error('Error fetching revenue trends:', error);
      }
    };

    fetchData();
  }, [frequency]);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const result = await getRevenueTrends(frequency);
        setData(result);
      } catch (error) {
        console.error('Error fetching revenue trends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleFrequencyChange = (newFrequency: 'daily' | 'weekly' | 'monthly') => {
    setFrequency(newFrequency);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <DollarSignIcon className="h-5 w-5"/>
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.trends?.length) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <DollarSignIcon className="h-5 w-5"/>
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">No revenue data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <DollarSignIcon className="h-5 w-5"/>
          Revenue Trends
        </CardTitle>
        <CardDescription>
          <div className="text-2xl font-bold">{formatCurrency(data?.stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(data?.stats?.revenueThisMonth || 0)} this month
            </p>
          </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Product Trends</TabsTrigger>
            <TabsTrigger value="payments">Payment Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <RevenueTrendsChart
              data={data.trends}
              productTypes={data.productTypes}
              frequency={frequency}
              onFrequencyChange={handleFrequencyChange}
            />
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <RevenueTrendsChart
              data={data.paymentTrends}
              productTypes={data.paymentTypes}
              frequency={frequency}
              onFrequencyChange={handleFrequencyChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
