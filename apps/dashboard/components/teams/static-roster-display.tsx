'use client';

import * as React from 'react';
import { ArrowUp, ArrowDown, Crown, Users, UserCheck, Loader2 } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Rating } from '@workspace/ui/components/rating';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';

import { toggleEventStarterStatus } from '~/actions/teams/event-roster-actions';
import { EventType } from '@workspace/database/schema';
import { SwapPlayerModal } from './swap-player-modal';

export interface RosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  isStarter: boolean;
  squadLeader: boolean;
  assignedAt: Date;
  eventInterestRating?: number;
}

export interface EventRequirements {
  total: number;
  male: number;
  female: number;
  any: number;
}

export interface StaticRosterDisplayProps {
  teamId: string;
  eventType: EventType;
  players: RosterPlayer[];
  eventRequirements: EventRequirements;
  onPlayerUpdate?: () => void;
}

// Player card component matching old DraggablePlayer style
function PlayerCard({
  player,
  showMoveButton,
  moveDirection,
  isLoading,
  onMove,
}: {
  player: RosterPlayer;
  showMoveButton: boolean;
  moveDirection: 'up' | 'down';
  isLoading: boolean;
  onMove: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-background border rounded-lg',
        'hover:bg-muted/50 transition-colors'
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {player.firstName[0]}{player.lastName[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck
            className={cn(
              'h-4 w-4 flex-shrink-0',
              player.gender === 'male' ? 'text-blue-500' : 'text-pink-500'
            )}
          />
          <span className="font-medium text-sm truncate">
            {player.firstName} {player.lastName}
          </span>
          {player.squadLeader && (
            <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
          )}
        </div>

        {player.eventInterestRating && (
          <div className="flex items-center gap-1">
            <Rating
              value={6 - player.eventInterestRating}
              totalStars={5}
              size={12}
              readOnly
              variant="yellow"
            />
          </div>
        )}
      </div>

      <Badge
        variant={player.isStarter ? 'default' : 'secondary'}
        className="text-xs flex-shrink-0"
      >
        {player.isStarter ? 'S' : 'Sub'}
      </Badge>

      {showMoveButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMove}
                disabled={isLoading}
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                {moveDirection === 'up' ? (
                  <ArrowUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-orange-600" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{moveDirection === 'up' ? 'Promote to Starter' : 'Demote to Substitute'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// Drop zone container matching old RosterDropZone style
function RosterZone({
  title,
  subtitle,
  players,
  maxPlayers,
  currentCounts,
  requirements,
  isLoading,
  showMoveButton,
  moveDirection,
  onMovePlayer,
  isUpdatingPlayer,
}: {
  title: string;
  subtitle: string;
  players: RosterPlayer[];
  maxPlayers: number;
  currentCounts: { male: number; female: number };
  requirements: { male: number; female: number; any?: number };
  isLoading: boolean;
  showMoveButton: boolean;
  moveDirection: 'up' | 'down';
  onMovePlayer: (player: RosterPlayer) => void;
  isUpdatingPlayer: string | null;
}) {
  const emptySlots = Math.max(0, maxPlayers - players.length);
  const isComplete = players.length >= maxPlayers;
  const genderRequirementsMet = requirements.any !== undefined
    ? players.length >= maxPlayers
    : currentCounts.male >= requirements.male && currentCounts.female >= requirements.female;

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-4 min-h-[300px] transition-all duration-200',
        'border-muted-foreground/25 hover:border-muted-foreground/40',
        isLoading && 'opacity-50'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {title}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="text-right">
          <Badge
            variant={isComplete ? 'default' : 'secondary'}
            className="text-xs"
          >
            {players.length}/{maxPlayers}
          </Badge>
        </div>
      </div>

      {/* Gender breakdown (if applicable) */}
      {requirements.any === undefined && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Male:</span>
            <Badge
              variant={currentCounts.male >= requirements.male ? 'default' : 'secondary'}
              className="text-xs"
            >
              {currentCounts.male}/{requirements.male}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-pink-500" />
            <span className="text-sm">Female:</span>
            <Badge
              variant={currentCounts.female >= requirements.female ? 'default' : 'secondary'}
              className="text-xs"
            >
              {currentCounts.female}/{requirements.female}
            </Badge>
          </div>
        </div>
      )}

      {/* Players */}
      <div className="space-y-2">
        {players
          .sort((a, b) => {
            if (a.squadLeader !== b.squadLeader) return b.squadLeader ? 1 : -1;
            return a.firstName.localeCompare(b.firstName);
          })
          .map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              showMoveButton={showMoveButton}
              moveDirection={moveDirection}
              isLoading={isUpdatingPlayer === player.id}
              onMove={() => onMovePlayer(player)}
            />
          ))}

        {/* Empty slots */}
        {emptySlots > 0 && (
          <div className="space-y-2">
            {Array.from({ length: emptySlots }, (_, index) => (
              <div
                key={`empty-${index}`}
                className={cn(
                  'flex items-center justify-center h-12 border-2 border-dashed rounded-lg',
                  'text-muted-foreground bg-muted/20'
                )}
              >
                <span className="text-sm">Empty slot</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status indicator */}
      {players.length > 0 && (
        <div className="mt-4 pt-3 border-t border-muted">
          <div className="flex items-center gap-2 text-sm">
            {genderRequirementsMet ? (
              <div className="flex items-center gap-1 text-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span>Requirements met</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <div className="h-2 w-2 bg-amber-500 rounded-full" />
                <span>Needs more players</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function StaticRosterDisplay({
  teamId,
  eventType,
  players,
  eventRequirements,
  onPlayerUpdate,
}: StaticRosterDisplayProps) {
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
  const [swapModal, setSwapModal] = React.useState<{
    open: boolean;
    player: RosterPlayer | null;
    targetIsStarter: boolean;
    eligiblePlayers: RosterPlayer[];
  }>({
    open: false,
    player: null,
    targetIsStarter: false,
    eligiblePlayers: [],
  });

  // Separate players into starters and substitutes
  const starters = players.filter(player => player.isStarter);
  const substitutes = players.filter(player => !player.isStarter);

  // Calculate current counts
  const starterCounts = {
    male: starters.filter(p => p.gender === 'male').length,
    female: starters.filter(p => p.gender === 'female').length,
  };

  const substituteCounts = {
    male: substitutes.filter(p => p.gender === 'male').length,
    female: substitutes.filter(p => p.gender === 'female').length,
  };

  // Calculate starter requirements for each event
  const starterRequirements = React.useMemo(() => {
    if (eventType === 'corn_toss') {
      return { male: 0, female: 0, any: 4, total: 4 };
    }

    switch (eventType) {
      case 'beach_volleyball':
        return { male: 3, female: 3, any: 0, total: 6 };
      case 'beach_dodgeball':
        return { male: 3, female: 3, any: 0, total: 6 };
      case 'bote_beach_challenge':
        return { male: 4, female: 3, any: 0, total: 7 };
      case 'tug_of_war':
        return { male: 3, female: 2, any: 0, total: 5 };
      default:
        return { male: 0, female: 0, any: 0, total: 0 };
    }
  }, [eventType]);

  const substituteRequirements = React.useMemo(() => {
    if (eventType === 'corn_toss') {
      return { male: 0, female: 0, any: 0, total: 0 };
    }

    return {
      male: eventRequirements.male - starterRequirements.male,
      female: eventRequirements.female - starterRequirements.female,
      any: eventRequirements.any - starterRequirements.any,
      total: eventRequirements.total - starterRequirements.total,
    };
  }, [eventRequirements, starterRequirements, eventType]);

  // Check if target column has room for a player's gender
  const hasRoomInTarget = (player: RosterPlayer, targetIsStarter: boolean) => {
    const targetPlayers = targetIsStarter ? starters : substitutes;
    const requirements = targetIsStarter ? starterRequirements : substituteRequirements;

    if (eventType === 'corn_toss') {
      return targetPlayers.length < requirements.total;
    }

    const currentGenderCount = targetPlayers.filter(p => p.gender === player.gender).length;
    const genderLimit = player.gender === 'male' ? requirements.male : requirements.female;
    return currentGenderCount < genderLimit;
  };

  // Get eligible players for swap (same gender from opposite column)
  const getEligibleSwapPlayers = (player: RosterPlayer, targetIsStarter: boolean) => {
    const oppositeColumn = targetIsStarter ? starters : substitutes;

    if (eventType === 'corn_toss') {
      return oppositeColumn;
    }

    return oppositeColumn.filter(p => p.gender === player.gender);
  };

  const handleMovePlayer = async (player: RosterPlayer) => {
    const targetIsStarter = !player.isStarter;

    // Check if there's room in the target column
    if (hasRoomInTarget(player, targetIsStarter)) {
      // Direct move - there's room
      await executeMove(player, targetIsStarter);
    } else {
      // Need to swap - show modal
      const eligiblePlayers = getEligibleSwapPlayers(player, targetIsStarter);

      if (eligiblePlayers.length === 0) {
        toast.error('No eligible players to swap with');
        return;
      }

      setSwapModal({
        open: true,
        player,
        targetIsStarter,
        eligiblePlayers,
      });
    }
  };

  const executeMove = async (player: RosterPlayer, newIsStarter: boolean) => {
    setIsUpdating(player.id);
    try {
      const result = await toggleEventStarterStatus(player.id, teamId, eventType, newIsStarter);
      if (result.success) {
        toast.success(`Player ${newIsStarter ? 'promoted to starter' : 'moved to substitute'}`);
        onPlayerUpdate?.();
      } else {
        toast.error(result.error || 'Failed to update player status');
      }
    } catch (error) {
      console.error('Error updating player status:', error);
      toast.error('Failed to update player status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSwapConfirm = async (swapWithPlayer: RosterPlayer) => {
    if (!swapModal.player) return;

    const player = swapModal.player;
    const targetIsStarter = swapModal.targetIsStarter;

    setIsUpdating(player.id);
    setSwapModal(prev => ({ ...prev, open: false }));

    try {
      // Always demote a starter first to free up the starter slot
      // Then promote a sub into that freed slot

      if (player.isStarter) {
        // Original is starter → demote original first, then promote swap target
        const demoteResult = await toggleEventStarterStatus(
          player.id,
          teamId,
          eventType,
          false // demote to sub
        );

        if (!demoteResult.success) {
          toast.error(demoteResult.error || 'Failed to move player');
          setIsUpdating(null);
          return;
        }

        const promoteResult = await toggleEventStarterStatus(
          swapWithPlayer.id,
          teamId,
          eventType,
          true // promote to starter
        );

        if (promoteResult.success) {
          toast.success('Players swapped successfully');
          onPlayerUpdate?.();
        } else {
          toast.error(promoteResult.error || 'Failed to complete swap');
        }
      } else {
        // Original is sub → demote swap target first, then promote original
        const demoteResult = await toggleEventStarterStatus(
          swapWithPlayer.id,
          teamId,
          eventType,
          false // demote to sub
        );

        if (!demoteResult.success) {
          toast.error(demoteResult.error || 'Failed to swap player');
          setIsUpdating(null);
          return;
        }

        const promoteResult = await toggleEventStarterStatus(
          player.id,
          teamId,
          eventType,
          true // promote to starter
        );

        if (promoteResult.success) {
          toast.success('Players swapped successfully');
          onPlayerUpdate?.();
        } else {
          toast.error(promoteResult.error || 'Failed to complete swap');
        }
      }
    } catch (error) {
      console.error('Error swapping players:', error);
      toast.error('Failed to swap players');
    } finally {
      setIsUpdating(null);
    }
  };

  // Corn Toss: Special layout (2 squads - no starters/subs distinction)
  if (eventType === 'corn_toss') {
    const squad1 = starters.slice(0, 2);
    const squad2 = starters.slice(2, 4);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RosterZone
          title="Squad 1"
          subtitle="Any 2 Players"
          players={squad1}
          maxPlayers={2}
          currentCounts={{ male: squad1.filter(p => p.gender === 'male').length, female: squad1.filter(p => p.gender === 'female').length }}
          requirements={{ male: 0, female: 0, any: 2 }}
          isLoading={isUpdating !== null}
          showMoveButton={false}
          moveDirection="down"
          onMovePlayer={() => {}}
          isUpdatingPlayer={isUpdating}
        />
        <RosterZone
          title="Squad 2"
          subtitle="Any 2 Players"
          players={squad2}
          maxPlayers={2}
          currentCounts={{ male: squad2.filter(p => p.gender === 'male').length, female: squad2.filter(p => p.gender === 'female').length }}
          requirements={{ male: 0, female: 0, any: 2 }}
          isLoading={isUpdating !== null}
          showMoveButton={false}
          moveDirection="down"
          onMovePlayer={() => {}}
          isUpdatingPlayer={isUpdating}
        />
      </div>
    );
  }

  // Standard layout: Starters and Substitutes
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RosterZone
          title="Starters"
          subtitle={`${starterRequirements.male} Male, ${starterRequirements.female} Female`}
          players={starters}
          maxPlayers={starterRequirements.total}
          currentCounts={starterCounts}
          requirements={starterRequirements}
          isLoading={isUpdating !== null}
          showMoveButton={substituteRequirements.total > 0}
          moveDirection="down"
          onMovePlayer={handleMovePlayer}
          isUpdatingPlayer={isUpdating}
        />

        <RosterZone
          title="Substitutes"
          subtitle={`${substituteRequirements.male} Male, ${substituteRequirements.female} Female`}
          players={substitutes}
          maxPlayers={substituteRequirements.total}
          currentCounts={substituteCounts}
          requirements={substituteRequirements}
          isLoading={isUpdating !== null}
          showMoveButton={true}
          moveDirection="up"
          onMovePlayer={handleMovePlayer}
          isUpdatingPlayer={isUpdating}
        />
      </div>

      <SwapPlayerModal
        open={swapModal.open}
        onOpenChange={(open) => setSwapModal(prev => ({ ...prev, open }))}
        player={swapModal.player}
        targetIsStarter={swapModal.targetIsStarter}
        eligiblePlayers={swapModal.eligiblePlayers}
        onConfirm={handleSwapConfirm}
      />
    </>
  );
}
