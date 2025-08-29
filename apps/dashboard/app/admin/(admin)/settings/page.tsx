import * as React from 'react';

import { AlertsAndNotifications } from '~/components/admin/alerts-and-notifications';

export default function AdminSettingsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings and manage notifications
        </p>
      </div>
      
      <AlertsAndNotifications />
    </div>
  );
}