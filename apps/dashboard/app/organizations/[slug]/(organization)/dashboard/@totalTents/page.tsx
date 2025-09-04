import * as React from 'react';
import {Card, CardContent, CardHeader} from "@workspace/ui/components/card";

export default async function TotalTentsPage(): Promise<React.JSX.Element> {

  return (
    <Card>
      <CardHeader>
        Total Tents
      </CardHeader>
      <CardContent>
        3
      </CardContent>
    </Card>
  );
}
