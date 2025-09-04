import * as React from 'react';
import {Card, CardContent, CardHeader} from "@workspace/ui/components/card";

export default async function WelcomeMessagePage(): Promise<React.JSX.Element> {

  return (
    <Card>
      <CardHeader>
        Welcome to INSERT ACTIVE SPORTSFEST EVENT NAME
      </CardHeader>
      <CardContent>
        blah blah blah
      </CardContent>
    </Card>
  );
}
