import * as React from 'react';
import Link from 'next/link';
import {Users, Crown, ChevronDown, Trophy, TriangleAlert, CheckCircle} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { getCompanyTeams } from '~/data/teams/get-company-teams';
import {Collapsible, CollapsibleTrigger, CollapsibleContent} from "@workspace/ui/components/collapsible";
import { EventType } from '@workspace/database/schema';

// Event display information with consistent ordering
const EVENT_DISPLAY_INFO = {
  [EventType.BEACH_VOLLEYBALL]: { icon: '🏐', title: 'Beach Volleyball', order: 1 },
  [EventType.BEACH_DODGEBALL]: { icon: '⚡', title: 'Beach Dodgeball', order: 2 },
  [EventType.BOTE_BEACH_CHALLENGE]: { icon: '🏄', title: 'Surf & Turf Rally', order: 3 },
  [EventType.TUG_OF_WAR]: { icon: '🪢', title: 'Tug of War', order: 4 },
  [EventType.CORN_TOSS]: { icon: '🌽', title: 'Corn Toss', order: 5 },
};

// All events in order
const ALL_EVENTS = Object.values(EventType).sort((a, b) =>
  EVENT_DISPLAY_INFO[a].order - EVENT_DISPLAY_INFO[b].order
);

// Helper function to get required players for each event type
function getRequiredPlayersForEventType(eventType: EventType): number {
  switch (eventType) {
    case EventType.BEACH_VOLLEYBALL:
      return 12; // 6 starters + 6 subs
    case EventType.BEACH_DODGEBALL:
      return 10; // 6 starters + 4 subs
    case EventType.BOTE_BEACH_CHALLENGE:
      return 11; // 7 starters + 4 subs
    case EventType.TUG_OF_WAR:
      return 9; // 5 starters + 4 subs
    case EventType.CORN_TOSS:
      return 4; // 4 players total (2 squads of 2)
    default:
      return 0;
  }
}

type TeamsParallelRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function TeamsParallelRoute({
  params
}: TeamsParallelRouteProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  const teamsData = await getCompanyTeams();

  if (teamsData.teams.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Teams Purchased</h2>
            <p className="text-muted-foreground mb-4">
              You need to purchase company teams before you can create rosters.
            </p>
            <Button asChild>
              <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.registration.Shop, slug)}>
                Purchase Teams
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teamsData.teams.map((team) => (
        <Card key={team.id} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {team.name || `Team ${team.teamNumber}`}
              </CardTitle>
              <CardDescription>
                {team.memberCount} members
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Team Members */}
            {team.members.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Team Members</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {team.members
                    .sort((a, b) => {
                      // Captain first, then by first name
                      if (a.isCaptain && !b.isCaptain) return -1;
                      if (!a.isCaptain && b.isCaptain) return 1;
                      return a.firstName.localeCompare(b.firstName);
                    })
                    .map((member) => (
                    <div key={member.id} className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.isCaptain && (
                        <Crown className="h-3 w-3 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <Collapsible
                    className="flex w-full flex-col gap-2"
                  >
                    {(() => {
                      // Check if any event roster is incomplete
                      const hasIncompleteRosters = ALL_EVENTS.some((eventType) => {
                        const eventRoster = team.eventRosterSummaries.find(er => er.eventType === eventType);
                        const playerCount = eventRoster?.playerCount || 0;
                        const requiredPlayers = eventRoster?.requiredPlayers || getRequiredPlayersForEventType(eventType);
                        return playerCount < requiredPlayers;
                      });

                      const allRostersComplete = !hasIncompleteRosters;

                      return (
                        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 hover:bg-muted/50 rounded-md px-2 py-1 -mx-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">
                              Event Roster Status
                            </h4>
                            {hasIncompleteRosters && (
                              <TriangleAlert className="h-4 w-4 text-destructive" />
                            )}
                            {allRostersComplete && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                      );
                    })()}
                    <CollapsibleContent className="absolute bottom-full left-0 right-0 z-10 mb-2 flex flex-col gap-2 bg-background border border-border rounded-md shadow-lg p-3">
                      {ALL_EVENTS.map((eventType) => {
                        const eventInfo = EVENT_DISPLAY_INFO[eventType];
                        const eventRoster = team.eventRosterSummaries.find(er => er.eventType === eventType);
                        const playerCount = eventRoster?.playerCount || 0;
                        const hasSquadLeader = eventRoster?.hasSquadLeader || false;
                        const requiredPlayers = eventRoster?.requiredPlayers || getRequiredPlayersForEventType(eventType);
                        const isComplete = playerCount >= requiredPlayers;

                        return (
                          <div key={eventType} className="rounded-md border px-3 py-2 text-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{eventInfo.icon}</span>
                                <span className="font-medium">{eventInfo.title}</span>
                                {hasSquadLeader && (
                                  <Crown className="h-3 w-3 text-amber-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={isComplete ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {playerCount}/{requiredPlayers}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No players assigned</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug) + `/${team.id}`}>
                  <Users className="h-4 w-4 mr-1" />
                  Manage Team
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={replaceOrgSlug(routes.dashboard.organizations.slug.Teams, slug) + `/${team.id}/events`}>
                  <Trophy className="h-4 w-4 mr-1" />
                  Event Rosters
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
