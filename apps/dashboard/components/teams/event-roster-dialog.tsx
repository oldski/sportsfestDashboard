'use client';

import * as React from 'react';
import { UserPlus, Crown, Users, Search, Trophy, Trash2, X } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Input } from '@workspace/ui/components/input';
import { Separator } from '@workspace/ui/components/separator';
import { Rating } from '@workspace/ui/components/rating';

import { DragDropRoster, EventRequirements, RosterPlayer } from './drag-drop-roster';

import {
  addPlayerToEventRoster,
  removePlayerFromEventRoster,
  toggleEventSquadLeader,
  toggleEventStarterStatus,
  clearEventRoster
} from '~/actions/teams/event-roster-actions';
import { EventType } from '@workspace/database/schema';

interface EventRosterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  availableTeamPlayers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    eventInterestRating?: number;
  }>;
}

const EVENT_TITLES = {
  beach_volleyball: 'Beach Volleyball',
  beach_dodgeball: 'Beach Dodgeball',
  bote_beach_challenge: 'Bote Beach Challenge',
  tug_of_war: 'Tug of War',
  corn_toss: 'Corn Toss',
} as const;

// Helper function to get event requirements
const getEventRequirements = (eventType: EventType): EventRequirements => {
  switch (eventType) {
    case 'beach_volleyball':
      return { total: 12, male: 6, female: 6, any: 0 };
    case 'beach_dodgeball':
      return { total: 10, male: 5, female: 5, any: 0 };
    case 'bote_beach_challenge':
      return { total: 11, male: 7, female: 4, any: 0 };
    case 'tug_of_war':
      return { total: 9, male: 5, female: 4, any: 0 };
    case 'corn_toss':
      return { total: 4, male: 0, female: 0, any: 4 };
    default:
      return { total: 0, male: 0, female: 0, any: 0 };
  }
};

// Helper function to get starter requirements by event type
const getStarterRequirements = (eventType: EventType) => {
  switch (eventType) {
    case 'beach_volleyball':
      return { male: 3, female: 3 };
    case 'beach_dodgeball':
      return { male: 3, female: 3 };
    case 'bote_beach_challenge':
      return { male: 4, female: 3 };
    case 'tug_of_war':
      return { male: 3, female: 2 };
    case 'corn_toss':
      return { male: 2, female: 2 }; // 2 squads of 2 players each
    default:
      return { male: 0, female: 0 };
  }
};

