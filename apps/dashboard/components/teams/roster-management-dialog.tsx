'use client';

import * as React from 'react';
import { UserPlus, Crown, Users, ArrowRight, Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Input } from '@workspace/ui/components/input';

import type { PlayersForRosterResult } from '~/data/teams/get-players-for-roster-management';

interface RosterManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  teamNumber: number;
  playersData: PlayersForRosterResult;
  onAddPlayer?: (playerId: string) => void;
  onRemovePlayer?: (playerId: string) => void;
  onTransferPlayer?: (playerId: string) => void;
  onToggleCaptain?: (playerId: string, isCaptain: boolean) => void;
}


export function RosterManagementDialog({
  open,
  onOpenChange,
  teamName,
  teamNumber,
  playersData,
  onAddPlayer,
  onRemovePlayer,
  onTransferPlayer,
  onToggleCaptain,
}: RosterManagementDialogProps) {
  const { availablePlayers, currentTeamMembers, playersOnOtherTeams } = playersData;
  const [searchQueries, setSearchQueries] = React.useState({
    available: '',
    current: '',
    other: ''
  });
  const [activeTab, setActiveTab] = React.useState('available');

  // Filter players based on search query for specific tab
  const filterPlayers = (players: typeof availablePlayers, tabKey: keyof typeof searchQueries) => {
    const query = searchQueries[tabKey];
    if (!query.trim()) return players;
    
    const searchTerm = query.toLowerCase();
    return players.filter(player =>
      player.firstName.toLowerCase().includes(searchTerm) ||
      player.lastName.toLowerCase().includes(searchTerm) ||
      player.email.toLowerCase().includes(searchTerm) ||
      player.gender.toLowerCase().includes(searchTerm)
    );
  };

  const updateSearchQuery = (tabKey: keyof typeof searchQueries, value: string) => {
    setSearchQueries(prev => ({ ...prev, [tabKey]: value }));
  };

  const filteredAvailablePlayers = filterPlayers(availablePlayers, 'available');
  const filteredCurrentTeamMembers = filterPlayers(currentTeamMembers, 'current');
  const filteredPlayersOnOtherTeams = filterPlayers(playersOnOtherTeams, 'other');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Roster: {teamName || `Team ${teamNumber}`}
          </DialogTitle>
          <DialogDescription>
            Add, remove, or transfer players to this team. Each player can only be on one team.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available" className="relative">
              Available Players
              {filteredAvailablePlayers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {searchQueries.available ? `${filteredAvailablePlayers.length}/${availablePlayers.length}` : availablePlayers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="current" className="relative">
              Current Team
              {filteredCurrentTeamMembers.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {searchQueries.current ? `${filteredCurrentTeamMembers.length}/${currentTeamMembers.length}` : currentTeamMembers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="other" className="relative">
              Other Teams
              {filteredPlayersOnOtherTeams.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {searchQueries.other ? `${filteredPlayersOnOtherTeams.length}/${playersOnOtherTeams.length}` : playersOnOtherTeams.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab === 'available' ? 'available' : activeTab === 'current' ? 'current team' : 'other teams'} players...`}
              value={searchQueries[activeTab as keyof typeof searchQueries]}
              onChange={(e) => updateSearchQuery(activeTab as keyof typeof searchQueries, e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Available Players Tab */}
          <TabsContent value="available" className="mt-4">
            <ScrollArea className="h-[400px]">
              {filteredAvailablePlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{searchQueries.available ? 'No players match your search' : 'No available players'}</p>
                  <p className="text-sm">{searchQueries.available ? 'Try adjusting your search terms' : 'All players are assigned to teams'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailablePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {player.firstName[0]}{player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {player.firstName} {player.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.email} • {player.gender}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddPlayer?.(player.id)}
                        className="min-w-[80px]"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Current Team Members Tab */}
          <TabsContent value="current" className="mt-4">
            <ScrollArea className="h-[400px]">
              {filteredCurrentTeamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{searchQueries.current ? 'No team members match your search' : 'No team members'}</p>
                  <p className="text-sm">{searchQueries.current ? 'Try adjusting your search terms' : 'Add players from the Available tab'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCurrentTeamMembers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {player.firstName[0]}{player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {player.firstName} {player.lastName}
                            {player.currentTeam?.isCaptain && (
                              <Crown className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.email} • {player.gender}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleCaptain?.(player.id, !player.currentTeam?.isCaptain)}
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          {player.currentTeam?.isCaptain ? 'Remove Captain' : 'Make Captain'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onRemovePlayer?.(player.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Other Teams Tab */}
          <TabsContent value="other" className="mt-4">
            <ScrollArea className="h-[400px]">
              {filteredPlayersOnOtherTeams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{searchQueries.other ? 'No players match your search' : 'No players on other teams'}</p>
                  <p className="text-sm">{searchQueries.other ? 'Try adjusting your search terms' : 'All players are either available or on this team'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPlayersOnOtherTeams.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {player.firstName[0]}{player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {player.firstName} {player.lastName}
                            {player.currentTeam?.isCaptain && (
                              <Crown className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.email} • {player.gender}
                          </div>
                          <div className="text-xs text-orange-600">
                            Currently on {player.currentTeam?.name || `Team ${player.currentTeam?.teamNumber}`}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTransferPlayer?.(player.id)}
                        className="min-w-[100px]"
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Transfer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}