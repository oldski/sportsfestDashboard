import * as React from 'react';
import { Trophy, Crown } from 'lucide-react';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Progress } from '@workspace/ui/components/progress';
import { Separator } from '@workspace/ui/components/separator';

import { getEventRosters } from '~/data/teams/get-event-rosters';
import { getCompanyTeamById } from '~/data/teams/get-company-team-by-id';
import { getPlayersForRosterManagement } from '~/data/teams/get-players-for-roster-management';
import { EventRosterManager } from '~/components/teams/event-roster-manager';
import { EVENT_DISPLAY_INFO } from '~/lib/constants/events';

type EventsGridProps = {
  params: Promise<{ slug: string; teamId: string }>;
};


export default async function EventsGridPage({
  params
}: EventsGridProps): Promise<React.JSX.Element> {
  const { teamId } = await params;

  const [eventRosters, team, playersData] = await Promise.all([
    getEventRosters(teamId),
    getCompanyTeamById(teamId),
    getPlayersForRosterManagement(teamId)
  ]);

  if (!eventRosters || !team) {
    notFound();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {eventRosters.eventRosters.map((eventData) => {
        const eventInfo = EVENT_DISPLAY_INFO[eventData.eventType];
        const progressPercentage = eventData.availableSlots.total > 0
          ? (eventData.availableSlots.filled / eventData.availableSlots.total) * 100
          : 0;

        return (
          <Card key={eventData.eventType} className="relative flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{eventInfo.icon}</div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{eventInfo.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {eventData.availableSlots.filled}/{eventData.availableSlots.total} players assigned
                  </CardDescription>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{eventInfo.description}</p>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 space-y-4">
              {/* Gender Breakdown */}
              {eventData.eventType !== 'corn_toss' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Male</span>
                      <span className="font-medium">
                        {eventData.availableSlots.genderBreakdown.male.filled}/{eventData.availableSlots.genderBreakdown.male.required}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Female</span>
                      <span className="font-medium">
                        {eventData.availableSlots.genderBreakdown.female.filled}/{eventData.availableSlots.genderBreakdown.female.required}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Players */}
              {eventData.players.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Current Players</h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {eventData.players
                      .sort((a, b) => {
                        // Sort: squad leaders first, then starters, then by name
                        if (a.squadLeader !== b.squadLeader) return b.squadLeader ? 1 : -1;
                        if (a.isStarter !== b.isStarter) return b.isStarter ? 1 : -1;
                        return a.firstName.localeCompare(b.firstName);
                      })
                      .map((player) => (
                        <div key={player.id} className="flex items-center gap-2 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {player.firstName[0]}{player.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate">
                            {player.firstName} {player.lastName}
                          </span>
                          <div className="flex items-center gap-1">
                            {player.squadLeader && (
                              <Crown className="h-3 w-3 text-amber-500" />
                            )}
                            <Badge
                              variant={player.isStarter ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {player.isStarter ? "Start" : "Sub"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No players assigned</p>
                </div>
              )}

              {/* Action Button - pushed to bottom */}
              <div className="mt-auto space-y-4">
                <Separator />
                <EventRosterManager
                  teamId={teamId}
                  eventType={eventData.eventType}
                  eventData={eventData}
                  teamMemberCount={team.memberCount}
                  availableTeamPlayers={playersData.currentTeamMembers.map(member => ({
                    id: member.id,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    email: member.email,
                    gender: member.gender,
                    eventInterestRating: member.eventInterest?.find(ei => ei.eventType === eventData.eventType)?.interestRating
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Team Photo Card */}
      <Card className="relative flex flex-col p-0">
        <CardContent className="flex flex-col flex-1  p-0">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src="/assets/team-photo.jpg"
              alt={`${team?.name || `Team ${team?.teamNumber}`} photo`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
