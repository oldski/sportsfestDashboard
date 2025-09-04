import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { BuildingIcon } from 'lucide-react';

export default function TopOrganizationsPage(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <BuildingIcon className="mr-2 h-4 w-4" />
          Top Organizations
        </CardTitle>
        <CardDescription>
          Highest performing organizations by revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { name: 'TechCorp Solutions', revenue: '$22,500', rank: 1 },
            { name: 'Global Dynamics', revenue: '$19,000', rank: 2 },
            { name: 'Innovation Labs', revenue: '$16,800', rank: 3 },
            { name: 'Future Systems', revenue: '$14,200', rank: 4 },
          ].map((org) => (
            <div key={org.rank} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">#{org.rank}</span>
                <span className="text-sm font-medium">{org.name}</span>
              </div>
              <span className="text-sm font-semibold">{org.revenue}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}