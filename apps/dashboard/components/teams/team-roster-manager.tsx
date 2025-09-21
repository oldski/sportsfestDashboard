'use client';

import * as React from 'react';
import { UserPlus } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import { Button } from '@workspace/ui/components/button';
import { RosterManagementDialog } from './roster-management-dialog';
import { 
  addPlayerToTeam, 
  removePlayerFromTeam, 
  transferPlayerToTeam, 
  togglePlayerCaptain
} from '~/actions/teams/roster-actions';
import type { PlayersForRosterResult } from '~/data/teams/get-players-for-roster-management';

interface TeamRosterManagerProps {
  teamId: string;
  teamName: string;
  teamNumber: number;
  availablePlayerCount: number;
  playersData: PlayersForRosterResult;
}

export function TeamRosterManager({
  teamId,
  teamName,
  teamNumber,
  availablePlayerCount,
  playersData,
}: TeamRosterManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAddPlayer = async (playerId: string) => {
    const result = await addPlayerToTeam(playerId, teamId);
    if (result.success) {
      toast.success('Player added to team successfully');
    } else {
      toast.error(result.error || 'Failed to add player');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    const result = await removePlayerFromTeam(playerId, teamId);
    if (result.success) {
      toast.success('Player removed from team successfully');
    } else {
      toast.error(result.error || 'Failed to remove player');
    }
  };

  const handleTransferPlayer = async (playerId: string) => {
    const result = await transferPlayerToTeam(playerId, teamId);
    if (result.success) {
      toast.success('Player transferred to team successfully');
    } else {
      toast.error(result.error || 'Failed to transfer player');
    }
  };

  const handleToggleCaptain = async (playerId: string, isCaptain: boolean) => {
    const result = await togglePlayerCaptain(playerId, teamId, isCaptain);
    if (result.success) {
      toast.success(`Captain status ${isCaptain ? 'added' : 'removed'} successfully`);
    } else {
      toast.error(result.error || 'Failed to update captain status');
    }
  };


  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => setIsDialogOpen(true)}
          disabled={availablePlayerCount === 0 && playersData.playersOnOtherTeams.length === 0}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Manage Players ({availablePlayerCount} available)
        </Button>
      </div>

      <RosterManagementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        teamName={teamName}
        teamNumber={teamNumber}
        playersData={playersData}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onTransferPlayer={handleTransferPlayer}
        onToggleCaptain={handleToggleCaptain}
      />
    </>
  );
}