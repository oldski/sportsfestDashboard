import * as React from 'react';
import {Card, CardContent, CardHeader} from "@workspace/ui/components/card";

export default async function TotalCompanyTeamsPage(): Promise<React.JSX.Element> {

  return (
    <Card>
      <CardHeader>
        Total Company Teams
      </CardHeader>
      <CardContent>
        3
      </CardContent>
    </Card>
  );
}
