import * as React from 'react';
import {Card, CardContent, CardHeader} from "@workspace/ui/components/card";

export default async function GameDayInformationPage(): Promise<React.JSX.Element> {

  return (
    <Card>
      <CardHeader>
        Game Day Information
        Event End Date displayed here
      </CardHeader>
      <CardContent>
        get data from active event year
        Location Name
        Address
        City State, Zip
        Get directions link (with lat/long)
        List deadline for registration
      </CardContent>
    </Card>
  );
}