export function EventRosterDialog({
  open,
  onOpenChange,
  teamId,
  eventType,
  eventData,
  availableTeamPlayers
}: EventRosterDialogProps) {
  const [searchQueries, setSearchQueries] = React.useState({
    available: '',
    current: ''
  });
  const [activeTab, setActiveTab] = React.useState('current');

  // Get available team members not in this event
  const availablePlayers = React.useMemo(() => {
    const eventPlayerIds = new Set(eventData.players.map(p => p.id));
    return availableTeamPlayers.filter(player => 
      !eventPlayerIds.has(player.id)
    );
  }, [availableTeamPlayers, eventData.players]);

  // Filter players based on search query
  const filterPlayers = <T extends { firstName: string; lastName: string; gender: string }>(players: T[], tabKey: keyof typeof searchQueries) => {
    const query = searchQueries[tabKey];
    if (!query.trim()) return players;
    
    const searchTerm = query.toLowerCase();
    return players.filter(player =>
      player.firstName.toLowerCase().includes(searchTerm) ||
      player.lastName.toLowerCase().includes(searchTerm) ||
      player.gender.toLowerCase().includes(searchTerm)
    );
  };

  const updateSearchQuery = (tabKey: keyof typeof searchQueries, value: string) => {
    setSearchQueries(prev => ({ ...prev, [tabKey]: value }));
  };

  const filteredAvailablePlayers = filterPlayers(availablePlayers, 'available');
  const filteredCurrentPlayers = filterPlayers(eventData.players, 'current');

  // Sort available players by interest level (highest interest first, then by name)
  const sortedAvailablePlayers = [...filteredAvailablePlayers].sort((a, b) => {
    const aInterest = a.eventInterestRating || 0;
    const bInterest = b.eventInterestRating || 0;
    
    // Sort by interest (higher interest first - remember 1 is highest, 5 is lowest)
    if (aInterest !== bInterest) {
      if (aInterest === 0 && bInterest !== 0) return 1; // No interest goes last
      if (bInterest === 0 && aInterest !== 0) return -1; // No interest goes last
      return aInterest - bInterest; // 1 comes before 5 (higher interest first)
    }
    
    // If same interest, sort by name
    return a.firstName.localeCompare(b.firstName);
  });

  // Sort current players (squad leaders first, then starters, then by name)
  const sortedCurrentPlayers = [...filteredCurrentPlayers].sort((a, b) => {
    if (a.squadLeader !== b.squadLeader) return b.squadLeader ? 1 : -1;
    if (a.isStarter !== b.isStarter) return b.isStarter ? 1 : -1;
    return a.firstName.localeCompare(b.firstName);
  });

  const handleAddPlayer = async (playerId: string, isStarter: boolean = false) => {
    const result = await addPlayerToEventRoster(playerId, teamId, eventType, isStarter);
    if (result.success) {
      toast.success('Player added to event roster successfully');
    } else {
      toast.error(result.error || 'Failed to add player');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    const result = await removePlayerFromEventRoster(playerId, teamId, eventType);
    if (result.success) {
      toast.success('Player removed from event roster successfully');
    } else {
      toast.error(result.error || 'Failed to remove player');
    }
  };

  const handleToggleSquadLeader = async (playerId: string, isSquadLeader: boolean) => {
    const result = await toggleEventSquadLeader(playerId, teamId, eventType, !isSquadLeader);
    if (result.success) {
      toast.success(`Squad leader status ${!isSquadLeader ? 'added' : 'removed'} successfully`);
    } else {
      toast.error(result.error || 'Failed to update squad leader status');
    }
  };

  const handleToggleStarter = async (playerId: string, isStarter: boolean) => {
    const result = await toggleEventStarterStatus(playerId, teamId, eventType, !isStarter);
    if (result.success) {
      toast.success(`Player ${!isStarter ? 'promoted to starter' : 'moved to substitute'} successfully`);
    } else {
      toast.error(result.error || 'Failed to update starter status');
    }
  };

  const handleClearRoster = async () => {
    const result = await clearEventRoster(teamId, eventType);
    if (result.success) {
      toast.success('Event roster cleared successfully');
    } else {
      toast.error(result.error || 'Failed to clear event roster');
    }
  };

  // Check if we can add more players of specific gender
  const canAddGender = (gender: string) => {
    if (eventType === 'corn_toss') return eventData.availableSlots.filled < eventData.availableSlots.total;
    
    if (gender === 'male') {
      return eventData.availableSlots.genderBreakdown.male.filled < eventData.availableSlots.genderBreakdown.male.required;
    }
    if (gender === 'female') {
      return eventData.availableSlots.genderBreakdown.female.filled < eventData.availableSlots.genderBreakdown.female.required;
    }
    return false;
  };

  // Check if we can add as starter (check both total and gender-specific limits)
  const canAddAsStarter = (gender: string) => {
    if (!canAddGender(gender)) return false;

    // Get current starters by gender
    const currentStarters = eventData.players.filter(p => p.isStarter);
    const currentMaleStarters = currentStarters.filter(p => p.gender === 'male').length;
    const currentFemaleStarters = currentStarters.filter(p => p.gender === 'female').length;

    const starterRequirements = getStarterRequirements(eventType);

    // Check gender-specific starter limits
    if (gender === 'male') {
      return currentMaleStarters < starterRequirements.male;
    }
    if (gender === 'female') {
      return currentFemaleStarters < starterRequirements.female;
    }

    return false;
  };

  // Check if we can add as substitute (check gender-specific substitute limits)
  const canAddAsSubstitute = (gender: string) => {
    if (!canAddGender(gender)) return false;

    // Get current substitutes by gender
    const currentSubstitutes = eventData.players.filter(p => !p.isStarter);
    const currentMaleSubstitutes = currentSubstitutes.filter(p => p.gender === 'male').length;
    const currentFemaleSubstitutes = currentSubstitutes.filter(p => p.gender === 'female').length;

    // Calculate substitute requirements (total - starters = substitutes)
    const totalReqs = getEventRequirements(eventType);
    const starterReqs = getStarterRequirements(eventType);

    const substituteRequirements = {
      male: totalReqs.male - starterReqs.male,
      female: totalReqs.female - starterReqs.female,
    };

    // Check gender-specific substitute limits
    if (gender === 'male') {
      return currentMaleSubstitutes < substituteRequirements.male;
    }
    if (gender === 'female') {
      return currentFemaleSubstitutes < substituteRequirements.female;
    }

    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Manage {EVENT_TITLES[eventType]} Roster
              </DialogTitle>
              <DialogDescription>
                Add, remove, or manage players for this event. Each event has specific requirements and player limits.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="relative">
              Current Roster
              {eventData.players.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {searchQueries.current ? `${filteredCurrentPlayers.length}/${eventData.players.length}` : eventData.players.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="available" className="relative">
              Available Players
              {availablePlayers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {searchQueries.available ? `${sortedAvailablePlayers.length}/${availablePlayers.length}` : availablePlayers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab === 'available' ? 'available' : 'current roster'} players...`}
              value={searchQueries[activeTab as keyof typeof searchQueries]}
              onChange={(e) => updateSearchQuery(activeTab as keyof typeof searchQueries, e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Current Roster Tab */}
          <TabsContent value="current" className="mt-4">
            <ScrollArea className="h-[500px]">
              {sortedCurrentPlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{searchQueries.current ? 'No players match your search' : 'No players in this event roster'}</p>
                  <p className="text-sm">{searchQueries.current ? 'Try adjusting your search terms' : 'Add players from the Available tab'}</p>
                </div>
              ) : (
                <div className="pr-4">
                  <DragDropRoster
                    teamId={teamId}
                    eventType={eventType}
                    players={sortedCurrentPlayers.map((player): RosterPlayer => ({
                      id: player.id,
                      firstName: player.firstName,
                      lastName: player.lastName,
                      gender: player.gender as 'male' | 'female',
                      isStarter: player.isStarter,
                      squadLeader: player.squadLeader,
                      assignedAt: player.assignedAt,
                      eventInterestRating: player.eventInterestRating,
                    }))}
                    eventRequirements={getEventRequirements(eventType)}
                    onPlayerUpdate={() => {
                      // Trigger a refresh - the parent component should handle this
                      // For now, we can use the existing toast pattern
                    }}
                  />
                  
                  {/* Squad Leader and Remove Player Actions */}
                  {sortedCurrentPlayers.length > 0 && (
                    <Card className="mt-6">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Player Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sortedCurrentPlayers.map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {player.firstName[0]}{player.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {player.firstName} {player.lastName}
                                </span>
                                {player.squadLeader && (
                                  <Crown className="h-3 w-3 text-amber-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleSquadLeader(player.id, player.squadLeader)}
                                  className="h-7 px-2 text-xs"
                                  title={player.squadLeader ? 'Remove as squad leader' : 'Make squad leader'}
                                >
                                  <Crown className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemovePlayer(player.id)}
                                  className="h-7 w-7 p-0"
                                  title="Remove from roster"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Available Players Tab */}
          <TabsContent value="available" className="mt-4">
            <ScrollArea className="h-[400px]">
              {sortedAvailablePlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{searchQueries.available ? 'No players match your search' : 'No available players'}</p>
                  <p className="text-sm">{searchQueries.available ? 'Try adjusting your search terms' : 'All team members are assigned to this event'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedAvailablePlayers.map((player) => {
                    const canAdd = canAddGender(player.gender);
                    return (
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
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              {player.gender}
                              {player.eventInterestRating && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs">Interest:</span>
                                  <Rating
                                    value={6 - player.eventInterestRating}
                                    totalStars={5}
                                    size={12}
                                    readOnly
                                    variant="yellow"
                                    className="ml-1"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!canAdd && (
                            <Badge variant="secondary" className="text-xs">
                              {eventType === 'corn_toss' ? 'Roster Full' : `${player.gender} slots full`}
                            </Badge>
                          )}
                          {canAdd && (
                            <>
                              {canAddAsStarter(player.gender) && (
                                <Button
                                  size="sm"
                                  onClick={() => handleAddPlayer(player.id, true)}
                                  className="min-w-[100px]"
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Add as Starter
                                </Button>
                              )}
                              {canAddAsSubstitute(player.gender) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddPlayer(player.id, false)}
                                  className="min-w-[80px]"
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Add as Sub
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {eventData.players.length > 0 && (
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleClearRoster}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Roster
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}