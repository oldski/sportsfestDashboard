import * as React from 'react';
import {Card, CardContent, CardHeader} from "@workspace/ui/components/card";

export default async function TotalPlayersPage(): Promise<React.JSX.Element> {

  return (
    <Card>
      <CardHeader>
        Total Players
      </CardHeader>
      <CardContent>
        3
      </CardContent>
    </Card>
  );
}
