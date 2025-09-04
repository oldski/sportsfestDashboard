import * as React from 'react';

import { getEventRegistrationStats } from '~/actions/admin/get-event-registration-stats';

export default async function SystemAlertsPage(): Promise<React.JSX.Element> {
  const stats = await getEventRegistrationStats();

  // Generate alerts based on actual system data
  const alerts = [];
  
  if (stats.failedPaymentsCount > 0) {
    alerts.push({
      type: 'warning',
      title: 'Payment Issues',
      description: `${stats.failedPaymentsCount} failed transactions`
    });
  }
  
  if (stats.overdueInvoicesCount > 0) {
    alerts.push({
      type: 'error',
      title: 'Overdue Invoices',
      description: `${stats.overdueInvoicesCount} invoices overdue`
    });
  }
  
  if (stats.tentUtilizationPercent < 50) {
    alerts.push({
      type: 'info',
      title: 'Low Tent Usage',
      description: `Only ${stats.tentUtilizationPercent}% utilization`
    });
  }

  // Default message if no alerts
  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      title: 'All Systems Normal',
      description: 'No issues detected'
    });
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className={`w-2 h-2 rounded-full ${getAlertColor(alert.type)} mt-2`} />
            <div className="text-sm">
              <p className="font-medium">{alert.title}</p>
              <p className="text-muted-foreground text-xs">{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
