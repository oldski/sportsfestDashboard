'use client';

import * as React from 'react';
import { Users, Crown, Search, AlertTriangle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Input } from '@workspace/ui/components/input';
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
  togglePlayerCaptain,
  removePlayerFromTeam,
  transferPlayerToTeam
} from '~/actions/teams/roster-actions';
import type { CompanyTeamDetails } from '~/data/teams/get-company-team-by-id';
import type { PlayersForRosterResult } from '~/data/teams/get-players-for-roster-management';

interface TeamRosterDisplayProps {
  team: CompanyTeamDetails;
  playersData: PlayersForRosterResult;
}

export function TeamRosterDisplay({ team, playersData }: TeamRosterDisplayProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isRosterDialogOpen, setIsRosterDialogOpen] = React.useState(false);
  const [transferConfirmation, setTransferConfirmation] = React.useState<{
    isOpen: boolean;
    playerId: string | null;
    playerName: string;
  }>({
    isOpen: false,
    playerId: null,
    playerName: ''
  });

  // Sort members to show captains first
  const sortedMembers = React.useMemo(() => {
    return [...team.members].sort((a, b) => {
      if (a.isCaptain && !b.isCaptain) return -1;
      if (!a.isCaptain && b.isCaptain) return 1;
      return a.firstName.localeCompare(b.firstName);
    });
  }, [team.members]);

  // Filter members based on search query
  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) return sortedMembers;
    
    const searchTerm = searchQuery.toLowerCase();
    return sortedMembers.filter(member =>
      member.firstName.toLowerCase().includes(searchTerm) ||
      member.lastName.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm) ||
      member.gender.toLowerCase().includes(searchTerm)
    );
  }, [sortedMembers, searchQuery]);

  const handleEditPlayer = async (playerId: string, isCaptain: boolean) => {
    // Toggle captain status when edit is clicked
    const result = await togglePlayerCaptain(playerId, team.id, !isCaptain);
    if (result.success) {
      toast.success(`Captain status ${!isCaptain ? 'added' : 'removed'} successfully`);
    } else {
      toast.error(result.error || 'Failed to update captain status');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    const result = await removePlayerFromTeam(playerId, team.id);
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

    const result = await transferPlayerToTeam(transferConfirmation.playerId, team.id);

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Roster
              </CardTitle>
              <CardDescription>
                Current team members and their roles
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsRosterDialogOpen(true)}
            >
              Manage Roster
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {team.members.length > 0 ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No members match your search</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {member.firstName} {member.lastName}
                            {member.isCaptain && (
                              <Crown className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.email} • {member.gender}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {member.isCaptain ? 'Captain' : 'Member'}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditPlayer(member.id, member.isCaptain)}
                        >
                          {member.isCaptain ? 'Remove Captain' : 'Make Captain'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Team Members</h3>
              <p className="text-muted-foreground mb-4">
                Start building your team by adding players from your organization.
              </p>
              <Button 
                disabled={team.availablePlayerCount === 0}
                onClick={() => setIsRosterDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RosterManagementDialog
        open={isRosterDialogOpen}
        onOpenChange={setIsRosterDialogOpen}
        teamName={team.name || `Team ${team.teamNumber}`}
        teamNumber={team.teamNumber}
        playersData={playersData}
        onAddPlayer={async (playerId) => {
          // This will be handled by the dialog's existing functionality
          // The page will refresh automatically due to revalidatePath
        }}
        onRemovePlayer={handleRemovePlayer}
        onTransferPlayer={handleTransferPlayer}
        onToggleCaptain={handleEditPlayer}
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
                Are you sure you want to transfer <strong>{transferConfirmation.playerName}</strong> to <strong>{team.name || `Team ${team.teamNumber}`}</strong>?
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