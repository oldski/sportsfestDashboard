import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Building2Icon } from 'lucide-react';

export default function OrganizationsDataPage(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Building2Icon className="mr-2 h-4 w-4" />
          Organizations Overview
        </CardTitle>
        <CardDescription>
          Comprehensive organizational metrics and growth trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Total Orgs</p>
            <p className="text-xl font-bold">24</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-bold text-green-600">22</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">New</p>
            <p className="text-xl font-bold text-blue-600">3</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-xs text-muted-foreground">Organizations Growth Chart</p>
        </div>
      </CardContent>
    </Card>
  );
}