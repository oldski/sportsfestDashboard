import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { PieChartIcon } from 'lucide-react';

export default function PlayersByGenderPage(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <PieChartIcon className="mr-2 h-3 w-3" />
          Gender Split
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-center justify-center border border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-xs text-muted-foreground">Players by Gender Chart</p>
        </div>
      </CardContent>
    </Card>
  );
}