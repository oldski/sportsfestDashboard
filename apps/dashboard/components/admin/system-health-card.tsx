import * as React from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';

import { getAdminAnalytics } from '~/actions/admin/get-admin-analytics';

export async function SystemHealthCard(): Promise<React.JSX.Element> {
  const analytics = await getAdminAnalytics();
  const { systemHealth } = analytics;
  
  // Calculate health metrics
  const totalPayments = systemHealth.completedPayments + systemHealth.pendingPayments;
  const paymentSuccessRate = totalPayments > 0 
    ? Math.round((systemHealth.completedPayments / totalPayments) * 100) 
    : 100;
  
  const overallHealth = Math.round(
    (paymentSuccessRate + (100 - systemHealth.errorRate)) / 2
  );

  const getHealthStatus = (value: number) => {
    if (value >= 90) return { status: 'Excellent', color: 'text-green-600', icon: CheckCircle };
    if (value >= 70) return { status: 'Good', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'Needs Attention', color: 'text-red-600', icon: XCircle };
  };

  const healthStatus = getHealthStatus(overallHealth);
  const HealthIcon = healthStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Real-time system performance and metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Health</span>
            <Badge variant={overallHealth >= 90 ? 'default' : overallHealth >= 70 ? 'secondary' : 'destructive'}>
              <HealthIcon className="mr-1 h-3 w-3" />
              {healthStatus.status}
            </Badge>
          </div>
          <Progress value={overallHealth} className="h-2" />
          <p className="text-xs text-muted-foreground">{overallHealth}% system performance</p>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{systemHealth.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{systemHealth.activeOrganizations}</p>
              <p className="text-xs text-muted-foreground">Active Organizations</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Payment Success Rate</span>
                <span className="text-sm font-medium">{paymentSuccessRate}%</span>
              </div>
              <Progress value={paymentSuccessRate} className="h-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600">{systemHealth.completedPayments}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="font-medium text-yellow-600">{systemHealth.pendingPayments}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>

          {/* Error Rate */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Error Rate</span>
              <span className="text-sm font-medium">{systemHealth.errorRate}%</span>
            </div>
            <Progress 
              value={systemHealth.errorRate} 
              className="h-1" 
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="text-sm font-medium">Service Status</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs">Database</span>
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Payment Processing</span>
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Email Service</span>
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}