import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { SystemHealthCard } from '~/components/admin/system-health-card';

export default function SystemHealthPage(): React.JSX.Element {
  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>System Overview</CardTitle>
        <CardDescription>
          System health and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <SystemHealthCard />
      </CardContent>
    </Card>
  );
}
