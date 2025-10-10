import * as React from 'react';
import {getMembers} from "~/data/members/get-members";
import {getProfile} from "~/data/account/get-profile";
import {getInvitations} from "~/data/invitations/get-invitations";
import {RecruitmentTeamCard} from "~/components/organizations/slug/home/dashboard-recruitment-team-card";

export default async function YourRecruitmentTeamPage(): Promise<React.JSX.Element> {
  const [profile, members, invitations] = await Promise.all([
    getProfile(),
    getMembers(),
    getInvitations()
  ]);

  return (
    <RecruitmentTeamCard
      profile={profile}
      members={members}
      pendingInvites={invitations}
    />
  );
}
