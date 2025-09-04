import * as React from 'react';
import {Card, CardContent, CardHeader} from "@workspace/ui/components/card";

export default async function RecruitmentToolsPage(): Promise<React.JSX.Element> {

  return (
    <Card>
      <CardHeader>
        Recruitment Tools
        Team sign up link
      </CardHeader>
      <CardContent>
        List of links.
        dialog with videos
      </CardContent>
    </Card>
  );
}
