'use client';

import * as React from 'react';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import { Button } from '@workspace/ui/components/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
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
  const [transferConfirmation, setTransferConfirmation] = React.useState<{
    isOpen: boolean;
    playerId: string | null;
    playerName: string;
  }>({
    isOpen: false,
    playerId: null,
    playerName: ''
  });

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
    // Find player details for confirmation dialog
    const player = playersData.playersOnOtherTeams.find(p => p.id === playerId);
    if (!player) {
      toast.error('Player not found');
      return;
    }

    // Show confirmation dialog
    setTransferConfirmation({
      isOpen: true,
      playerId,
      playerName: `${player.firstName} ${player.lastName}`
    });
  };

  const handleConfirmTransfer = async () => {
    if (!transferConfirmation.playerId) return;

    const result = await transferPlayerToTeam(transferConfirmation.playerId, teamId);

    // Close confirmation dialog
    setTransferConfirmation({
      isOpen: false,
      playerId: null,
      playerName: ''
    });

    if (result.success) {
      const eventRostersMessage = result.eventRostersRemoved && result.eventRostersRemoved > 0
        ? ` (${result.eventRostersRemoved} event roster${result.eventRostersRemoved > 1 ? 's' : ''} automatically updated)`
        : '';
      toast.success(`Player transferred to team successfully${eventRostersMessage}`);
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

      {/* Transfer Confirmation Dialog */}
      <AlertDialog
        open={transferConfirmation.isOpen}
        onOpenChange={(open) => setTransferConfirmation(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Player Transfer
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to transfer <strong>{transferConfirmation.playerName}</strong> to <strong>{teamName || `Team ${teamNumber}`}</strong>?
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                <p className="font-medium">Important:</p>
                <p>This player will be automatically removed from all event rosters on their current team. They will need to be manually re-assigned to event rosters on their new team.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTransfer}>
              Confirm Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}