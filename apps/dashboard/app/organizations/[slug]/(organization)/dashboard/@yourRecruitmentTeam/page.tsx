import * as React from 'react';
import {Card, CardContent, CardHeader} from "@workspace/ui/components/card";

export default async function YourRecruitmentTeamPage(): Promise<React.JSX.Element> {

  return (
    <Card>
      <CardHeader>
        Your Recruitment Team
      </CardHeader>
      <CardContent>
        List of team members (from /settings/organizations/members/@team)

        include button to invite members (reuse invite button that's in sidebar)
      </CardContent>
    </Card>
  );
}
