'use client';

import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CreditCard,
  Users,
  Database,
  TrendingUp,
  Clock
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';

import { getSystemHealth, type SystemHealthData } from '~/actions/admin/get-system-health';

export function SystemHealthCard(): React.JSX.Element {
  const [healthData, setHealthData] = React.useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const data = await getSystemHealth();
        setHealthData(data);
      } catch (error) {
        console.error('Error fetching system health:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthData();

    // Refresh health data every 2 minutes
    const interval = setInterval(fetchHealthData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Loading system status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <XCircle className="mr-2 h-5 w-5 text-red-500" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Unable to load system health data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overallHealth, paymentHealth, registrationHealth, databaseHealth, services } = healthData;

  const getHealthStatus = (status: string) => {
    switch (status) {
      case 'excellent':
        return { label: 'Excellent', color: 'text-green-600', icon: CheckCircle, variant: 'default' as const };
      case 'good':
        return { label: 'Good', color: 'text-blue-600', icon: CheckCircle, variant: 'secondary' as const };
      case 'warning':
        return { label: 'Warning', color: 'text-yellow-600', icon: AlertTriangle, variant: 'outline' as const };
      case 'critical':
        return { label: 'Critical', color: 'text-red-600', icon: XCircle, variant: 'destructive' as const };
      default:
        return { label: 'Unknown', color: 'text-gray-600', icon: XCircle, variant: 'outline' as const };
    }
  };

  const getServiceIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <XCircle className="h-3 w-3 text-gray-600" />;
    }
  };

  const healthStatus = getHealthStatus(overallHealth.status);
  const HealthIcon = healthStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            System Health
          </div>
          <Badge variant={healthStatus.variant}>
            <HealthIcon className="mr-1 h-3 w-3" />
            {healthStatus.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time system performance • Updated {overallHealth.lastUpdated.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall System Health</span>
            <span className="text-sm font-bold">{overallHealth.score}%</span>
          </div>
          <Progress value={overallHealth.score} className="h-3" />
        </div>

        {/* Priority #1: Payment Processing Health */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Payment Processing</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Success Rate</span>
                <span className="text-xs font-medium">{paymentHealth.successRate}%</span>
              </div>
              <Progress value={paymentHealth.successRate} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Avg Processing</span>
                <span className="text-xs font-medium">{paymentHealth.averageProcessingTime}min</span>
              </div>
              <Progress value={Math.min(100 - paymentHealth.averageProcessingTime * 2, 100)} className="h-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pl-6 text-xs">
            <div className="text-center">
              <p className="font-medium text-green-600">{paymentHealth.completedPayments}</p>
              <p className="text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-yellow-600">{paymentHealth.pendingPayments}</p>
              <p className="text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-600">{paymentHealth.failedPayments}</p>
              <p className="text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>

        {/* Priority #2: Registration System */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Registration System</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Rate/Hour</span>
                <span className="text-xs font-medium">{registrationHealth.registrationRate}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Uptime</span>
                <span className="text-xs font-medium">{registrationHealth.systemUptime}%</span>
              </div>
              <Progress value={registrationHealth.systemUptime} className="h-1" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pl-6 text-xs">
            <div className="text-center">
              <p className="font-medium">{registrationHealth.newUsersToday}</p>
              <p className="text-muted-foreground">Users Today</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{registrationHealth.newUsersThisWeek}</p>
              <p className="text-muted-foreground">This Week</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{registrationHealth.newTeamsToday}</p>
              <p className="text-muted-foreground">Teams</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{registrationHealth.newPlayersToday}</p>
              <p className="text-muted-foreground">Players</p>
            </div>
          </div>
        </div>

        {/* Priority #3: Database Performance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Database Performance</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Response Time</span>
                <span className="text-xs font-medium">{databaseHealth.responseTime}ms</span>
              </div>
              <Progress value={Math.max(0, 100 - (databaseHealth.responseTime / 10))} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Query Success</span>
                <span className="text-xs font-medium">{databaseHealth.querySuccessRate}%</span>
              </div>
              <Progress value={databaseHealth.querySuccessRate} className="h-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pl-6 text-xs">
            <div className="text-center">
              <p className="font-medium">{databaseHealth.totalUsers.toLocaleString()}</p>
              <p className="text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{databaseHealth.totalOrganizations}</p>
              <p className="text-muted-foreground">Organizations</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{databaseHealth.activeConnections}</p>
              <p className="text-muted-foreground">Connections</p>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Service Status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Database</span>
              {getServiceIcon(services.database)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Payment Processing</span>
              {getServiceIcon(services.payments)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Registration</span>
              {getServiceIcon(services.registration)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Email Service</span>
              {getServiceIcon(services.email)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}