'use client';

import * as React from 'react';
import { UserPlus, Shuffle, Users } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import { Button } from '@workspace/ui/components/button';
import { EventRosterDialog } from './event-roster-dialog';
import { 
  autoGenerateEventRoster
} from '~/actions/teams/event-roster-actions';
import { EventType } from '@workspace/database/schema';

interface EventRosterManagerProps {
  teamId: string;
  eventType: EventType;
  eventData: {
    eventType: EventType;
    players: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      gender: string;
      isStarter: boolean;
      squadLeader: boolean;
      assignedAt: Date;
      eventInterestRating?: number;
    }>;
    availableSlots: {
      total: number;
      filled: number;
      genderBreakdown: {
        male: { required: number; filled: number };
        female: { required: number; filled: number };
        any: { required: number; filled: number };
      };
    };
  };
  teamMemberCount: number;
  availableTeamPlayers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    eventInterestRating?: number;
  }>;
}

export function EventRosterManager({
  teamId,
  eventType,
  eventData,
  teamMemberCount,
  availableTeamPlayers
}: EventRosterManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleAutoGenerate = async () => {
    if (teamMemberCount < 12) {
      toast.error('Team must have at least 12 members before creating event rosters');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await autoGenerateEventRoster(teamId, eventType);
      if (result.success) {
        toast.success(`Successfully assigned ${result.playersAssigned} players to ${eventType.replace('_', ' ')}`);
      } else {
        toast.error(result.error || 'Failed to auto-generate event roster');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const availableSlots = eventData.availableSlots.total - eventData.availableSlots.filled;
  const isEventFull = availableSlots <= 0;
  const hasTeamMembers = teamMemberCount >= 12;

  return (
    <>
      <div className="flex gap-2">
        <Button 
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          disabled={!hasTeamMembers}
          className="flex-1"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Manage
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleAutoGenerate}
          disabled={!hasTeamMembers || isEventFull || isGenerating || eventData.players.length > 0}
        >
          <Shuffle className="h-4 w-4 mr-1" />
          {isGenerating ? 'Generating...' : 'Auto-Fill'}
        </Button>
      </div>

      <EventRosterDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        teamId={teamId}
        eventType={eventType}
        eventData={eventData}
        availableTeamPlayers={availableTeamPlayers}
      />
    </>
  );
}