'use client';

import * as React from 'react';
import { Download, FileText } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

import type { CompanyTeamDetails } from '~/data/teams/get-company-team-by-id';
import type { EventRostersResult } from '~/data/teams/get-event-rosters';
import { EVENT_DISPLAY_INFO } from '~/lib/constants/events';
import { useActiveOrganization } from '~/hooks/use-active-organization';
import { generateTeamRosterReactPDF } from './team-roster-pdf-react';
import { generateEventRosterReactPDF } from './event-roster-pdf-react';
import { generateAllRostersReactPDF } from './all-rosters-pdf-react';

interface RosterExportDropdownProps {
  teamData: CompanyTeamDetails;
  eventRostersData?: EventRostersResult;
}

export function RosterExportDropdown({
  teamData,
  eventRostersData
}: RosterExportDropdownProps) {
  const { name: organizationName } = useActiveOrganization();

  // Get available event rosters
  const availableEventRosters = eventRostersData?.eventRosters.filter(e => e.players.length > 0) || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Rosters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Team Roster Options */}
        <DropdownMenuItem onClick={() => generateTeamRosterReactPDF(teamData, organizationName)} className="gap-2">
          <FileText className="h-4 w-4" />
          Team Roster
        </DropdownMenuItem>

        {availableEventRosters.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {/* Individual Event Roster Options */}
            {availableEventRosters.map((eventData) => {
              const eventInfo = EVENT_DISPLAY_INFO[eventData.eventType as keyof typeof EVENT_DISPLAY_INFO];
              return (
                <DropdownMenuItem
                  key={eventData.eventType}
                  onClick={() => generateEventRosterReactPDF(teamData, eventRostersData!, eventData.eventType, organizationName)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {eventInfo.title} Roster
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />
            {/* All Rosters Options */}
            <DropdownMenuItem onClick={() => generateAllRostersReactPDF(teamData, eventRostersData!, organizationName)} className="gap-2 font-medium">
              <Download className="h-4 w-4" />
              Export All Rosters
            </DropdownMenuItem>
          </>
        )}

        {availableEventRosters.length === 0 && eventRostersData && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              No event rosters available
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}