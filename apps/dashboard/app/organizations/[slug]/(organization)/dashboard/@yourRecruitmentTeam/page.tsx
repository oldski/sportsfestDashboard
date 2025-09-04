import * as React from 'react';
import {getMembers} from "~/data/members/get-members";
import {getProfile} from "~/data/account/get-profile";
import {RecruitmentTeamCard} from "~/components/organizations/slug/home/dashboard-recruitment-team-card";

export default async function YourRecruitmentTeamPage(): Promise<React.JSX.Element> {
  const [profile, members] = await Promise.all([getProfile(), getMembers()]);

  return (
    <RecruitmentTeamCard
      profile={profile}
      members={members}
    />
  );
}
