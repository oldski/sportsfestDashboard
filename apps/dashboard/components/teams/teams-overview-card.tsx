'use client';

import * as React from 'react';
import { Users, Shuffle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { autoGenerateRosters } from '~/actions/teams/roster-actions';

interface TeamsOverviewCardProps {
  eventYearName: string;
  teamCount: number;
  availablePlayerCount: number;
}

export function TeamsOverviewCard({
  eventYearName,
  teamCount,
  availablePlayerCount
}: TeamsOverviewCardProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleAutoGenerateRosters = async () => {
    setIsGenerating(true);
    try {
      const result = await autoGenerateRosters();
      if (result.success) {
        toast.success(`Successfully assigned ${result.playersAssigned} players across ${result.teamsCreated} teams`);
      } else {
        toast.error(result.error || 'Failed to auto-generate rosters');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Company Teams Overview
            </CardTitle>
            <CardDescription>
              {eventYearName} • {teamCount} teams purchased • {availablePlayerCount} unassigned players
            </CardDescription>
          </div>
          <Button
            onClick={handleAutoGenerateRosters}
            disabled={availablePlayerCount === 0 || isGenerating}
            className="ml-4"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Auto-Generate All Rosters'}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
