import * as React from 'react';
import type { Metadata } from 'next';

import { createTitle } from '~/lib/formatters';
import {SiteHeading} from "~/components/fragments/site-heading";
import {GridSection} from "~/components/fragments/grid-section";
import {Card} from "@workspace/ui/components/card";

export const metadata: Metadata = {
  title: createTitle('Team Member Signup')
};

export default function TeamMemberSignupPage(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <SiteHeading
          title="Team Member Sign Up"
          description="Join your company team! No athletic skill necessary, just team spirit and company pride!"
        />
        <Card>
          Form will be here
        </Card>
      </div>
    </GridSection>
  );
}
